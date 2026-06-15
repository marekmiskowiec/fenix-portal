"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function requireLeader() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMINISTRATOR") throw new Error("Forbidden");
}

export async function setUserRole(userId: string, role: "CZLONEK" | "RADA" | "ADMINISTRATOR") {
  await requireLeader();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/dashboard/admin");
}

export async function getAllUsers() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== "ADMINISTRATOR") throw new Error("Forbidden");

  return prisma.user.findMany({
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}
