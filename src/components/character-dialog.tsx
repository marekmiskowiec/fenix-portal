"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createCharacter, updateCharacter, deleteCharacter } from "@/app/dashboard/gildia/actions";
import type { Character } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1, "Podaj nazwę postaci").max(50),
  guild: z.enum(["Fenix", "iFenix", "zakonFenix"]),
  inGrota: z.boolean(),
  class: z.enum(["Body", "Mental", "WP", "BM", "Dagger", "Archer", "Smok", "Healer"]),
  level: z.coerce.number().int().min(1, "Min 1").max(200, "Max 200"),
});

type FormValues = z.infer<typeof schema>;

interface CharacterDialogProps {
  character?: Character;
  trigger: React.ReactNode;
}

export function CharacterDialog({ character, trigger }: CharacterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: character
      ? {
          name: character.name,
          guild: character.guild as FormValues["guild"],
          inGrota: character.inGrota,
          class: character.class as FormValues["class"],
          level: character.level,
        }
      : { name: "", guild: "Fenix", inGrota: false, class: "Body", level: 1 },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      if (character) {
        await updateCharacter(character.id, values);
      } else {
        await createCharacter(values);
      }
      setOpen(false);
      form.reset();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!character) return;
    setLoading(true);
    try {
      await deleteCharacter(character.id);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {character ? "Edytuj postać" : "Dodaj postać"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as never)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postać</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nick postaci"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guild"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gildia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {["Fenix", "iFenix", "zakonFenix"].map((g) => (
                        <SelectItem key={g} value={g} className="text-white focus:bg-zinc-700">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inGrota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grota</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(v) => field.onChange(v === "true")}
                      defaultValue={field.value ? "true" : "false"}
                      className="flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="grota-tak" className="border-zinc-600" />
                        <Label htmlFor="grota-tak" className="text-zinc-300 cursor-pointer">Tak</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="grota-nie" className="border-zinc-600" />
                        <Label htmlFor="grota-nie" className="text-zinc-300 cursor-pointer">Nie</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klasa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {["Body", "Mental", "WP", "BM", "Dagger", "Archer", "Smok", "Healer"].map((c) => (
                        <SelectItem key={c} value={c} className="text-white focus:bg-zinc-700">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poziom</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white border-transparent"
              >
                {loading ? "Zapisywanie..." : character ? "Zapisz zmiany" : "Dodaj postać"}
              </Button>
              {character && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={loading}
                  onClick={onDelete}
                  className="bg-red-900/40 hover:bg-red-800/60 text-red-400 border-red-800/40"
                >
                  Usuń
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
