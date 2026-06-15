"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { requestVacation } from "@/app/dashboard/gildia/actions";
import { getWeekMonday, formatWeekPL } from "@/lib/yang";

interface VacationDialogProps {
  userId: string;
  userName: string;
  trigger: React.ReactNode;
}

export function VacationDialog({ userId, userName, trigger }: VacationDialogProps) {
  const [open, setOpen] = useState(false);
  const [weeks, setWeeks] = useState("1");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Next Monday as default start
  const nextMonday = getWeekMonday(new Date());
  nextMonday.setDate(nextMonday.getDate() + 7);
  const defaultStart = nextMonday.toISOString().split("T")[0];
  const [weekStart, setWeekStart] = useState(defaultStart);

  const previewMonday = getWeekMonday(new Date(weekStart + "T12:00:00"));
  const previewLabel = formatWeekPL(previewMonday);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestVacation({ weekStart: new Date(weekStart + "T12:00:00"), weeks: Number(weeks), reason: reason || undefined });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Wniosek o urlop</DialogTitle>
          <p className="text-xs text-zinc-400">{userName}</p>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-zinc-300">Początek urlopu (poniedziałek)</Label>
            <Input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-xs text-zinc-500">Tydzień: {previewLabel}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-zinc-300">Liczba tygodni</Label>
            <Select value={weeks} onValueChange={(v) => v && setWeeks(v)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-white focus:bg-zinc-700">
                    {n} {n === 1 ? "tydzień" : n < 5 ? "tygodnie" : "tygodni"}
                  </SelectItem>
                ))}
              </SelectContent>

            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-zinc-300">Powód (opcjonalnie)</Label>
            <Input
              placeholder="np. wyjazd, przerwa..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="rounded bg-zinc-800/60 p-3 text-xs text-zinc-400">
            Wniosek wymaga zatwierdzenia przez oficera. W trakcie zatwierdzonego urlopu składki nie są naliczane.
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-600 text-white border-transparent"
          >
            {loading ? "Wysyłanie..." : "Złóż wniosek"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
