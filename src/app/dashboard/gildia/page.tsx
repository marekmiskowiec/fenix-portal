import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StartTab } from "./tabs/start-tab";
import { SkladkiTab } from "./tabs/skladki-tab";

export default async function GildiaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Powrót
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-amber-500">Fenix - gildia</h1>
          </div>
        </div>

        <Tabs defaultValue="start">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
            <TabsTrigger value="start">Start</TabsTrigger>
            <TabsTrigger value="gildia">Gildia</TabsTrigger>
            <TabsTrigger value="skladki">Składki</TabsTrigger>
          </TabsList>

          <TabsContent value="start">
            {session.user && <StartTab user={session.user} />}
          </TabsContent>

          <TabsContent value="gildia">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
              W budowie — tu pojawi się panel gildii.
            </div>
          </TabsContent>

          <TabsContent value="skladki">
            <SkladkiTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
