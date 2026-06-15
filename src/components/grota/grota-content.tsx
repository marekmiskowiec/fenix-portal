"use client";

import { useState } from "react";
import { WiedzmTab } from "./wiedzma-tab";

type Section = "wiedzma" | "echo";

export function GrotaContent() {
  const [section, setSection] = useState<Section>("wiedzma");

  return (
    <div>
      {/* Section selector */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => setSection("wiedzma")}
          className={`py-5 rounded-xl text-lg font-bold transition-all border-2 ${
            section === "wiedzma"
              ? "bg-red-700 border-red-500 text-white shadow-lg shadow-red-900/40"
              : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          }`}
        >
          🧙 Wiedźma
        </button>
        <button
          onClick={() => setSection("echo")}
          className={`py-5 rounded-xl text-lg font-bold transition-all border-2 ${
            section === "echo"
              ? "bg-purple-700 border-purple-500 text-white shadow-lg shadow-purple-900/40"
              : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          }`}
        >
          🌀 Echo
        </button>
      </div>

      {section === "wiedzma" && <WiedzmTab />}
      {section === "echo" && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
          W budowie — tu pojawi się sekcja Echo.
        </div>
      )}
    </div>
  );
}
