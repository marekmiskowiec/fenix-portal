"use client";

import { useState, useEffect, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { getBossTimers, markBossKilled, updateBossKillTime, resetBossTimer } from "@/app/dashboard/timery/actions";
import { getDayLabel, formatHHMMSS } from "@/lib/date-label";

const BROADCAST_CHANNEL = "timery-boss-kills";

interface BossRow {
  channel: string;
  killedAt: Date | null;
  killedByName: string | null;
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatKillTimeSec(killedAt: Date | null, now: Date): string {
  if (!killedAt) return "—";
  return `${formatHHMMSS(killedAt)} ${getDayLabel(killedAt, now)}`;
}

function formatRespawn(killedAt: Date | null, respawnMinutes: number): string {
  if (!killedAt) return "—";
  const resp = new Date(killedAt.getTime() + respawnMinutes * 60 * 1000);
  return formatHHMMSS(resp);
}

function getRespawnStatus(killedAt: Date | null, respawnMinutes: number, now: Date) {
  if (!killedAt) return null;
  const resp = new Date(killedAt.getTime() + respawnMinutes * 60 * 1000);
  const diff = resp.getTime() - now.getTime();
  if (diff <= 0) return { label: "Dostępny", color: "text-green-400" };
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { label: `za ${mins}m ${secs}s`, color: "text-amber-400" };
}

function ConfirmButton({
  onConfirmed,
  disabled,
  label,
  confirmLabel,
  colorClass,
}: {
  onConfirmed: () => void;
  disabled: boolean;
  label: string;
  confirmLabel: string;
  colorClass: string;
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
      className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap disabled:opacity-40 ${
        step === "confirm"
          ? "bg-yellow-500 hover:bg-yellow-400 text-black animate-pulse"
          : colorClass
      }`}
    >
      {step === "idle" ? label : confirmLabel}
    </button>
  );
}

interface BossTableProps {
  boss: string;
  title: string;
  respawnMinutes: number;
}

export function BossTable({ boss, title, respawnMinutes }: BossTableProps) {
  const CHANNELS = ["ch1", "ch2", "ch3", "ch4", "ch5"];

  const [rows, setRows] = useState<BossRow[]>(
    CHANNELS.map((ch) => ({ channel: ch, killedAt: null, killedByName: null }))
  );
  const [now, setNow] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    getBossTimers(boss).then((data) =>
      setRows(data.map((r) => ({ ...r, killedAt: r.killedAt ? new Date(r.killedAt) : null })))
    );
  }, [boss]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const channel = supabase.channel(BROADCAST_CHANNEL);
    channel.on(
      "broadcast",
      { event: "kill" },
      ({ payload }: { payload: { boss: string; channel: string; killedAt: string; killedByName: string } }) => {
        if (payload.boss !== boss) return;
        setRows((prev) =>
          prev.map((r) =>
            r.channel === payload.channel
              ? { ...r, killedAt: new Date(payload.killedAt), killedByName: payload.killedByName }
              : r
          )
        );
      }
    );
    channel.on(
      "broadcast",
      { event: "reset" },
      ({ payload }: { payload: { boss: string; channel: string } }) => {
        if (payload.boss !== boss) return;
        setRows((prev) =>
          prev.map((r) =>
            r.channel === payload.channel
              ? { ...r, killedAt: null, killedByName: null }
              : r
          )
        );
      }
    );
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [boss]);

  async function broadcast(channel: string, killedAt: Date, killedByName: string) {
    await supabase.channel(BROADCAST_CHANNEL).send({
      type: "broadcast",
      event: "kill",
      payload: { boss, channel, killedAt: killedAt.toISOString(), killedByName },
    });
  }

  async function broadcastReset(channel: string) {
    await supabase.channel(BROADCAST_CHANNEL).send({
      type: "broadcast",
      event: "reset",
      payload: { boss, channel },
    });
  }

  function handleReset(ch: string) {
    startTransition(async () => {
      await resetBossTimer(boss, ch);
      await broadcastReset(ch);
      setRows((prev) =>
        prev.map((r) => (r.channel === ch ? { ...r, killedAt: null, killedByName: null } : r))
      );
    });
  }

  function handleKill(ch: string) {
    startTransition(async () => {
      await markBossKilled(boss, ch);
      const killedAt = new Date();
      const updated = await getBossTimers(boss);
      const killedByName = updated.find((r) => r.channel === ch)?.killedByName ?? "—";
      await broadcast(ch, killedAt, killedByName);
      setRows((prev) =>
        prev.map((r) => (r.channel === ch ? { ...r, killedAt, killedByName } : r))
      );
    });
  }

  function startEdit(row: BossRow) {
    setEditingKey(row.channel);
    setEditValue(row.killedAt ? toDatetimeLocal(row.killedAt) : toDatetimeLocal(new Date()));
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditValue("");
  }

  function handleSaveEdit(ch: string) {
    if (!editValue) return;
    startTransition(async () => {
      const killedAt = new Date(editValue);
      await updateBossKillTime(boss, ch, killedAt);
      const updated = await getBossTimers(boss);
      const killedByName = updated.find((r) => r.channel === ch)?.killedByName ?? "—";
      await broadcast(ch, killedAt, killedByName);
      setRows((prev) =>
        prev.map((r) => (r.channel === ch ? { ...r, killedAt, killedByName } : r))
      );
      setEditingKey(null);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
      <div className="w-full rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-800/80 border-b border-zinc-700">
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide w-20">CH</th>
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">Czas zabicia</th>
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">
                Czas respu ({respawnMinutes} min)
              </th>
              <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">Dodane przez</th>
              <th className="px-4 py-3 w-48" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isEditing = editingKey === row.channel;
              const status = getRespawnStatus(row.killedAt, respawnMinutes, now);

              return (
                <tr key={row.channel} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <span className="font-bold text-blue-400">{row.channel}</span>
                  </td>

                  <td className="px-4 py-3 text-sm text-zinc-200 tabular-nums">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    ) : (
                      formatKillTimeSec(row.killedAt, now)
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm tabular-nums">
                    {!isEditing && status ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-zinc-300">{formatRespawn(row.killedAt, respawnMinutes)}</span>
                        <span className={`text-xs ${status.color}`}>{status.label}</span>
                      </div>
                    ) : !isEditing ? (
                      <span className="text-zinc-600">—</span>
                    ) : null}
                  </td>

                  <td className="px-4 py-4 text-sm text-zinc-400">{row.killedByName ?? "—"}</td>

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
                          {row.killedAt && (
                            <ConfirmButton
                              disabled={isPending}
                              label="🗑 Resetuj"
                              confirmLabel="⚠ Potwierdź"
                              colorClass="bg-zinc-600 hover:bg-zinc-500 text-zinc-200"
                              onConfirmed={() => handleReset(row.channel)}
                            />
                          )}
                          <button
                            onClick={() => startEdit(row)}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 disabled:opacity-40 whitespace-nowrap"
                          >
                            ✏ Edytuj
                          </button>
                          <ConfirmButton
                            disabled={isPending}
                            label="💀 Zabity"
                            confirmLabel="⚠ Potwierdź"
                            colorClass="bg-red-700 hover:bg-red-600 text-white"
                            onConfirmed={() => handleKill(row.channel)}
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
