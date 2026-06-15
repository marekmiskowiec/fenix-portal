import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { User } from "next-auth";

async function getUserData(userId: string) {
  const [dues, characters] = await Promise.all([
    prisma.due.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    }),
    prisma.character.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalPaid = dues.filter((d) => d.paid).reduce((s, d) => s + d.amount, 0);
  const totalOwed = dues.filter((d) => !d.paid).reduce((s, d) => s + d.amount, 0);

  return { dues, characters, totalPaid, totalOwed };
}

const CLASS_COLORS: Record<string, string> = {
  Wojownik: "text-red-400",
  Ninja: "text-purple-400",
  Sura: "text-orange-400",
  Szaman: "text-green-400",
  Lykan: "text-blue-400",
};

export async function StartTab({ user }: { user: User }) {
  const { dues, characters, totalPaid, totalOwed } = await getUserData(user.id!);
  const bilans = totalPaid - totalOwed;

  return (
    <div className="flex flex-col gap-4">
      {/* Karta gracza */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="flex items-center gap-4 py-5">
          <Avatar className="w-14 h-14">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
            <AvatarFallback className="bg-amber-700 text-white text-lg">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-white truncate">{user.name}</p>
            <p className="text-sm text-zinc-400">Discord</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/40">
              🔥 Fenix
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Karta składek */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-zinc-100">Moje składki i wpłaty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg bg-zinc-800/60 p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Wpłacono</p>
              <p className="text-lg font-bold text-green-400">{totalPaid.toLocaleString()} yn</p>
            </div>
            <div className="rounded-lg bg-zinc-800/60 p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Zaległości</p>
              <p className="text-lg font-bold text-red-400">{totalOwed.toLocaleString()} yn</p>
            </div>
            <div className="rounded-lg bg-zinc-800/60 p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Bilans</p>
              <p className={`text-lg font-bold ${bilans >= 0 ? "text-green-400" : "text-red-400"}`}>
                {bilans >= 0 ? "+" : ""}{bilans.toLocaleString()} yn
              </p>
            </div>
          </div>

          {dues.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-2">Brak zapisanych składek.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dues.map((due) => (
                <div
                  key={due.id}
                  className={`text-xs px-2 py-1 rounded border ${
                    due.paid
                      ? "border-green-700/40 bg-green-900/20 text-green-400"
                      : "border-red-700/40 bg-red-900/20 text-red-400"
                  }`}
                >
                  {due.month.toString().padStart(2, "0")}/{due.year}
                  {due.paid ? " ✓" : " ✗"}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Karta postaci */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base text-zinc-100">Moje postacie</CardTitle>
          <Button size="sm" variant="outline" className="text-xs border-zinc-700 text-zinc-300">
            + Dodaj postać
          </Button>
        </CardHeader>
        <CardContent>
          {characters.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">
              Brak postaci. Dodaj swoją pierwszą postać.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Postać</TableHead>
                  <TableHead className="text-zinc-400">Gildia</TableHead>
                  <TableHead className="text-zinc-400">Grota</TableHead>
                  <TableHead className="text-zinc-400">Klasa</TableHead>
                  <TableHead className="text-zinc-400">Lv</TableHead>
                  <TableHead className="text-zinc-400 text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map((char) => (
                  <TableRow key={char.id} className="border-zinc-800">
                    <TableCell className="font-medium text-white">{char.name}</TableCell>
                    <TableCell>
                      {char.inGuild ? (
                        <span className="text-green-400 text-sm">Tak</span>
                      ) : (
                        <span className="text-zinc-500 text-sm">Nie</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {char.inGrota ? (
                        <span className="text-green-400 text-sm">Tak</span>
                      ) : (
                        <span className="text-zinc-500 text-sm">Nie</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={CLASS_COLORS[char.class] ?? "text-zinc-300"}>
                        {char.class}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-300">{char.level}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-xs text-zinc-400 h-7">
                        Edytuj
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
