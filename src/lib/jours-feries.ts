// Meeus/Jones/Butcher algorithm
function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function shift(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getJoursFeries(year: number): Set<string> {
  const easter = getEaster(year);
  return new Set([
    `${year}-01-01`,
    `${year}-05-01`,
    `${year}-05-08`,
    `${year}-07-14`,
    `${year}-08-15`,
    `${year}-11-01`,
    `${year}-11-11`,
    `${year}-12-25`,
    fmt(shift(easter, 1)),   // Lundi de Pâques
    fmt(shift(easter, 39)),  // Ascension
    fmt(shift(easter, 50)),  // Lundi de Pentecôte
  ]);
}

export const DAY_INDEX: Record<string, number> = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

// All days in month matching jours_travailles (no holiday/exclusion filter)
export function getAllPotentialDays(
  year: number,
  month: number,
  joursTravailles: string[],
): string[] {
  const allowed = new Set(joursTravailles.map((j) => DAY_INDEX[j]).filter((v) => v !== undefined));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const str = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (allowed.has(new Date(year, month, d).getDay())) result.push(str);
  }
  return result;
}

export function getDurationHours(debut: string, fin: string): number {
  const [h1, m1] = debut.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
}
