import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getAllUsers } from "./actions";
import { RoleSelect } from "@/components/admin/role-select";

const ROLE_BADGE: Record<string, string> = {
  ADMINISTRATOR: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  BANK: "bg-green-500/20 text-green-400 border-green-500/30",
  RADA: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CZLONEK: "bg-zinc-700/50 text-zinc-400 border-zinc-600",
};

const ROLE_LABEL: Record<string, string> = {
  ADMINISTRATOR: "Administrator",
  BANK: "Bank",
  RADA: "Rada",
  CZLONEK: "Członek",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMINISTRATOR") redirect("/dashboard");

  const users = await getAllUsers();

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            ← Powrót
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Panel admina</h1>
          <p className="text-zinc-400 mt-1">Zarządzanie rangami użytkowników</p>
        </div>

        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-800/80 border-b border-zinc-700">
                <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">Użytkownik</th>
                <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">Email</th>
                <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">Aktualna ranga</th>
                <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3 uppercase tracking-wide">Zmień rangę</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.image && (
                        <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                      )}
                      <span className="font-medium text-zinc-100">{user.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-400">{user.email ?? "—"}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${ROLE_BADGE[user.role]}`}>
                      {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {user.id === session.user.id ? (
                      <span className="text-xs text-zinc-600">to Ty</span>
                    ) : (
                      <RoleSelect userId={user.id} currentRole={user.role} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          <p className="font-semibold text-zinc-300 mb-2">Uprawnienia rang:</p>
          <ul className="flex flex-col gap-1">
            <li><span className="text-yellow-400 font-bold">Administrator</span> — pełny dostęp, zarządzanie rangami</li>
            <li><span className="text-green-400 font-bold">Bank</span> — akceptowanie próśb o materiały gildijne</li>
            <li><span className="text-blue-400 font-bold">Rada</span> — edycja zbić, rozliczenia</li>
            <li><span className="text-zinc-400 font-bold">Członek</span> — podgląd + edycja timerów</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
