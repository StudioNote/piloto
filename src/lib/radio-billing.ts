import { getAllPotentialDays, getDurationHours } from "./jours-feries";

export interface RadioTranche {
  radio_id: string;
  tranche_debut: string;
  tranche_fin: string;
  jours_travailles: string[];
  tarif_horaire: number | string;
}

export interface RadioSupplement {
  radio_id: string;
  montant: number | string;
}

export interface RadioRemplacement {
  date_debut: string;
  date_fin: string;
  tranche_debut: string;
  tranche_fin: string;
  tarif_horaire: number | string;
}

/** Monthly billing for one radio: tranches + recurring supplements, minus exclusions. */
export function calcRadioMonthAmount(
  tranches: RadioTranche[],
  exclusionSet: Set<string>,
  supplements: RadioSupplement[],
  year: number,
  month: number, // 0-indexed
): number {
  const potentialMap: Record<string, true> = {};
  for (const t of tranches) {
    getAllPotentialDays(year, month, t.jours_travailles).forEach((d) => {
      potentialMap[d] = true;
    });
  }
  const workedUnion = Object.keys(potentialMap).filter((d) => !exclusionSet.has(d));

  const hoursAmount = tranches.reduce((sum, t) => {
    const potential = getAllPotentialDays(year, month, t.jours_travailles);
    const worked = potential.filter((d) => !exclusionSet.has(d));
    return (
      sum +
      worked.length *
        getDurationHours(t.tranche_debut, t.tranche_fin) *
        Number(t.tarif_horaire)
    );
  }, 0);

  const recurringTotal = supplements.reduce(
    (sum, s) => sum + Number(s.montant) * workedUnion.length,
    0,
  );

  return hoursAmount + recurringTotal;
}

/** Amount for a remplacement overlapping with [periodStart, periodEnd] (YYYY-MM-DD). */
export function calcRemplacementAmountInPeriod(
  r: RadioRemplacement,
  periodStart: string,
  periodEnd: string,
): number {
  const start = r.date_debut > periodStart ? r.date_debut : periodStart;
  const end = r.date_fin < periodEnd ? r.date_fin : periodEnd;
  if (start > end) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const days =
    Math.round(
      (new Date(end + "T00:00:00").getTime() -
        new Date(start + "T00:00:00").getTime()) /
        msPerDay,
    ) + 1;
  return (
    days *
    getDurationHours(r.tranche_debut, r.tranche_fin) *
    Number(r.tarif_horaire)
  );
}
