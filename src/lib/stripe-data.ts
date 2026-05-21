import Stripe from "stripe";
import { unstable_cache } from "next/cache";
import { SWIPCODE_PRODUCT_IDS, STUDIONOTE_PRODUCT_IDS } from "./stripe-products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function productId(
  p: string | Stripe.Product | Stripe.DeletedProduct | null | undefined
): string | null {
  if (!p) return null;
  return typeof p === "string" ? p : p.id;
}

async function paginateInvoices(
  params: Stripe.InvoiceListParams
): Promise<Stripe.Invoice[]> {
  const all: Stripe.Invoice[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await stripe.invoices.list({
      ...params,
      limit: 100,
      ...(cursor ? { starting_after: cursor } : {}),
    });
    all.push(...page.data);
    if (!page.has_more || page.data.length === 0) break;
    cursor = page.data.at(-1)!.id;
  }
  return all;
}

function lineProductId(line: Stripe.InvoiceLineItem): string | null {
  return line.pricing?.price_details?.product ?? null;
}

function sumLineItems(
  invoices: Stripe.Invoice[]
): { swipcode: number; studionote: number } {
  let swipcode = 0,
    studionote = 0;
  for (const inv of invoices) {
    for (const line of inv.lines.data) {
      const pid = lineProductId(line);
      if (!pid) continue;
      const amount = line.amount / 100;
      if (SWIPCODE_PRODUCT_IDS.includes(pid)) swipcode += amount;
      else if (STUDIONOTE_PRODUCT_IDS.includes(pid)) studionote += amount;
    }
  }
  return { swipcode, studionote };
}

export const getStripeCAByPeriod = unstable_cache(
  async (
    startTs: number,
    endTs: number
  ): Promise<{ swipcode: number; studionote: number; error?: string }> => {
    try {
      const invoices = await paginateInvoices({
        status: "paid",
        created: { gte: startTs, lte: endTs },
      });
      return sumLineItems(invoices);
    } catch (e) {
      return { swipcode: 0, studionote: 0, error: String(e) };
    }
  },
  ["stripe-ca-period"],
  { revalidate: 300 }
);

export const getStripeCAByYear = unstable_cache(
  async (
    year: number
  ): Promise<{
    annual: { swipcode: number; studionote: number };
    monthly: { swipcode: number[]; studionote: number[] };
    error?: string;
  }> => {
    try {
      const startTs = Math.floor(new Date(year, 0, 1).getTime() / 1000);
      const endTs = Math.floor(new Date(year + 1, 0, 1).getTime() / 1000) - 1;
      const invoices = await paginateInvoices({
        status: "paid",
        created: { gte: startTs, lte: endTs },
      });

      const monthly = {
        swipcode: new Array(12).fill(0) as number[],
        studionote: new Array(12).fill(0) as number[],
      };

      for (const inv of invoices) {
        const paidAt = inv.status_transitions?.paid_at;
        const date = paidAt
          ? new Date(paidAt * 1000)
          : new Date((inv.created ?? 0) * 1000);
        const m = date.getMonth();

        for (const line of inv.lines.data) {
          const pid = lineProductId(line);
          if (!pid) continue;
          const amount = line.amount / 100;
          if (SWIPCODE_PRODUCT_IDS.includes(pid)) monthly.swipcode[m] += amount;
          else if (STUDIONOTE_PRODUCT_IDS.includes(pid)) monthly.studionote[m] += amount;
        }
      }

      const annual = {
        swipcode: monthly.swipcode.reduce((a, b) => a + b, 0),
        studionote: monthly.studionote.reduce((a, b) => a + b, 0),
      };

      return { annual, monthly };
    } catch (e) {
      return {
        annual: { swipcode: 0, studionote: 0 },
        monthly: {
          swipcode: new Array(12).fill(0),
          studionote: new Array(12).fill(0),
        },
        error: String(e),
      };
    }
  },
  ["stripe-ca-year"],
  { revalidate: 300 }
);

export const getStudioNoteInstant = unstable_cache(
  async (): Promise<{ mrr: number; subscribers: number; error?: string }> => {
    try {
      const subs: Stripe.Subscription[] = [];
      let cursor: string | undefined;
      for (;;) {
        const page = await stripe.subscriptions.list({
          status: "active",
          limit: 100,
          expand: ["data.items.data.price.product"],
          ...(cursor ? { starting_after: cursor } : {}),
        });
        subs.push(...page.data);
        if (!page.has_more || page.data.length === 0) break;
        cursor = page.data.at(-1)!.id;
      }

      let mrr = 0;
      let subscribers = 0;

      for (const sub of subs) {
        let isStudioNote = false;
        for (const item of sub.items.data) {
          const pid = productId(item.price.product);
          if (!pid || !STUDIONOTE_PRODUCT_IDS.includes(pid)) continue;
          isStudioNote = true;
          const unitAmount = (item.price.unit_amount ?? 0) / 100;
          const qty = item.quantity ?? 1;
          if (item.price.recurring?.interval === "year") {
            mrr += (unitAmount * qty) / 12;
          } else {
            mrr += unitAmount * qty;
          }
        }
        if (isStudioNote) subscribers++;
      }

      return { mrr, subscribers };
    } catch (e) {
      return { mrr: 0, subscribers: 0, error: String(e) };
    }
  },
  ["stripe-studionote-instant"],
  { revalidate: 300 }
);
