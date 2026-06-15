import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function GrotaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Powrót
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-red-500 mb-2">Grota</h1>
        <p className="text-zinc-400 mb-8">Bossy, wypłaty, alarm</p>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
          W budowie — tu pojawią się bossy, wypłaty i alarm.
        </div>
      </div>
    </main>
  );
}
