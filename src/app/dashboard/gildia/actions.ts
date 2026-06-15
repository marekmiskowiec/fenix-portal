"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

  await prisma.character.create({
    data: { ...parsed, userId: session.user.id },
  });

  revalidatePath("/dashboard/gildia");
}

export async function updateCharacter(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = characterSchema.parse(data);

  await prisma.character.updateMany({
    where: { id, userId: session.user.id },
    data: parsed,
  });

  revalidatePath("/dashboard/gildia");
}

export async function deleteCharacter(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.character.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard/gildia");
}
