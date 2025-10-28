"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountWithPlan } from "@/lib/repositories/accounts";
import type { User } from "@supabase/supabase-js";

type Props = {
  account: AccountWithPlan | null;
  user: User | null;
};

export const AppHeader = ({ account, user }: Props) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isSigningOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch("/auth/sign-out", { method: "POST" });
    startTransition(() => {
      router.replace("/sign-in");
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          {account?.name ?? "Workspace"}
        </span>
        <span className="text-xs text-slate-500">
          {account?.plan?.name ?? "Free Plan"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" className="hidden md:inline-flex">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Upgrade
        </Button>
        <div className="hidden flex-col text-right md:flex">
          <span className="text-sm font-medium text-slate-700">
            {user?.email}
          </span>
          <span className="text-xs text-slate-400">Signed in</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
