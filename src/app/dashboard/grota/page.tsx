import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GrotaContent } from "@/components/grota/grota-content";
import { EchoTab } from "@/components/grota/echo-tab";

export default async function GrotaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            ← Powrót
          </Link>
          <h1 className="text-2xl font-bold text-red-400">Grota</h1>
        </div>
        <GrotaContent echoContent={<EchoTab userId={session.user.id} />} />
      </div>
    </main>
  );
}
