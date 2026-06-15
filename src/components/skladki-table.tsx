"use client";

import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VacationDialog } from "@/components/vacation-dialog";
import type { Character } from "@prisma/client";

interface Member {
  id: string;
  name: string;
  image: string | null;
  discordId: string | null;
  characters: Character[];
  balance: number;
  balanceFormatted: string;
  activeVacation: { weeks: number; weekStart: Date } | null;
  pendingVacation: { weeks: number; weekStart: Date } | null;
  vacations: { id: string; weeks: number; weekStart: Date; approved: boolean; reason: string | null }[];
}

export function SkladkiTable({ members }: { members: Member[] }) {
  const [search, setSearch] = useState("");
  const [onlyUnpaid, setOnlyUnpaid] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      if (onlyUnpaid && m.balance >= 0) return false;
      if (!q) return true;
      if (m.name.toLowerCase().includes(q)) return true;
      if (m.characters.some((c) => c.name.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [members, search, onlyUnpaid]);

  function copyMember(m: Member) {
    const mention = m.discordId ? `<@${m.discordId}>` : `@${m.name}`;
    const text = `${mention} bilans: ${m.balanceFormatted}`;
    navigator.clipboard.writeText(text);
    setCopied(m.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAll() {
    const lines = filtered
      .filter((m) => m.balance < 0)
      .map((m) => {
        const mention = m.discordId ? `<@${m.discordId}>` : `@${m.name}`;
        return `${mention} bilans: ${m.balanceFormatted}`;
      })
      .join("\n");
    navigator.clipboard.writeText(lines);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Szukaj po nicku DC lub postaci..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 flex-1"
        />
        <Button
          variant={onlyUnpaid ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyUnpaid((v) => !v)}
          className={
            onlyUnpaid
              ? "bg-red-700 hover:bg-red-600 text-white border-transparent"
              : "border-zinc-700 text-zinc-300"
          }
        >
          Tylko zalegający
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyAll}
          className="border-zinc-700 text-zinc-300"
        >
          Kopiuj zalegających
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/80">
              <TableHead className="text-zinc-400 w-10">Nr</TableHead>
              <TableHead className="text-zinc-400">Nick DC</TableHead>
              <TableHead className="text-zinc-400">Postacie</TableHead>
              <TableHead className="text-zinc-400 text-right">Bilans</TableHead>
              <TableHead className="text-zinc-400 text-center">Urlop</TableHead>
              <TableHead className="text-zinc-400 text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                  Brak wyników.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((member, idx) => (
              <TableRow key={member.id} className="border-zinc-800 hover:bg-zinc-800/40">
                <TableCell className="text-zinc-500 text-sm">{idx + 1}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {member.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.image} alt="" className="w-6 h-6 rounded-full" />
                    )}
                    <span className="text-white font-medium">{member.name}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {member.characters.length === 0 ? (
                      <span className="text-zinc-600 text-xs">—</span>
                    ) : (
                      member.characters.map((c) => (
                        <span key={c.id} className="text-xs text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {c.name}
                        </span>
                      ))
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <span
                    className={`font-semibold tabular-nums ${
                      member.balance > 0
                        ? "text-green-400"
                        : member.balance < 0
                        ? "text-red-400"
                        : "text-zinc-400"
                    }`}
                  >
                    {member.balance > 0 ? "+" : ""}{member.balanceFormatted}
                  </span>
                </TableCell>

                <TableCell className="text-center">
                  {member.activeVacation ? (
                    <Badge className="bg-blue-900/30 text-blue-400 border-blue-700/40 text-xs">
                      {member.activeVacation.weeks}t urlop
                    </Badge>
                  ) : member.pendingVacation ? (
                    <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700/40 text-xs">
                      oczekuje
                    </Badge>
                  ) : (
                    <span className="text-zinc-600 text-xs">—</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-zinc-400 h-7 px-2 hover:text-white"
                      onClick={() => copyMember(member)}
                    >
                      {copied === member.id ? "✓" : "@"}
                    </Button>
                    <VacationDialog
                      userId={member.id}
                      userName={member.name}
                      trigger={
                        <Button size="sm" variant="ghost" className="text-xs text-zinc-400 h-7 px-2 hover:text-blue-400">
                          Urlop
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-zinc-600 text-right">
        {filtered.length} z {members.length} członków
      </p>
    </div>
  );
}
