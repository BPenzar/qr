"use server";

import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type { Tables } from "@/lib/database.types";

export type AccountWithPlan = Tables<"accounts"> & {
  plan?: Tables<"plans"> | null;
  role: "owner" | "admin" | "analyst";
};

export const getAccounts = cache(async () => {
  const supabase = await getServerSupabaseClient();
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("account_members")
    .select(
      `
        role,
        accounts (*)
      `,
    )
    .eq("user_id", user.id)
    .order("invited_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch accounts", error);
    throw error;
  }

  const accounts =
    data
      ?.map((member) => ({
        ...(member.accounts as Tables<"accounts">),
        role: member.role as AccountWithPlan["role"],
      }))
      .filter(Boolean) ?? [];

  const planIds = Array.from(
    new Set(
      accounts
        .map((account) => account.plan_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  if (planIds.length === 0) {
    return accounts;
  }

  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("*")
    .in("id", planIds);

  if (plansError) {
    console.error("Failed to fetch plans", plansError);
    return accounts;
  }

  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  return accounts.map((account) => ({
    ...account,
    plan: account.plan_id ? planMap.get(account.plan_id) ?? null : null,
  }));
});

export const getPrimaryAccount = cache(async () => {
  const accounts = await getAccounts();
  return accounts[0] ?? null;
});
