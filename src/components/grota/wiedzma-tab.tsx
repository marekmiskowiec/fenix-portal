"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { WitchTable } from "./witch-table";

const INTERVAL_SECONDS = 20;
const CHANNEL = "grota-wiedzma-skill";

type SkillEvent =
  | { type: "start"; startedAt: number; startedBy: string }
  | { type: "reset"; by: string };

function formatTime(date: Date) {
  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function InstructionBox() {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
      >
        <span>📋 Instrukcja</span>
        <span className="text-zinc-500 text-xs">{open ? "▲ ukryj" : "▼ pokaż"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-zinc-400 flex flex-col gap-1.5 border-t border-zinc-700">
          <p className="pt-3">
            Jeśli nie wiesz co klikasz — zapytaj innych, bo{" "}
            <strong className="text-zinc-200">START/RESET</strong> mają sens tylko w trakcie Wiedźmy.
          </p>
          <p>
            Żeby słyszeć alarm: poczekaj aż ktoś kliknie START, następnie kliknij{" "}
            <strong className="text-zinc-200">DOŁĄCZ</strong> (to uzbraja dźwięk; wymóg przeglądarki).
          </p>
          <p>
            <strong className="text-zinc-200">START</strong> i{" "}
            <strong className="text-zinc-200">RESET</strong> klika jedna osoba podczas Wiedźmy.
          </p>
          <p className="text-yellow-500">
            Nie klikaj START/RESET jeśli nie wiesz jak to działa.
          </p>
        </div>
      )}
    </div>
  );
}

export function WiedzmTab() {
  const [running, setRunning] = useState(false);
  const [joined, setJoined] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [startedBy, setStartedBy] = useState<string | null>(null);

  const { data: session } = useSession();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef = useRef(volume);
  const joinedRef = useRef(joined);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { joinedRef.current = joined; }, [joined]);

  useEffect(() => {
    audioRef.current = new Audio("/dzwiek/skill.mp3");
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playSound = useCallback(() => {
    if (!audioRef.current || !joinedRef.current) return;
    audioRef.current.volume = volumeRef.current;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  const syncTimer = useCallback((startedAt: number, by: string) => {
    if (tickRef.current) clearInterval(tickRef.current);

    const startDate = new Date(startedAt);
    setStartTime(startDate);
    setStartedBy(by);
    setRunning(true);

    tickRef.current = setInterval(() => {
      const el = (Date.now() - startedAt) / 1000;
      const pos = el % INTERVAL_SECONDS;
      const rem = Math.ceil(INTERVAL_SECONDS - pos);
      setCountdown(rem);
      if (pos < 0.2) playSound();
    }, 200);
  }, [playSound]);

  const stopTimer = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    setRunning(false);
    setJoined(false);
    setStartTime(null);
    setCountdown(null);
    setStartedBy(null);
  }, []);

  // Subscribe to Supabase Realtime
  useEffect(() => {
    const channel = supabase.channel(CHANNEL);
    channel.on("broadcast", { event: "skill" }, ({ payload }: { payload: SkillEvent }) => {
      if (payload.type === "start") {
        syncTimer(payload.startedAt, payload.startedBy);
      } else if (payload.type === "reset") {
        stopTimer();
      }
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [syncTimer, stopTimer]);

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  // Unlock browser audio context
  function unlockAudio() {
    if (!audioRef.current) return;
    const prev = audioRef.current.volume;
    audioRef.current.volume = 0;
    audioRef.current.play()
      .then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
        audioRef.current!.volume = prev;
      })
      .catch(() => {});
  }

  async function handleStart() {
    if (running) return;
    unlockAudio();
    const startedAt = Date.now();
    const payload: SkillEvent = { type: "start", startedAt, startedBy: session?.user?.name ?? "Nieznany" };
    await supabase.channel(CHANNEL).send({ type: "broadcast", event: "skill", payload });
    syncTimer(startedAt, session?.user?.name ?? "Nieznany");
    setJoined(true); // controller auto-joins
    // play immediately for controller
    setTimeout(() => {
      if (!audioRef.current) return;
      audioRef.current.volume = volumeRef.current;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }, 50);
  }

  async function handleReset() {
    const payload: SkillEvent = { type: "reset", by: "Lider" };
    await supabase.channel(CHANNEL).send({ type: "broadcast", event: "skill", payload });
    stopTimer();
  }

  function handleJoin() {
    unlockAudio();
    setJoined(true);
  }

  function handleLeave() {
    setJoined(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Respawn table — full width at the top */}
      <div className="col-span-1 lg:col-span-2">
        <WitchTable />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-red-400">Skill wróżki</h2>

        <InstructionBox />

        {/* START / RESET */}
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            disabled={running}
            className="flex-1 py-3 rounded-lg font-bold text-sm bg-green-700 hover:bg-green-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ▶ START
          </button>
          <button
            onClick={handleReset}
            disabled={!running}
            className="flex-1 py-3 rounded-lg font-bold text-sm bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ■ RESET
          </button>
        </div>

        {/* JOIN / LEAVE */}
        {!joined ? (
          <button
            onClick={handleJoin}
            disabled={!running}
            className="w-full py-3 rounded-lg font-bold text-sm border-2 transition-all bg-blue-700 hover:bg-blue-600 text-white border-transparent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🔔 DOŁĄCZ
          </button>
        ) : (
          <button
            onClick={handleLeave}
            className="w-full py-3 rounded-lg font-bold text-sm border-2 transition-all bg-zinc-700 hover:bg-zinc-600 text-white border-transparent"
          >
            🔕 OPUŚĆ
          </button>
        )}

        {/* Volume */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-zinc-500 text-xs w-16 shrink-0">🔉 Głośność</span>
          <input
            type="range" min={0} max={1} step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-red-500 cursor-pointer"
          />
          <span className="text-zinc-400 text-xs w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Status */}
        {running && startTime && (
          <div className="rounded-lg border border-green-700/40 bg-green-900/10 px-4 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-base font-bold">
                Alarm aktywny {joined ? "🔊" : "🔇"}
              </span>
            </div>
            <p className="text-zinc-300 text-sm">
              Uruchomiony o:{" "}
              <span className="text-white font-medium">{formatTime(startTime)}</span>
              {startedBy && <span className="text-zinc-400"> przez {startedBy}</span>}
            </p>
            <p className="text-zinc-300 text-sm">
              Następny dźwięk za:{" "}
              <span className="text-red-300 font-bold tabular-nums text-base">{countdown}s</span>
            </p>
            {!joined && (
              <p className="text-yellow-400 text-sm mt-1">
                Kliknij DOŁĄCZ aby słyszeć alarm.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right column: grota map */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-zinc-400">Mapa groty</h2>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <img
            src="/mapa-groty.jpg"
            alt="Mapa groty"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

    </div>
  );
}
