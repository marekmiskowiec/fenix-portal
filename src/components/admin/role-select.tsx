"use client";

import { useTransition } from "react";
import { setUserRole } from "@/app/dashboard/admin/actions";

const ROLES = [
  { value: "CZLONEK", label: "Członek", color: "text-zinc-400" },
  { value: "RADA", label: "Rada", color: "text-blue-400" },
  { value: "ADMINISTRATOR", label: "Administrator", color: "text-yellow-400" },
] as const;

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as "CZLONEK" | "RADA" | "ADMINISTRATOR";
    startTransition(() => setUserRole(userId, role));
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className={`bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:border-zinc-500 disabled:opacity-50 ${
        ROLES.find((r) => r.value === currentRole)?.color ?? "text-zinc-400"
      }`}
    >
      {ROLES.map((r) => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </select>
  );
}
