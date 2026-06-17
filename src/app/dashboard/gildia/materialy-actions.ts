"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const materialSchema = z.object({
  dykta:         z.coerce.number().int().min(0),
  pien:          z.coerce.number().int().min(0),
  kamien:        z.coerce.number().int().min(0),
  bodzio:        z.coerce.number().int().min(0),
  kamienDuchowy: z.coerce.number().int().min(0),
  yang:          z.coerce.number().int().min(0),
}).refine(
  (d) => d.dykta + d.pien + d.kamien + d.bodzio + d.kamienDuchowy + d.yang > 0,
  { message: "Podaj co najmniej jeden materiał" }
);

export async function createMaterialRequest(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = materialSchema.parse(data);
  await prisma.materialRequest.create({ data: { userId: session.user.id, ...parsed } });
  revalidatePath("/dashboard/gildia");
}

async function requireBankOrAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });
  if (user?.role !== "ADMINISTRATOR" && user?.role !== "BANK") throw new Error("Forbidden");
  return { id: session.user.id, name: user.name };
}

export async function acceptMaterialRequest(id: string) {
  const resolver = await requireBankOrAdmin();
  await prisma.materialRequest.update({
    where: { id },
    data: { status: "ACCEPTED", resolvedById: resolver.id, resolvedAt: new Date() },
  });
  revalidatePath("/dashboard/gildia");
}

export async function rejectMaterialRequest(id: string) {
  const resolver = await requireBankOrAdmin();
  await prisma.materialRequest.update({
    where: { id },
    data: { status: "REJECTED", resolvedById: resolver.id, resolvedAt: new Date() },
  });
  revalidatePath("/dashboard/gildia");
}
