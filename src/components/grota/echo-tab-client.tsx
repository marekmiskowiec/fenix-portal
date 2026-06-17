"use client";

import { useTransition, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { respondToEcho } from "@/app/dashboard/grota/echo-actions";

type Entry = {
  id: string;
  response: string;
  user: { id: string; name: string | null; image: string | null };
};

type EchoData = {
  date: Date;
  entries: Entry[];
  myResponse: string | null;
};

function formatDatePL(date: Date): string {
  return new Date(date).toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function delta(serverVal: string | null, optimistic: string | null, key: string): number {
  const hadBefore = serverVal === key;
  const hasNow    = optimistic === key;
  if (hasNow && !hadBefore) return 1;
  if (!hasNow && hadBefore)  return -1;
  return 0;
}

export function EchoTabClient({ data }: { data: EchoData }) {
  const [isPending, startTransition] = useTransition();
  const [myResponse, setMyResponse] = useState<string | null>(data.myResponse);

  function handleRespond(response: "NABIJAM" | "BEDE" | "NIE") {
    setMyResponse(response);
    startTransition(() => respondToEcho(response));
  }

  const serverBede   = data.entries.filter((e) => e.response === "BEDE").length;
  const serverNie    = data.entries.filter((e) => e.response === "NIE").length;
  const serverNabija = data.entries.filter((e) => e.response === "NABIJAM").length;

  const bedeCount   = serverBede   + delta(data.myResponse, myResponse, "BEDE");
  const nieCount    = serverNie    + delta(data.myResponse, myResponse, "NIE");
  const nabijaCount = serverNabija + delta(data.myResponse, myResponse, "NABIJAM");

  const nabijaUsers = data.entries.filter((e) => e.response === "NABIJAM");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-purple-800/40 bg-purple-900/10 p-5">
        <h2 className="text-xl font-bold text-purple-300 mb-1">🌀 Echo Wygnańców</h2>
        <p className="text-sm text-zinc-400 capitalize">{formatDatePL(data.date)}</p>
        <p className="text-sm font-semibold text-zinc-300 mt-2">Godzina 21:00</p>
      </div>

      {/* Status counts */}
      <div className="flex gap-3">
        {([
          { key: "BEDE",    label: "Będę",   count: bedeCount,   active: "border-green-600 bg-green-900/20",   text: "text-green-400" },
          { key: "NIE",     label: "Nie",    count: nieCount,    active: "border-red-700 bg-red-900/20",       text: "text-red-400" },
          { key: "NABIJAM", label: "Nabijam", count: nabijaCount, active: "border-purple-600 bg-purple-900/20", text: "text-purple-400" },
        ] as const).map(({ key, label, count, active, text }) => (
          <div
            key={key}
            className={`flex-1 rounded-lg border p-3 text-center transition-colors ${
              myResponse === key ? active : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${myResponse === key ? text : "text-zinc-200"}`}>
              {count}
            </p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          disabled={isPending}
          onClick={() => handleRespond("NABIJAM")}
          className={`py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 ${
            myResponse === "NABIJAM"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 ring-2 ring-purple-400"
              : "bg-zinc-800 text-zinc-300 hover:bg-purple-900/40 hover:text-purple-300 border border-zinc-700"
          }`}
        >
          🌀 Nabijam
        </button>
        <button
          disabled={isPending}
          onClick={() => handleRespond("BEDE")}
          className={`py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 ${
            myResponse === "BEDE"
              ? "bg-green-700 text-white shadow-lg shadow-green-900/40 ring-2 ring-green-500"
              : "bg-zinc-800 text-zinc-300 hover:bg-green-900/40 hover:text-green-300 border border-zinc-700"
          }`}
        >
          ✅ Będę
        </button>
        <button
          disabled={isPending}
          onClick={() => handleRespond("NIE")}
          className={`py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 ${
            myResponse === "NIE"
              ? "bg-red-700 text-white shadow-lg shadow-red-900/40 ring-2 ring-red-500"
              : "bg-zinc-800 text-zinc-300 hover:bg-red-900/40 hover:text-red-300 border border-zinc-700"
          }`}
        >
          ❌ Nie
        </button>
      </div>

      {/* Nabijam list */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-3">
          Nabijają się ({nabijaCount})
        </h3>
        {nabijaUsers.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center text-zinc-500 text-sm">
            Nikt jeszcze nie zgłosił nabijania.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nabijaUsers.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-800/40 bg-purple-900/10"
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={entry.user.image ?? undefined} />
                  <AvatarFallback className="text-xs bg-zinc-700">
                    {entry.user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-purple-200">{entry.user.name ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
