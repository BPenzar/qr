"use client";

import Image from "next/image";
import Link from "next/link";
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
    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/app"
            className="flex items-center gap-3 text-white transition-opacity hover:opacity-85"
          >
            <Image
              src="/bsp-lab-logo.png"
              alt="BSP Lab"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                BSP Lab
              </span>
              <span className="text-base font-semibold text-white">
                Feedback Platform
              </span>
            </div>
          </Link>
          <span className="hidden h-10 w-px rounded-full bg-white/15 sm:block" />
          <div className="hidden flex-col gap-1 sm:flex">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              {account?.plan?.name ?? "Free Plan"}
            </span>
            <span className="text-lg font-semibold text-white">
              {account?.name ?? "My Workspace"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => router.push("/app/settings")}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
          <div className="hidden flex-col text-right text-white/70 md:flex">
            <span className="text-sm font-semibold text-white">
              {user?.email}
            </span>
            <span className="text-xs uppercase tracking-[0.3em]">
              Signed in
            </span>
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
      </div>
    </header>
  );
};
