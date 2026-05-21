import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import Link from "next/link";

// ─── helpers ─────────────────────────────────────────────────────────────────

const EUR = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function prevMonth(mois: string) {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(mois: string) {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(mois: string) {
  const [y, m] = mois.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function sumMontants(rows: { montant: number | null }[]) {
  return rows.reduce((acc, r) => acc + (r.montant ?? 0), 0);
}

function aggregateByMonth(rows: { date: string; montant: number | null }[]) {
  const t = new Array(12).fill(0);
  for (const r of rows) t[parseInt(r.date.slice(5, 7)) - 1] += r.montant ?? 0;
  return t;
}

function aggregateRadioByMonth(rows: { mois: number; montant: number | null }[]) {
  const t = new Array(12).fill(0);
  for (const r of rows) t[r.mois - 1] += Number(r.montant ?? 0);
  return t;
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface Activity {
  label: string;
  amount: number;
  bar: string;
  bg: string;
  text: string;
  subtleText: string;
}

function ActivityCard({ a, grandTotal }: { a: Activity; grandTotal: number }) {
  const pct = grandTotal > 0 ? ((a.amount / grandTotal) * 100).toFixed(1) : null;
  return (
    <div className={`rounded-xl p-4 ${a.bg}`}>
      <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${a.subtleText}`}>
        {a.label}
      </p>
      <p className={`text-lg font-bold ${a.text}`}>{EUR(a.amount)}</p>
      {pct !== null && (
        <p className={`text-xs mt-0.5 ${a.subtleText}`}>{pct} %</p>
      )}
    </div>
  );
}

function BarChart({ activities, grandTotal }: { activities: Activity[]; grandTotal: number }) {
  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const pct = grandTotal > 0 ? (a.amount / grandTotal) * 100 : 0;
        return (
          <div key={a.label}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-gray-700">{a.label}</span>
              <span className="text-gray-400">
                {grandTotal > 0 ? `${pct.toFixed(1)} % · ${EUR(a.amount)}` : "—"}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${a.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CockpitPage({
  searchParams,
}: {
  searchParams: { vue?: string; mois?: string; annee?: string };
}) {
  const supabase = await createClient();

  const vue = searchParams.vue === "annuelle" ? "annuelle" : "mensuelle";
  const currentMois = searchParams.mois ?? new Date().toISOString().slice(0, 7);
  const currentAnnee = Number(searchParams.annee) || new Date().getFullYear();

  const [year, month] = currentMois.split("-").map(Number);
  const debutMois = `${currentMois}-01`;
  const finMois = `${currentMois}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
  const debutAnnee = `${currentAnnee}-01-01`;
  const finAnnee = `${currentAnnee}-12-31`;

  // ── data fetching ──────────────────────────────────────────────────────────

  let sosTotal = 0, builderTotal = 0, voixoffTotal = 0, radioTotal = 0;
  let byMonth: {
    sos: number[]; builder: number[]; voixoff: number[]; radio: number[];
  } | null = null;

  if (vue === "mensuelle") {
    const [sos, builder, voixoff, radio] = await Promise.all([
      supabase.from("piloto_interventions").select("montant")
        .gte("date", debutMois).lte("date", finMois),
      supabase.from("piloto_builder_prestations").select("montant")
        .gte("date", debutMois).lte("date", finMois),
      supabase.from("piloto_voixoff_prestations").select("montant")
        .gte("date", debutMois).lte("date", finMois),
      supabase.from("piloto_radio_factures").select("montant")
        .eq("annee", year).eq("mois", month),
    ]);
    sosTotal = sumMontants(sos.data ?? []);
    builderTotal = sumMontants(builder.data ?? []);
    voixoffTotal = sumMontants(voixoff.data ?? []);
    radioTotal = sumMontants(radio.data ?? []);
  } else {
    const [sos, builder, voixoff, radio] = await Promise.all([
      supabase.from("piloto_interventions").select("date, montant")
        .gte("date", debutAnnee).lte("date", finAnnee),
      supabase.from("piloto_builder_prestations").select("date, montant")
        .gte("date", debutAnnee).lte("date", finAnnee),
      supabase.from("piloto_voixoff_prestations").select("date, montant")
        .gte("date", debutAnnee).lte("date", finAnnee),
      supabase.from("piloto_radio_factures").select("mois, montant")
        .eq("annee", currentAnnee),
    ]);

    const sosData = sos.data ?? [];
    const builderData = builder.data ?? [];
    const voixoffData = voixoff.data ?? [];
    const radioData = radio.data ?? [];

    sosTotal = sumMontants(sosData);
    builderTotal = sumMontants(builderData);
    voixoffTotal = sumMontants(voixoffData);
    radioTotal = radioData.reduce((acc, r) => acc + Number(r.montant ?? 0), 0);

    byMonth = {
      sos: aggregateByMonth(sosData),
      builder: aggregateByMonth(builderData),
      voixoff: aggregateByMonth(voixoffData),
      radio: aggregateRadioByMonth(radioData as { mois: number; montant: number | null }[]),
    };
  }

  const grandTotal = sosTotal + builderTotal + voixoffTotal + radioTotal;

  const activities: Activity[] = [
    {
      label: "SOS Ordi",
      amount: sosTotal,
      bar: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-800",
      subtleText: "text-blue-500",
    },
    {
      label: "Builder",
      amount: builderTotal,
      bar: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-800",
      subtleText: "text-amber-500",
    },
    {
      label: "Voix-Off",
      amount: voixoffTotal,
      bar: "bg-violet-500",
      bg: "bg-violet-50",
      text: "text-violet-800",
      subtleText: "text-violet-500",
    },
    {
      label: "Radio",
      amount: radioTotal,
      bar: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      subtleText: "text-emerald-500",
    },
  ];

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Cockpit" }]} />

      {/* Title + toggle */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Cockpit financier</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Link
            href={`/admin/cockpit?vue=mensuelle&mois=${currentMois}&annee=${currentAnnee}`}
            className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
              vue === "mensuelle"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mensuel
          </Link>
          <Link
            href={`/admin/cockpit?vue=annuelle&annee=${currentAnnee}&mois=${currentMois}`}
            className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
              vue === "annuelle"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Annuel
          </Link>
        </div>
      </div>

      {/* Grand total hero */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          {vue === "mensuelle" ? (
            <>
              <Link
                href={`/admin/cockpit?vue=mensuelle&mois=${prevMonth(currentMois)}&annee=${currentAnnee}`}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                ←
              </Link>
              <span className="text-sm font-medium text-gray-300 capitalize">
                {formatMonthLabel(currentMois)}
              </span>
              <Link
                href={`/admin/cockpit?vue=mensuelle&mois=${nextMonth(currentMois)}&annee=${currentAnnee}`}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                →
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/admin/cockpit?vue=annuelle&annee=${currentAnnee - 1}&mois=${currentMois}`}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                ←
              </Link>
              <span className="text-sm font-medium text-gray-300">{currentAnnee}</span>
              <Link
                href={`/admin/cockpit?vue=annuelle&annee=${currentAnnee + 1}&mois=${currentMois}`}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                →
              </Link>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CA total</p>
        <p className="text-4xl font-bold text-white">{EUR(grandTotal)}</p>
      </div>

      {/* Activity cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {activities.map((a) => (
          <ActivityCard key={a.label} a={a} grandTotal={grandTotal} />
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Répartition</p>
        <BarChart activities={activities} grandTotal={grandTotal} />
      </div>

      {/* Monthly breakdown — annual view only */}
      {vue === "annuelle" && byMonth && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">
            Évolution mensuelle {currentAnnee}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2.5 pr-4 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Mois
                  </th>
                  <th className="text-right pb-2.5 px-2 text-xs font-medium text-blue-500">
                    SOS Ordi
                  </th>
                  <th className="text-right pb-2.5 px-2 text-xs font-medium text-amber-500">
                    Builder
                  </th>
                  <th className="text-right pb-2.5 px-2 text-xs font-medium text-violet-500">
                    Voix-Off
                  </th>
                  <th className="text-right pb-2.5 px-2 text-xs font-medium text-emerald-500">
                    Radio
                  </th>
                  <th className="text-right pb-2.5 pl-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MONTH_NAMES.map((name, i) => {
                  const rowTotal =
                    byMonth!.sos[i] +
                    byMonth!.builder[i] +
                    byMonth!.voixoff[i] +
                    byMonth!.radio[i];
                  return (
                    <tr key={i} className={rowTotal === 0 ? "opacity-35" : ""}>
                      <td className="py-2.5 pr-4 font-medium text-gray-700">{name}</td>
                      <td className="py-2.5 px-2 text-right text-gray-500 tabular-nums">
                        {byMonth!.sos[i] > 0 ? EUR(byMonth!.sos[i]) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-500 tabular-nums">
                        {byMonth!.builder[i] > 0 ? EUR(byMonth!.builder[i]) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-500 tabular-nums">
                        {byMonth!.voixoff[i] > 0 ? EUR(byMonth!.voixoff[i]) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-500 tabular-nums">
                        {byMonth!.radio[i] > 0 ? EUR(byMonth!.radio[i]) : "—"}
                      </td>
                      <td className="py-2.5 pl-4 text-right font-semibold text-gray-800 tabular-nums">
                        {rowTotal > 0 ? EUR(rowTotal) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="pt-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total
                  </td>
                  <td className="pt-3 px-2 text-right text-xs font-semibold text-blue-700 tabular-nums">
                    {EUR(sosTotal)}
                  </td>
                  <td className="pt-3 px-2 text-right text-xs font-semibold text-amber-700 tabular-nums">
                    {EUR(builderTotal)}
                  </td>
                  <td className="pt-3 px-2 text-right text-xs font-semibold text-violet-700 tabular-nums">
                    {EUR(voixoffTotal)}
                  </td>
                  <td className="pt-3 px-2 text-right text-xs font-semibold text-emerald-700 tabular-nums">
                    {EUR(radioTotal)}
                  </td>
                  <td className="pt-3 pl-4 text-right text-xs font-bold text-gray-900 tabular-nums">
                    {EUR(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
