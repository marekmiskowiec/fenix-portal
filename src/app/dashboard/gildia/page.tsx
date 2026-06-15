import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StartTab } from "./tabs/start-tab";
import { SkladkiTab } from "./tabs/skladki-tab";
import { GildiaTab } from "./tabs/gildia-tab";

const TABS = [
  { value: "start",    label: "Start" },
  { value: "gildia",   label: "Gildia" },
  { value: "skladki",  label: "Składki" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default async function GildiaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; gtab?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const tab: Tab = (TABS.some((t) => t.value === params.tab) ? params.tab : "start") as Tab;
  const gtab = params.gtab ?? "glowna";

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            ← Powrót
          </Link>
          <h1 className="text-2xl font-bold text-amber-500">Fenix - gildia</h1>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`/dashboard/gildia?tab=${t.value}`}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                tab === t.value
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {tab === "start" && session.user && <StartTab user={session.user} />}
        {tab === "gildia"  && <GildiaTab gtab={gtab} />}
        {tab === "skladki" && <SkladkiTab />}
      </div>
    </main>
  );
}
