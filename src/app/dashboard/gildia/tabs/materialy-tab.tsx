import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { MateriałyTabClient } from "./materialy-tab-client";

export async function MateriałyTab() {
  const session = await auth();
  const currentUserRole = session?.user?.role ?? "CZLONEK";
  const canResolve = currentUserRole === "ADMINISTRATOR" || currentUserRole === "BANK";

  const [allRequests, pendingRequests] = await Promise.all([
    prisma.materialRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user:       { select: { id: true, name: true, image: true } },
        resolvedBy: { select: { name: true } },
      },
    }),
    canResolve
      ? prisma.materialRequest.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, image: true } } },
        })
      : Promise.resolve([]),
  ]);

  // Aggregate per user from ACCEPTED requests
  const accepted = allRequests.filter((r) => r.status === "ACCEPTED");
  const totalsMap = new Map<
    string,
    { userId: string; name: string | null; image: string | null; dykta: number; pien: number; kamien: number; bodzio: number; kamienDuchowy: number; yang: number }
  >();

  for (const r of accepted) {
    const prev = totalsMap.get(r.userId) ?? {
      userId: r.userId,
      name: r.user.name,
      image: r.user.image,
      dykta: 0, pien: 0, kamien: 0, bodzio: 0, kamienDuchowy: 0, yang: 0,
    };
    totalsMap.set(r.userId, {
      ...prev,
      dykta:         prev.dykta + r.dykta,
      pien:          prev.pien + r.pien,
      kamien:        prev.kamien + r.kamien,
      bodzio:        prev.bodzio + r.bodzio,
      kamienDuchowy: prev.kamienDuchowy + r.kamienDuchowy,
      yang:          prev.yang + r.yang,
    });
  }

  const rankings = Array.from(totalsMap.values()).map((u) => ({
    ...u,
    total: u.dykta + u.pien + u.kamien + u.bodzio + u.kamienDuchowy + u.yang,
  }));

  return (
    <MateriałyTabClient
      rankings={rankings}
      history={allRequests}
      pendingRequests={pendingRequests}
      canResolve={canResolve}
    />
  );
}
