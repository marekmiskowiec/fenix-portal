"use client";

import { useState, useTransition } from "react";
import { createWitchSession } from "@/app/dashboard/grota/wiedzma-historia-actions";

interface Member {
  id: string;
  name: string | null;
  role: string;
}

interface DropRow {
  itemName: string;
  quantity: number;
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WitchSessionForm({
  members,
  onClose,
  onCreated,
}: {
  members: Member[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [channel, setChannel] = useState("1");
  const [killedAt, setKilledAt] = useState(toDatetimeLocal(new Date()));
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    Object.fromEntries(members.map((m) => [m.id, true]))
  );
  const [drops, setDrops] = useState<DropRow[]>([{ itemName: "", quantity: 1 }]);
  const [isPending, startTransition] = useTransition();

  function toggleAttendance(id: string) {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function addDrop() {
    setDrops((prev) => [...prev, { itemName: "", quantity: 1 }]);
  }

  function updateDrop(idx: number, field: keyof DropRow, value: string | number) {
    setDrops((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  }

  function removeDrop(idx: number) {
    setDrops((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createWitchSession({
        channel,
        killedAt,
        attendees: members.map((m) => ({
          name: m.name ?? "Nieznany",
          role: m.role,
          present: attendance[m.id] ?? false,
        })),
        drops: drops.filter((d) => d.itemName.trim()),
      });
      onCreated();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Dodaj sesję wiedźmy</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Channel + time */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400 uppercase tracking-wide">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                {["1", "2", "3", "4", "5"].map((c) => (
                  <option key={c} value={c}>CH {c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-400 uppercase tracking-wide">Czas zabicia</label>
              <input
                type="datetime-local"
                value={killedAt}
                onChange={(e) => setKilledAt(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Attendance */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wide">Obecność</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleAttendance(m.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                    attendance[m.id]
                      ? "bg-zinc-800 border-green-600 text-white"
                      : "bg-zinc-900 border-zinc-700 text-zinc-500"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {m.name ?? "—"}
                    {m.role === "ADMINISTRATOR" && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1 rounded font-bold">ADMIN</span>
                    )}
                    {m.role === "RADA" && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 rounded font-bold">RADA</span>
                    )}
                  </span>
                  <span className={attendance[m.id] ? "text-green-400" : "text-zinc-600"}>
                    {attendance[m.id] ? "✓" : "✗"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Drops */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wide">Drop</label>
            <div className="flex flex-col gap-2">
              {drops.map((drop, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nazwa przedmiotu"
                    value={drop.itemName}
                    onChange={(e) => updateDrop(idx, "itemName", e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="number"
                    min={1}
                    value={drop.quantity}
                    onChange={(e) => updateDrop(idx, "quantity", Number(e.target.value))}
                    className="w-20 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeDrop(idx)}
                    className="text-zinc-600 hover:text-red-400 text-lg px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addDrop}
                className="text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-700 rounded py-2 transition-colors"
              >
                + Dodaj przedmiot
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-red-700 hover:bg-red-600 text-white disabled:opacity-50"
            >
              {isPending ? "Zapisywanie…" : "Zapisz sesję"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
