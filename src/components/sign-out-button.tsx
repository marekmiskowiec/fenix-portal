"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-zinc-400 hover:text-white"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Wyloguj
    </Button>
  );
}
