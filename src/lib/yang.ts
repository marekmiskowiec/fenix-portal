const MONTHS_PL = [
  "stycznia","lutego","marca","kwietnia","maja","czerwca",
  "lipca","sierpnia","września","października","listopada","grudnia",
];

export function formatYang(yang: number): string {
  const abs = Math.abs(yang);
  const sign = yang < 0 ? "-" : yang > 0 ? "+" : "";
  if (abs === 0) return "0kk";
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2).replace(/\.?0+$/, "")}kk`;
  }
  if (abs >= 1_000) {
    const val = abs / 1_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(0)}k`;
  }
  return `${sign}${abs}`;
}

export function formatYangBalance(yang: number): string {
  const abs = Math.abs(yang);
  const sign = yang < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2).replace(/\.?0+$/, "")}kk`;
  }
  if (abs >= 1_000) return `${sign}${Math.round(abs / 1_000)}k`;
  return `${sign}${abs}`;
}

// Returns the Monday (00:00 local) of the week containing `date`
export function getWeekMonday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekSunday(monday: Date): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  return d;
}

export function formatWeekPL(monday: Date): string {
  const sunday = getWeekSunday(monday);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const sameYear = monday.getFullYear() === sunday.getFullYear();

  if (sameMonth && sameYear) {
    return `${monday.getDate()} - ${sunday.getDate()} ${MONTHS_PL[sunday.getMonth()]} ${sunday.getFullYear()}`;
  }
  if (sameYear) {
    return `${monday.getDate()} ${MONTHS_PL[monday.getMonth()]} - ${sunday.getDate()} ${MONTHS_PL[sunday.getMonth()]} ${sunday.getFullYear()}`;
  }
  return `${monday.getDate()} ${MONTHS_PL[monday.getMonth()]} ${monday.getFullYear()} - ${sunday.getDate()} ${MONTHS_PL[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

export const WEEKLY_DUE = 500_000;
