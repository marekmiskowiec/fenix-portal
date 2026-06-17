"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MaterialRequestForm } from "@/components/material-request-form";
import { acceptMaterialRequest, rejectMaterialRequest } from "@/app/dashboard/gildia/materialy-actions";

type Ranking = {
  userId: string;
  name: string | null;
  image: string | null;
  dykta: number;
  pien: number;
  kamien: number;
  bodzio: number;
  kamienDuchowy: number;
  yang: number;
  total: number;
};

type HistoryEntry = {
  id: string;
  createdAt: Date;
  status: string;
  dykta: number;
  pien: number;
  kamien: number;
  bodzio: number;
  kamienDuchowy: number;
  yang: number;
  user: { name: string | null; image: string | null };
  resolvedBy: { name: string | null } | null;
};

type PendingRequest = {
  id: string;
  createdAt: Date;
  dykta: number;
  pien: number;
  kamien: number;
  bodzio: number;
  kamienDuchowy: number;
  yang: number;
  user: { id: string; name: string | null; image: string | null };
};

type FilterKey = "total" | "dykta" | "pien" | "kamien" | "bodzio" | "kamienDuchowy" | "yang";

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: "total",         label: "Suma" },
  { key: "dykta",         label: "Dykta" },
  { key: "pien",          label: "Pień" },
  { key: "kamien",        label: "Kamień" },
  { key: "bodzio",        label: "Bodzio" },
  { key: "kamienDuchowy", label: "Kamień Duch." },
  { key: "yang",          label: "Yang (kk)" },
];

function formatItems(r: { dykta: number; pien: number; kamien: number; bodzio: number; kamienDuchowy: number; yang: number }) {
  const parts: string[] = [];
  if (r.dykta > 0)         parts.push(`Dykta ×${r.dykta}`);
  if (r.pien > 0)          parts.push(`Pień ×${r.pien}`);
  if (r.kamien > 0)        parts.push(`Kamień ×${r.kamien}`);
  if (r.bodzio > 0)        parts.push(`Bodzio ×${r.bodzio}`);
  if (r.kamienDuchowy > 0) parts.push(`K.Duch. ×${r.kamienDuchowy}`);
  if (r.yang > 0)          parts.push(`Yang ${r.yang}kk`);
  return parts.join(", ");
}

