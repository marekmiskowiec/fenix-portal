"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const CHANNELS = ["ch1", "ch2", "ch3", "ch4", "ch5"];

export async function getBossTimers(boss: string) {
  const rows = await prisma.bossTimer.findMany({
    where: { boss, channel: { in: CHANNELS } },
  });

  return CHANNELS.map((ch) => {
    const row = rows.find((r) => r.channel === ch);
    return {
      channel: ch,
      killedAt: row?.killedAt ?? null,
      killedByName: row?.killedByName ?? null,
    };
  });
}

export async function markBossKilled(boss: string, channel: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!CHANNELS.includes(channel)) throw new Error("Invalid channel");

  const now = new Date();

  await prisma.bossTimer.upsert({
    where: { boss_channel: { boss, channel } },
    create: {
      boss,
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

  revalidatePath("/dashboard/timery");
}

export async function resetBossTimer(boss: string, channel: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!CHANNELS.includes(channel)) throw new Error("Invalid channel");

  await prisma.bossTimer.updateMany({
    where: { boss, channel },
    data: { killedAt: null, killedByName: null, killedById: null },
  });

  revalidatePath("/dashboard/timery");
}

export async function updateBossKillTime(boss: string, channel: string, killedAt: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!CHANNELS.includes(channel)) throw new Error("Invalid channel");

  await prisma.bossTimer.upsert({
    where: { boss_channel: { boss, channel } },
    create: {
      boss,
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

  revalidatePath("/dashboard/timery");
}
