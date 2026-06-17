import Link from "next/link";
import { GlownaTab } from "./glowna-tab";
import { GraczeTab } from "./gracze-tab";
import { MateriałyTab } from "./materialy-tab";
import { prisma } from "@/lib/prisma";

const TABS = [
  { value: "glowna",   label: "Główna" },
  { value: "materialy", label: "Materiały Gildijne" },
  { value: "gracze",   label: "Gracze" },
] as const;

type GTab = (typeof TABS)[number]["value"];

export async function GildiaTab({ gtab }: { gtab: string }) {
  const active: GTab = (TABS.some((t) => t.value === gtab) ? gtab : "glowna") as GTab;

  const characters =
    active === "gracze"
      ? await prisma.character.findMany({
          orderBy: { level: "desc" },
          include: { user: { select: { name: true, image: true } } },
        })
      : [];


  return (
    <div>
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/dashboard/gildia?tab=gildia&gtab=${t.value}`}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              active === t.value
                ? "bg-amber-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {active === "glowna" && <GlownaTab />}

      {active === "materialy" && <MateriałyTab />}

      {active === "gracze" && <GraczeTab characters={characters} />}
    </div>
  );
}