function PodiumStep({ rank, entry, value, label }: {
  rank: 1 | 2 | 3;
  entry: Ranking | undefined;
  value: number;
  label: string;
}) {
  const heights = { 1: "h-24", 2: "h-16", 3: "h-10" };
  const medals  = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const colors  = {
    1: "bg-amber-500/20 border-amber-500/40",
    2: "bg-zinc-400/10 border-zinc-400/30",
    3: "bg-orange-900/20 border-orange-700/30",
  };

  if (!entry) return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-28 ${heights[rank]} rounded-t-lg border ${colors[rank]} flex items-center justify-center text-zinc-600 text-sm`}>
        —
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="w-10 h-10 border-2 border-zinc-700">
        <AvatarImage src={entry.image ?? undefined} />
        <AvatarFallback className="text-sm bg-zinc-700">{entry.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
      </Avatar>
      <p className="text-xs text-zinc-300 font-medium text-center max-w-[7rem] truncate">{entry.name ?? "—"}</p>
      <p className="text-xs text-zinc-500">{value} {label}</p>
      <div className={`w-28 ${heights[rank]} rounded-t-lg border ${colors[rank]} flex items-center justify-center text-2xl`}>
        {medals[rank]}
      </div>
    </div>
  );
}

function PendingPanel({ requests, onAccept, onReject }: {
  requests: PendingRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">
      Brak oczekujących próśb.
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {requests.map((r) => (
        <div key={r.id} className="rounded-lg border border-amber-800/40 bg-amber-900/10 p-3 flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={r.user.image ?? undefined} />
            <AvatarFallback className="text-xs bg-zinc-700">{r.user.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">{r.user.name ?? "—"}</p>
            <p className="text-xs text-zinc-400 truncate">{formatItems(r)}</p>
            <p className="text-xs text-zinc-600">{new Date(r.createdAt).toLocaleString("pl-PL")}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              disabled={pending}
              onClick={() => startTransition(() => onAccept(r.id))}
              className="px-3 py-1 rounded text-xs font-medium bg-green-800/60 text-green-300 hover:bg-green-700/60 disabled:opacity-40 transition-colors"
            >
              Przyjmij
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => onReject(r.id))}
              className="px-3 py-1 rounded text-xs font-medium bg-red-900/60 text-red-300 hover:bg-red-800/60 disabled:opacity-40 transition-colors"
            >
              Odrzuć
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MateriałyTabClient({
  rankings,
  history,
  pendingRequests,
  canResolve,
}: {
  rankings: Ranking[];
  history: HistoryEntry[];
  pendingRequests: PendingRequest[];
  canResolve: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("total");
  const [historyOpen, setHistoryOpen] = useState(false);

  const sorted = [...rankings].sort((a, b) => b[filter] - a[filter]).filter((r) => r[filter] > 0);
  const top3 = sorted.slice(0, 3);

  const filterLabel = FILTER_LABELS.find((f) => f.key === filter)?.label ?? "";

  return (
    <div className="flex flex-col gap-6">
      {/* Action button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Materiały Gildijne</h2>
        <MaterialRequestForm />
      </div>

      {/* Pending requests panel — only for ADMINISTRATOR/BANK */}
      {canResolve && (
        <div>
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            Oczekujące prośby ({pendingRequests.length})
          </h3>
          <PendingPanel
            requests={pendingRequests}
            onAccept={acceptMaterialRequest}
            onReject={rejectMaterialRequest}
          />
        </div>
      )}

      {/* Ranking */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-zinc-300">Ranking oddanych materiałów</h3>
          <div className="flex gap-1 flex-wrap">
            {FILTER_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
            Brak oddanych materiałów.
          </div>
        ) : (
          <>
            {/* Podium for top 3 */}
            {sorted.length >= 1 && (
              <div className="flex items-end justify-center gap-4 mb-6 pt-4">
                {/* 2nd */}
                <PodiumStep rank={2} entry={top3[1]} value={top3[1]?.[filter] ?? 0} label={filterLabel} />
                {/* 1st */}
                <PodiumStep rank={1} entry={top3[0]} value={top3[0]?.[filter] ?? 0} label={filterLabel} />
                {/* 3rd */}
                <PodiumStep rank={3} entry={top3[2]} value={top3[2]?.[filter] ?? 0} label={filterLabel} />
              </div>
            )}

            {/* Full ranking table */}
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium w-10">#</th>
                    <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Gracz</th>
                    <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">Dykta</th>
                    <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">Pień</th>
                    <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">Kamień</th>
                    <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">Bodzio</th>
                    <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">K.Duch.</th>
                    <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">Yang (kk)</th>
                    <th className="px-4 py-2.5 text-right text-xs text-zinc-500 font-medium">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row, i) => (
                    <tr
                      key={row.userId}
                      className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors ${
                        i < 3 ? "bg-zinc-900" : "bg-zinc-950"
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                          <span className="text-xs text-zinc-500">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={row.image ?? undefined} />
                            <AvatarFallback className="text-xs bg-zinc-700">{row.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-zinc-200 font-medium">{row.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums ${filter === "dykta" ? "text-amber-400 font-bold" : "text-zinc-400"}`}>{row.dykta || "—"}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${filter === "pien" ? "text-amber-400 font-bold" : "text-zinc-400"}`}>{row.pien || "—"}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${filter === "kamien" ? "text-amber-400 font-bold" : "text-zinc-400"}`}>{row.kamien || "—"}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${filter === "bodzio" ? "text-amber-400 font-bold" : "text-zinc-400"}`}>{row.bodzio || "—"}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${filter === "kamienDuchowy" ? "text-amber-400 font-bold" : "text-zinc-400"}`}>{row.kamienDuchowy || "—"}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${filter === "yang" ? "text-amber-400 font-bold" : "text-zinc-400"}`}>{row.yang || "—"}</td>
                      <td className={`px-4 py-3 text-right tabular-nums font-semibold ${filter === "total" ? "text-amber-400" : "text-zinc-300"}`}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Historia wpłat */}
      <div>
        <button
          onClick={() => setHistoryOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <span className={`transition-transform ${historyOpen ? "rotate-90" : ""}`}>▶</span>
          Historia wpłat ({history.length})
        </button>

        {historyOpen && (
          <div className="mt-3 rounded-lg border border-zinc-800 overflow-hidden">
            {history.length === 0 ? (
              <p className="p-6 text-center text-zinc-500 text-sm">Brak wpisów.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Data</th>
                    <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Gracz</th>
                    <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Materiały</th>
                    <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs text-zinc-500 font-medium">Rozpatrzył</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} className="border-b border-zinc-800/60 last:border-0 bg-zinc-950 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={entry.user.image ?? undefined} />
                            <AvatarFallback className="text-xs bg-zinc-700">{entry.user.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-zinc-300 text-xs">{entry.user.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400 max-w-[16rem] truncate">
                        {formatItems(entry)}
                      </td>
                      <td className="px-4 py-3">
                        {entry.status === "ACCEPTED" && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-400 border border-green-800/50">
                            Przyjęto
                          </span>
                        )}
                        {entry.status === "REJECTED" && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400 border border-red-800/50">
                            Odrzucono
                          </span>
                        )}
                        {entry.status === "PENDING" && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Oczekuje
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {entry.resolvedBy?.name ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
