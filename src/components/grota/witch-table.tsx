"use client";

import { useState, useEffect, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import {
  markWitchKilled,
  updateWitchKillTime,
  getWitchKills,
} from "@/app/dashboard/grota/actions";
import { formatKillTime, formatRespawnRange } from "@/lib/date-label";

const BROADCAST_CHANNEL = "grota-witch-kills";

interface WitchRow {
  channel: string;
  killedAt: Date | null;
  killedByName: string | null;
}

// Format Date → "YYYY-MM-DDTHH:mm" for datetime-local input
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sortRows(rows: WitchRow[]): WitchRow[] {
  return [...rows].sort((a, b) => {
    if (!a.killedAt && !b.killedAt) return 0;
    if (!a.killedAt) return 1;
    if (!b.killedAt) return -1;
    // Earliest kill = earliest possible respawn → goes to top
    return a.killedAt.getTime() - b.killedAt.getTime();
  });
}

function ConfirmButton({
  onConfirmed,
  disabled,
}: {
  onConfirmed: () => void;
  disabled: boolean;
}) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");

  function handleClick() {
    if (disabled) return;
    if (step === "idle") {
      setStep("confirm");
      setTimeout(() => setStep("idle"), 4000);
    } else {
      onConfirmed();
      setStep("idle");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled && step === "idle"}
      className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
        step === "confirm"
          ? "bg-yellow-500 hover:bg-yellow-400 text-black animate-pulse"
          : "bg-red-700 hover:bg-red-600 text-white disabled:opacity-40"
      }`}
    >
      {step === "idle" ? "💀 Zabita" : "⚠ Potwierdź"}
    </button>
  );
}

export function WitchTable() {
  const [rows, setRows] = useState<WitchRow[]>([
    { channel: "ch1", killedAt: null, killedByName: null },
    { channel: "ch3", killedAt: null, killedByName: null },
    { channel: "ch5", killedAt: null, killedByName: null },
  ]);
  const [now, setNow] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Fetch initial data
  useEffect(() => {
    getWitchKills().then((data) => {
      setRows(
        data.map((r) => ({
          channel: r.channel,
          killedAt: r.killedAt ? new Date(r.killedAt) : null,
          killedByName: r.killedByName,
        }))
      );
    });
  }, []);

  // Refresh day labels every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Supabase Realtime
  useEffect(() => {
    const channel = supabase.channel(BROADCAST_CHANNEL);
    channel.on(
      "broadcast",
      { event: "kill" },
      ({
        payload,
      }: {
        payload: { channel: string; killedAt: string; killedByName: string };
      }) => {
        setRows((prev) =>
          prev.map((r) =>
            r.channel === payload.channel
              ? { ...r, killedAt: new Date(payload.killedAt), killedByName: payload.killedByName }
              : r
          )
        );
      }
    );
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function broadcastKill(ch: string, killedAt: Date, killedByName: string) {
    await supabase.channel(BROADCAST_CHANNEL).send({
      type: "broadcast",
      event: "kill",
      payload: { channel: ch, killedAt: killedAt.toISOString(), killedByName },
    });
  }

  function handleKillNow(ch: string) {
    startTransition(async () => {
      await markWitchKilled(ch);
      const killedAt = new Date();
      const updated = await getWitchKills();
      const killedByName = updated.find((r) => r.channel === ch)?.killedByName ?? "—";
      await broadcastKill(ch, killedAt, killedByName);
      setRows((prev) =>
        prev.map((r) => (r.channel === ch ? { ...r, killedAt, killedByName } : r))
      );
    });
  }

  function startEdit(row: WitchRow) {
    setEditingChannel(row.channel);
    setEditValue(row.killedAt ? toDatetimeLocal(row.killedAt) : toDatetimeLocal(new Date()));
  }

  function cancelEdit() {
    setEditingChannel(null);
    setEditValue("");
  }

  function handleSaveEdit(ch: string) {
    if (!editValue) return;
    startTransition(async () => {
      const killedAt = new Date(editValue);
      await updateWitchKillTime(ch, killedAt);
      const updated = await getWitchKills();
      const killedByName = updated.find((r) => r.channel === ch)?.killedByName ?? "—";
      await broadcastKill(ch, killedAt, killedByName);
      setRows((prev) =>
        prev.map((r) => (r.channel === ch ? { ...r, killedAt, killedByName } : r))
      );
      setEditingChannel(null);
    });
  }

  const sorted = sortRows(rows);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
        Respawny Wiedźmy
      </h3>
      <div className="w-full rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-800/80 border-b border-zinc-700">
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide w-20">
                Channel
              </th>
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">
                Czas zbicia
              </th>
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">
                Czas respu (2–4h)
              </th>
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">
                Dodane przez
              </th>
              <th className="px-4 py-3 w-48" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const isEditing = editingChannel === row.channel;
              const isFirst = idx === 0 && row.killedAt !== null;

              return (
                <tr
                  key={row.channel}
                  className={`border-b border-zinc-800 last:border-0 transition-colors ${
                    isFirst ? "bg-red-900/10" : "hover:bg-zinc-800/30"
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {isFirst && <span className="text-red-400 text-xs">▲</span>}
                      <span className="font-bold text-red-400">{row.channel}</span>
                    </div>
                  </td>

                  {/* Kill time — normal or edit mode */}
                  <td className="px-4 py-3 text-sm text-zinc-200 tabular-nums">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    ) : (
                      formatKillTime(row.killedAt, now)
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm tabular-nums">
                    {!isEditing && row.killedAt ? (
                      <span className="text-amber-400">
                        {formatRespawnRange(row.killedAt, now)}
                      </span>
                    ) : !isEditing ? (
                      <span className="text-zinc-600">—</span>
                    ) : null}
                  </td>

                  <td className="px-4 py-4 text-sm text-zinc-400">
                    {row.killedByName ?? "—"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(row.channel)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 whitespace-nowrap"
                          >
                            Zapisz
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 rounded text-xs font-bold bg-zinc-700 hover:bg-zinc-600 text-white whitespace-nowrap"
                          >
                            Anuluj
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(row)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 disabled:opacity-40 whitespace-nowrap"
                          >
                            ✏ Edytuj
                          </button>
                          <ConfirmButton
                            disabled={isPending}
                            onConfirmed={() => handleKillNow(row.channel)}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {isPending && (
          <div className="text-center text-xs text-zinc-500 py-2 border-t border-zinc-800">
            Zapisywanie…
          </div>
        )}
      </div>
    </div>
  );
}
