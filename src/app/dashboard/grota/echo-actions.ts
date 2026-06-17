"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function respondToEcho(response: "NABIJAM" | "BEDE" | "NIE") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const date = todayUTC();

  const echoSession = await prisma.echoSession.upsert({
    where: { date },
    create: { date },
    update: {},
  });

  await prisma.echoEntry.upsert({
    where: { sessionId_userId: { sessionId: echoSession.id, userId: session.user.id } },
    create: { sessionId: echoSession.id, userId: session.user.id, response },
    update: { response },
  });

  revalidatePath("/dashboard/grota");
}

export async function getTodayEchoSession(userId: string) {
  const date = todayUTC();

  const echoSession = await prisma.echoSession.findUnique({
    where: { date },
    include: {
      entries: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  return {
    date,
    entries: echoSession?.entries ?? [],
    myResponse: echoSession?.entries.find((e) => e.userId === userId)?.response ?? null,
  };
}
