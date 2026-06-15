function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function getDayLabel(date: Date, now: Date = new Date()): string {
  const d = startOfDay(date).getTime();
  const today = startOfDay(now).getTime();
  const ONE_DAY = 86_400_000;

  if (d === today) return "dzisiaj";
  if (d === today + ONE_DAY) return "jutro";
  if (d === today - ONE_DAY) return "wczoraj";
  return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatHHMM(date: Date): string {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

export function formatHHMMSS(date: Date): string {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatKillTime(killedAt: Date | null, now: Date = new Date()): string {
  if (!killedAt) return "—";
  return `${formatHHMM(killedAt)} ${getDayLabel(killedAt, now)}`;
}

export function formatRespawnRange(killedAt: Date | null, now: Date = new Date()): string {
  if (!killedAt) return "—";
  const from = new Date(killedAt.getTime() + 2 * 60 * 60 * 1000);
  const to   = new Date(killedAt.getTime() + 4 * 60 * 60 * 1000);
  const fromLabel = getDayLabel(from, now);
  const toLabel   = getDayLabel(to, now);

  if (fromLabel === toLabel) {
    return `${formatHHMM(from)} – ${formatHHMM(to)} ${fromLabel}`;
  }
  return `${formatHHMM(from)} ${fromLabel} – ${formatHHMM(to)} ${toLabel}`;
}
