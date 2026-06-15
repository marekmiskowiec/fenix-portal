"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const CHANNELS = ["ch1", "ch3", "ch5"];

export async function markWitchKilled(channel: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!CHANNELS.includes(channel)) throw new Error("Invalid channel");

  const now = new Date();

  await prisma.witchKill.upsert({
    where: { channel },
    create: {
      channel,
      killedAt: now,
      killedByName: session.user.name ?? "Nieznany",
      killedById: session.user.id,
    },
    update: {
      killedAt: now,
      killedByName: session.user.name ?? "Nieznany",
      killedById: session.user.id,
    },
  });

  revalidatePath("/dashboard/grota");
}

export async function updateWitchKillTime(channel: string, killedAt: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!CHANNELS.includes(channel)) throw new Error("Invalid channel");

  await prisma.witchKill.upsert({
    where: { channel },
    create: {
      channel,
      killedAt,
      killedByName: session.user.name ?? "Nieznany",
      killedById: session.user.id,
    },
    update: {
      killedAt,
      killedByName: session.user.name ?? "Nieznany",
      killedById: session.user.id,
    },
  });

  revalidatePath("/dashboard/grota");
}

export async function getWitchKills() {
  const rows = await prisma.witchKill.findMany({
    where: { channel: { in: CHANNELS } },
  });

  // Ensure all channels exist
  return CHANNELS.map((ch) => {
    const row = rows.find((r) => r.channel === ch);
    return {
      channel: ch,
      killedAt: row?.killedAt ?? null,
      killedByName: row?.killedByName ?? null,
    };
  });
}
