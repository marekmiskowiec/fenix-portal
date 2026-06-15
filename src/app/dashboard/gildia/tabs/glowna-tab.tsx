"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const FENIX_BUDYNKI = [
  {
    nazwa: "Siedziba II",
    bonus: "5% silny przeciwko potworom. +20 slotów dla graczy w gildii.",
  },
  {
    nazwa: "Alchemik z Nieb. Łez",
    bonus: "60% szans na pomyślne wytworzenie Niebiańskich Łez.",
  },
  {
    nazwa: "Kowal II – Płatnerz",
    bonus: "Kowal ma dodatkową opcję ulepszania przy użyciu zwoju błogosławieństwa. Szansa na ulepszenie +8% w stosunku do Kowala w mieście.",
  },
  {
    nazwa: "Portal",
    bonus: "Możemy teleportować się do ziemi gildii z podstawowych map (przycisk w oknie gildii) 3 razy dziennie (reset o 5:00). Portalem teleportujemy się na podstawowe mapy dowolną ilość razy.",
  },
];

const FENIX_BONUSY = [
  { nazwa: "Lwie Serce",   bonus: "1 pkt: +75 PŻ" },
  { nazwa: "Wrząca Krew",  bonus: "1 pkt: Silny przeciwko ludziom +0.3%" },
  { nazwa: "Spokój Ducha", bonus: "1 pkt: Odporność na umiejętności +0.2%" },
  { nazwa: "Zimna Krew",   bonus: "11 pkt: Odporność na Ludzi +3.3%" },
];

const IFENIX_BONUSY = [
  { nazwa: "Lwie Serce", bonus: "1 pkt: +75 PŻ" },
];

function DataTable({ rows }: { rows: { nazwa: string; bonus: string }[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-4">Brak danych.</p>;
  }
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-zinc-700">
          <th className="text-left text-zinc-400 text-sm font-medium py-3 pr-8 w-48">Nazwa</th>
          <th className="text-left text-zinc-400 text-sm font-medium py-3">Bonus</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.nazwa} className="border-b border-zinc-700/50">
            <td className="font-medium text-amber-400 pr-8 py-4 align-top text-sm">
              {row.nazwa}
            </td>
            <td className="text-zinc-300 py-4 align-top text-sm leading-relaxed">
              {row.bonus}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GuildCard({
  title,
  budynki,
  bonusy,
  accentColor = "text-amber-400",
  borderColor = "border-amber-800/40",
  activeColor = "bg-amber-600 text-white",
}: {
  title: string;
  budynki: { nazwa: string; bonus: string }[];
  bonusy: { nazwa: string; bonus: string }[];
  accentColor?: string;
  borderColor?: string;
  activeColor?: string;
}) {
  const [view, setView] = useState<"budynki" | "bonusy">("budynki");

  return (
    <div className={`bg-zinc-900 border ${borderColor} rounded-xl p-5 flex flex-col gap-3 min-h-64`}>
      <div>
        <p className={`text-base font-semibold ${accentColor}`}>{title}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setView("budynki")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              view === "budynki"
                ? activeColor
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            Budynki
          </button>
          <button
            onClick={() => setView("bonusy")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              view === "bonusy"
                ? activeColor
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            Bonusy
          </button>
        </div>
      </div>
      {view === "budynki" ? <DataTable rows={budynki} /> : <DataTable rows={bonusy} />}
    </div>
  );
}

export function GlownaTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/kowale.png"
        alt="Gildia Fenix"
        className="w-full h-auto rounded-xl border border-zinc-800"
      />

      <div className="flex flex-col gap-4">
        <GuildCard
          title="Gildia Fenix"
          budynki={FENIX_BUDYNKI}
          bonusy={FENIX_BONUSY}
          accentColor="text-amber-400"
          borderColor="border-amber-800/40"
          activeColor="bg-amber-600 text-white"
        />
        <GuildCard
          title="Gildia iFenix"
          budynki={[]}
          bonusy={IFENIX_BONUSY}
          accentColor="text-orange-400"
          borderColor="border-orange-800/40"
          activeColor="bg-orange-600 text-white"
        />
      </div>
    </div>
  );
}
