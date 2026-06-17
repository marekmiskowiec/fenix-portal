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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createMaterialRequest } from "@/app/dashboard/gildia/materialy-actions";

const schema = z.object({
  dykta:         z.coerce.number().int().min(0),
  pien:          z.coerce.number().int().min(0),
  kamien:        z.coerce.number().int().min(0),
  bodzio:        z.coerce.number().int().min(0),
  kamienDuchowy: z.coerce.number().int().min(0),
  yang:          z.coerce.number().int().min(0),
}).refine(
  (d) => d.dykta + d.pien + d.kamien + d.bodzio + d.kamienDuchowy + d.yang > 0,
  { message: "Podaj co najmniej jeden materiał lub yang", path: ["dykta"] }
);

type FormValues = z.infer<typeof schema>;

const FIELDS: { name: keyof FormValues; label: string }[] = [
  { name: "dykta",         label: "Dykta" },
  { name: "pien",          label: "Pień" },
  { name: "kamien",        label: "Kamień" },
  { name: "bodzio",        label: "Bodzio" },
  { name: "kamienDuchowy", label: "Kamień Duchowy" },
  { name: "yang",          label: "Yang (kk)" },
];

export function MaterialRequestForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { dykta: 0, pien: 0, kamien: 0, bodzio: 0, kamienDuchowy: 0, yang: 0 },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await createMaterialRequest(values);
      setOpen(false);
      form.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors">
        Wyślij prośbę o oddanie
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Prośba o oddanie materiałów</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300 text-sm">{label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          className="bg-zinc-800 border-zinc-700 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {form.formState.errors.dykta?.message?.includes("materiał") && (
              <p className="text-red-400 text-sm">{form.formState.errors.dykta.message}</p>
            )}

            <div className="flex gap-2 justify-end mt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-400 hover:text-zinc-200"
                onClick={() => { setOpen(false); form.reset(); }}
                disabled={loading}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-white"
                disabled={loading}
              >
                {loading ? "Wysyłanie…" : "Wyślij prośbę"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
