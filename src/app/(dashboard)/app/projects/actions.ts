"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProject } from "@/lib/repositories/projects";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { parsePlanLimits, assertProjectsLimit } from "@/lib/plan-limits";

const createProjectSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function createProjectAction(formData: FormData) {
  const parsed = createProjectSchema.safeParse({
    accountId: formData.get("accountId"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await getServerSupabaseClient();

  const { data: account, error } = await supabase
    .from("accounts")
    .select(
      `
        *,
        plan:plan_id (* )
      `,
    )
    .eq("id", parsed.data.accountId)
    .single();

  if (error || !account) {
    return { success: false, errors: { accountId: ["Account not found"] } } as const;
  }

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("account_id", parsed.data.accountId);

  const limits = parsePlanLimits({ plan: account.plan });

  try {
    assertProjectsLimit(limits, count ?? 0);
  } catch (planError) {
    return {
      success: false,
      errors: { limit: [(planError as Error).message] },
    } as const;
  }

  await createProject(parsed.data);
  revalidatePath("/app/projects");
  return { success: true };
}
