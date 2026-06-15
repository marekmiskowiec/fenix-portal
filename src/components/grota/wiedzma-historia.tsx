"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { getWitchSessions, getGuildMembers, deleteWitchSession } from "@/app/dashboard/grota/wiedzma-historia-actions";
import { WitchSessionForm } from "./wiedzma-session-form";

type Session = Awaited<ReturnType<typeof getWitchSessions>>[number];
type Member = Awaited<ReturnType<typeof getGuildMembers>>[number];

function formatDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toInputDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dropSummary(drops: Session["drops"]) {
  return drops.map((d) => `${d.itemName} x${d.quantity}`).join(", ");
}

function RoleBadge({ role }: { role: string | null }) {
  if (role === "ADMINISTRATOR")
    return <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1 rounded font-bold">ADMIN</span>;
  if (role === "RADA")
    return <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 rounded font-bold">RADA</span>;
  return null;
}

function SessionDetail({ session, onClose, onDelete }: { session: Session; onClose: () => void; onDelete: () => void }) {
  const [deleting, startDelete] = useTransition();
  const present = session.attendees.filter((a) => a.present);

  function handleDelete() {
    if (!confirm("Usunąć tę sesję?")) return;
    startDelete(async () => {
      await deleteWitchSession(session.id);
      onDelete();
    });
  }

  return (
    <div className="border border-zinc-700 rounded-xl bg-zinc-900 overflow-hidden">
      <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <div className="font-bold text-white text-base">{formatDate(new Date(session.killedAt))}</div>
          <div className="text-sm text-zinc-400 mt-0.5">
            CH: {session.channel} • Dodał: {session.addedByName}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Obecnych: {present.length} • Typów dropu: {session.drops.length}
            {session.drops.length > 0 && ` • ${dropSummary(session.drops)}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50"
          >
            Usuń
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            Zamknij
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 divide-x divide-zinc-800">
        {/* Attendance */}
        <div className="p-4">
          <div className="text-sm font-semibold text-zinc-300 mb-3">Obecność</div>
          <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
            {session.attendees.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${
                  a.present
                    ? "bg-zinc-800 border-zinc-700 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-600"
                }`}
              >
                <span className="flex items-center gap-2">
                  {a.name}
                  <RoleBadge role={a.role} />
                </span>
                {a.present && (
                  <span className="text-green-400 text-base">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Drop */}
        <div className="p-4">
          <div className="text-sm font-semibold text-zinc-300 mb-3">Drop</div>
          {session.drops.length === 0 ? (
            <div className="text-sm text-zinc-600">Brak dropu</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {session.drops.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700"
                >
                  <span className="text-sm text-white">{d.itemName}</span>
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-700 px-1.5 py-0.5 rounded">
                    x{d.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, onOpen }: { session: Session; onOpen: () => void }) {
  const present = session.attendees.filter((a) => a.present);
  return (
    <div className="flex items-start justify-between px-5 py-4 border border-zinc-800 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 transition-colors">
      <div>
        <div className="font-bold text-white">{formatDate(new Date(session.killedAt))}</div>
        <div className="text-sm text-zinc-400 mt-1">
          <span className="text-zinc-300">Obecnych: {present.length}</span>
          {session.drops.length > 0 && (
            <>
              {" "}• <span className="text-zinc-300">Typów dropu: {session.drops.length}</span>
              {" "}• {dropSummary(session.drops)}
            </>
          )}
        </div>
      </div>
      <button
        onClick={onOpen}
        className="ml-4 shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors"
      >
        Otwórz
      </button>
    </div>
  );
}

export function WitchHistoria() {
  const { data: session } = useSession();
  const canEdit = session?.user?.role === "ADMINISTRATOR" || session?.user?.role === "RADA";
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const [from, setFrom] = useState(toInputDate(weekAgo));
  const [to, setTo] = useState(toInputDate(today));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, startLoad] = useTransition();

  function fetchSessions(fromDate: string, toDate: string) {
    startLoad(async () => {
      const data = await getWitchSessions(new Date(fromDate), new Date(toDate));
      setSessions(data);
    });
  }

  useEffect(() => {
    fetchSessions(from, to);
    getGuildMembers().then(setMembers);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSession = sessions.find((s) => s.id === openId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-bold text-white">Historia Wróżek</h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-red-700 hover:bg-red-600 text-white transition-colors"
          >
            + Dodaj sesję
          </button>
        )}
      </div>

      {/* Date filter */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Od</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">Do</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <button
          onClick={() => fetchSessions(from, to)}
          disabled={loading}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "…" : "Pokaż"}
        </button>
      </div>

      {/* Session list */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-sm text-zinc-500 text-center py-8">Ładowanie…</div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-zinc-600 text-center py-8 border border-zinc-800 rounded-xl">
            Brak sesji w wybranym zakresie dat.
          </div>
        ) : (
          sessions.map((s) =>
            openId === s.id && openSession ? (
              <SessionDetail
                key={s.id}
                session={openSession}
                onClose={() => setOpenId(null)}
                onDelete={() => {
                  setOpenId(null);
                  fetchSessions(from, to);
                }}
              />
            ) : (
              <SessionCard key={s.id} session={s} onOpen={() => setOpenId(s.id)} />
            )
          )
        )}
      </div>

      {showForm && (
        <WitchSessionForm
          members={members}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchSessions(from, to);
          }}
        />
      )}
    </div>
  );
}
