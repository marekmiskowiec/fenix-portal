import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BossTable } from "@/components/timery/boss-table";

const OGNISTA_METINY = [
  { boss: "ognista-metin-1", title: "Metin 1" },
  { boss: "ognista-metin-2", title: "Metin 2" },
  { boss: "ognista-metin-3", title: "Metin 3" },
  { boss: "ognista-metin-4", title: "Metin 4" },
];

export default async function TimeryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Powrót
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-blue-400 -mb-4">Timery</h1>

        {/* Królowa Pająków */}
        <BossTable
          boss="krolowa-pajekow"
          title="Królowa Pająków"
          respawnMinutes={80}
        />

        {/* Ognista Ziemia */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-orange-400">Ognista Ziemia</h2>
          {OGNISTA_METINY.map(({ boss, title }) => (
            <BossTable
              key={boss}
              boss={boss}
              title={title}
              respawnMinutes={30}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
