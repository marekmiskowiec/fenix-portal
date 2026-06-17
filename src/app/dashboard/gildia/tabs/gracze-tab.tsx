"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type Character = {
  id: string;
  name: string;
  class: string;
  level: number;
  guild: string;
  inGrota: boolean;
  user: {
    name: string | null;
    image: string | null;
  };
};

const CLASS_COLORS: Record<string, string> = {
  Body:   "bg-red-900/60 text-red-300 border-red-800",
  Mental: "bg-purple-900/60 text-purple-300 border-purple-800",
  WP:     "bg-blue-900/60 text-blue-300 border-blue-800",
  BM:     "bg-zinc-700/60 text-zinc-300 border-zinc-600",
  Dagger: "bg-yellow-900/60 text-yellow-300 border-yellow-800",
  Archer: "bg-green-900/60 text-green-300 border-green-800",
  Smok:   "bg-orange-900/60 text-orange-300 border-orange-800",
  Healer: "bg-teal-900/60 text-teal-300 border-teal-800",
};

const GUILD_LABELS: Record<string, string> = {
  Fenix:      "Fenix",
  iFenix:     "iFenix",
  zakonFenix: "Zakon",
};

const GUILDS = ["Wszystkie", "Fenix", "iFenix", "zakonFenix"] as const;

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm text-zinc-500 w-6 text-center">{rank}</span>;
}

export function GraczeTab({ characters }: { characters: Character[] }) {
  const [guildFilter, setGuildFilter] = useState<string>("Wszystkie");

  const filtered =
    guildFilter === "Wszystkie"
      ? characters
      : characters.filter((c) => c.guild === guildFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-zinc-100">Ranking postaci</h2>
        <div className="flex gap-1.5">
          {GUILDS.map((g) => (
            <button
              key={g}
              onClick={() => setGuildFilter(g)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                guildFilter === g
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              {GUILD_LABELS[g] ?? g}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
          Brak postaci w tej gildii.
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium w-12">#</th>
                <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Postać</th>
                <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Klasa</th>
                <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">Poziom</th>
                <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Gildia</th>
                <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Gracz</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((char, i) => (
                <tr
                  key={char.id}
                  className={`border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/30 ${
                    i < 3 ? "bg-zinc-900" : "bg-zinc-950"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <RankBadge rank={i + 1} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{char.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${
                        CLASS_COLORS[char.class] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {char.class}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold tabular-nums ${
                        char.level === 200
                          ? "text-amber-400"
                          : char.level >= 150
                          ? "text-zinc-100"
                          : "text-zinc-300"
                      }`}
                    >
                      {char.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                      {GUILD_LABELS[char.guild] ?? char.guild}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={char.user.image ?? undefined} />
                        <AvatarFallback className="text-xs bg-zinc-700">
                          {char.user.name?.[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-zinc-400 text-xs">{char.user.name ?? "—"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-600 text-right">
        {filtered.length} {filtered.length === 1 ? "postać" : "postaci"}
      </p>
    </div>
  );
}
