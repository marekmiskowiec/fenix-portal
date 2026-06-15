import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const panels = [
  {
    href: "/dashboard/gildia",
    title: "Fenix - gildia",
    description: "Składki i panel gildii",
    icon: "🔥",
    color: "from-amber-900/40 to-amber-800/10 border-amber-800/40",
    buttonClass: "bg-amber-600 hover:bg-amber-500 text-white border-transparent",
  },
  {
    href: "/dashboard/grota",
    title: "Grota",
    description: "Bossy, wypłaty, alarm",
    icon: "⚔️",
    color: "from-red-900/40 to-red-800/10 border-red-800/40",
    buttonClass: "bg-red-700 hover:bg-red-600 text-white border-transparent",
  },
  {
    href: "/dashboard/timery",
    title: "Timery",
    description: "Timery z podziałem na mapy",
    icon: "⏱️",
    color: "from-blue-900/40 to-blue-800/10 border-blue-800/40",
    buttonClass: "bg-blue-700 hover:bg-blue-600 text-white border-transparent",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-amber-500 tracking-wide">FENIX</h1>
        <div className="flex items-center gap-4">
          {session.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "avatar"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-zinc-400">{session.user?.name}</span>
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Portal Gildii</h2>
        <p className="text-zinc-500 text-center mb-12">Wybierz sekcję</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {panels.map((panel) => (
            <Card
              key={panel.href}
              className={`bg-linear-to-b ${panel.color} border bg-zinc-900 flex flex-col`}
            >
              <CardHeader className="pb-2">
                <div className="text-3xl mb-2">{panel.icon}</div>
                <CardTitle className="text-white text-xl">{panel.title}</CardTitle>
                <CardDescription className="text-zinc-400">
                  {panel.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <Link
                  href={panel.href}
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "w-full justify-center",
                    panel.buttonClass
                  )}
                >
                  Wejdź
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
