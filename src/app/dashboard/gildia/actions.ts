"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getWeekMonday } from "@/lib/yang";

const characterSchema = z.object({
  name: z.string().min(1, "Podaj nazwę postaci").max(50),
  guild: z.enum(["Fenix", "iFenix", "zakonFenix"]),
  inGrota: z.boolean(),
  class: z.enum(["Body", "Mental", "WP", "BM", "Dagger", "Archer", "Smok", "Healer"]),
  level: z.number().int().min(1).max(200),
});

export async function createCharacter(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = characterSchema.parse(data);
  await prisma.character.create({ data: { ...parsed, userId: session.user.id } });
  revalidatePath("/dashboard/gildia");
}

export async function updateCharacter(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = characterSchema.parse(data);
  await prisma.character.updateMany({ where: { id, userId: session.user.id }, data: parsed });
  revalidatePath("/dashboard/gildia");
}

export async function deleteCharacter(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.character.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/dashboard/gildia");
}

// Vacation request submitted by the member themselves
const vacationSchema = z.object({
  weekStart: z.coerce.date(),
  weeks: z.number().int().min(1).max(8),
  reason: z.string().max(200).optional(),
});

export async function requestVacation(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = vacationSchema.parse(data);
  // Align to Monday
  const monday = getWeekMonday(parsed.weekStart);
  await prisma.vacation.create({
    data: { userId: session.user.id, weekStart: monday, weeks: parsed.weeks, reason: parsed.reason },
  });
  revalidatePath("/dashboard/gildia");
}

// Officer-only: approve vacation
export async function approveVacation(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  // TODO: check role
  await prisma.vacation.update({ where: { id }, data: { approved: true } });
  // Mark dues as onVacation for those weeks
  const vac = await prisma.vacation.findUnique({ where: { id } });
  if (vac) {
    const weekStarts = Array.from({ length: vac.weeks }, (_, i) => {
      const d = new Date(vac.weekStart);
      d.setDate(d.getDate() + i * 7);
      return d;
    });
    await prisma.due.updateMany({
      where: { userId: vac.userId, weekStart: { in: weekStarts } },
      data: { onVacation: true },
    });
  }
  revalidatePath("/dashboard/gildia");
}

// Officer-only: add payment for a user
const paymentSchema = z.object({
  userId: z.string(),
  amount: z.number().int().min(1),
  note: z.string().max(200).optional(),
});

export async function addPayment(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = paymentSchema.parse(data);
  await prisma.payment.create({ data: { userId: parsed.userId, amount: parsed.amount, note: parsed.note } });
  revalidatePath("/dashboard/gildia");
}

// Officer-only: charge weekly dues for all members
export async function chargeWeeklyDues() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const monday = getWeekMonday();
  const users = await prisma.user.findMany({ select: { id: true } });
  const vacations = await prisma.vacation.findMany({ where: { approved: true } });

  for (const user of users) {
    const onVacation = vacations.some((v) => {
      const end = new Date(v.weekStart);
      end.setDate(end.getDate() + v.weeks * 7);
      return v.userId === user.id && monday >= v.weekStart && monday < end;
    });

    await prisma.due.upsert({
      where: { userId_weekStart: { userId: user.id, weekStart: monday } },
      create: { userId: user.id, weekStart: monday, amount: 500_000, onVacation },
      update: {},
    });
  }
  revalidatePath("/dashboard/gildia");
}
