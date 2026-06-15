import { prisma } from "@/lib/prisma";
import { formatWeekPL, formatYangBalance, getWeekMonday, getWeekSunday, WEEKLY_DUE } from "@/lib/yang";
import { SkladkiTable } from "@/components/skladki-table";

async function getAllMembersData() {
  const users = await prisma.user.findMany({
    include: {
      characters: { orderBy: { createdAt: "asc" } },
      dues: true,
      payments: true,
      vacations: { orderBy: { weekStart: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const currentMonday = getWeekMonday(now);

  return users.map((user) => {
    const totalPaid = user.payments.reduce((s, p) => s + p.amount, 0);
    const totalOwed = user.dues
      .filter((d) => !d.onVacation)
      .reduce((s, d) => s + d.amount, 0);
    const balance = totalPaid - totalOwed;

    const activeVacation = user.vacations.find((v) => {
      if (!v.approved) return false;
      const end = new Date(v.weekStart);
      end.setDate(end.getDate() + v.weeks * 7);
      return now >= v.weekStart && now < end;
    });

    const pendingVacation = user.vacations.find((v) => !v.approved);

    return {
      id: user.id,
      name: user.name ?? "—",
      image: user.image,
      discordId: user.discordId,
      characters: user.characters,
      balance,
      balanceFormatted: formatYangBalance(balance),
      activeVacation: activeVacation
        ? { weeks: activeVacation.weeks, weekStart: activeVacation.weekStart }
        : null,
      pendingVacation: pendingVacation
        ? { weeks: pendingVacation.weeks, weekStart: pendingVacation.weekStart }
        : null,
      vacations: user.vacations,
    };
  });
}

export async function SkladkiTab() {
  const members = await getAllMembersData();
  const now = new Date();
  const monday = getWeekMonday(now);
  const sunday = getWeekSunday(monday);
  const weekLabel = formatWeekPL(monday);
  const rateLabel = formatYangBalance(WEEKLY_DUE);

  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  return (
    <div className="flex flex-col gap-4">
      {/* Info card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Bieżący tydzień</p>
          <p className="text-base font-semibold text-white">{weekLabel}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Stawka składki</p>
          <p className="text-base font-semibold text-amber-400">{rateLabel} / tydzień</p>
          <p className="text-xs text-zinc-600 mt-0.5">pobierana w każdy poniedziałek</p>
        </div>
      </div>

      <SkladkiTable members={members} />
    </div>
  );
}
