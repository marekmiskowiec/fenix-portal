"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getWitchSessions(from: Date, to: Date) {
  const toEndOfDay = new Date(to);
  toEndOfDay.setHours(23, 59, 59, 999);

  return prisma.witchSession.findMany({
    where: { killedAt: { gte: from, lte: toEndOfDay } },
    include: { attendees: true, drops: { orderBy: { itemName: "asc" } } },
    orderBy: { killedAt: "desc" },
  });
}

export async function getGuildMembers() {
  return prisma.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function createWitchSession(data: {
  channel: string;
  killedAt: string;
  attendees: { name: string; role: string | null; present: boolean }[];
  drops: { itemName: string; quantity: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.witchSession.create({
    data: {
      channel: data.channel,
      killedAt: new Date(data.killedAt),
      addedByName: session.user.name ?? "Nieznany",
      addedById: session.user.id,
      attendees: {
        create: data.attendees.map((a) => ({
          name: a.name,
          role: a.role,
          present: a.present,
        })),
      },
      drops: {
        create: data.drops
          .filter((d) => d.itemName.trim())
          .map((d) => ({ itemName: d.itemName.trim(), quantity: d.quantity })),
      },
    },
  });

  revalidatePath("/dashboard/grota");
}

export async function deleteWitchSession(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.witchSession.delete({ where: { id } });
  revalidatePath("/dashboard/grota");
}
