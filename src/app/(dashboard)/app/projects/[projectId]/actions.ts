"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createForm } from "@/lib/repositories/forms";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { parsePlanLimits, assertFormsLimit } from "@/lib/plan-limits";

const questionSchema = z.object({
  type: z.enum([
    "nps",
    "rating",
    "single_select",
    "multi_select",
    "short_text",
    "long_text",
  ]),
  label: z.string().min(1),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

const createFormSchema = z.object({
  accountId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  channel: z.enum(["qr", "widget", "link"]),
  thankYouMessage: z.string().optional(),
  redirectUrl: z.string().optional().or(z.literal("")),
  questions: z.array(questionSchema).min(1),
});

export async function createFormAction(formData: FormData) {
  const rawQuestions = formData.get("questions");
  let parsedQuestions: unknown = rawQuestions;
  if (typeof rawQuestions === "string") {
    parsedQuestions = JSON.parse(rawQuestions);
  }

  const parsed = createFormSchema.safeParse({
    accountId: formData.get("accountId"),
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    description: formData.get("description"),
    channel: formData.get("channel"),
    thankYouMessage: formData.get("thankYouMessage"),
    redirectUrl: formData.get("redirectUrl"),
    questions: parsedQuestions,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    } as const;
  }

  const supabase = await getServerSupabaseClient();

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select(
      `
        *,
        plan:plan_id (*)
      `,
    )
    .eq("id", parsed.data.accountId)
    .single();

  if (accountError || !account) {
    return { success: false, errors: { accountId: ["Account not found"] } } as const;
  }

  const { count } = await supabase
    .from("forms")
    .select("id", { count: "exact", head: true })
    .eq("project_id", parsed.data.projectId);

  const limits = parsePlanLimits({ plan: account.plan });
  try {
    assertFormsLimit(limits, count ?? 0);
  } catch (planError) {
    return {
      success: false,
      errors: { limit: [(planError as Error).message] },
    } as const;
  }

  const { questions, ...rest } = parsed.data;
  await createForm({
    ...rest,
    redirectUrl: rest.redirectUrl || null,
    questions: questions.map((question) => ({
      type: question.type,
      label: question.label,
      description: question.description,
      placeholder: question.placeholder,
      isRequired: question.isRequired ?? false,
      metadata:
        question.type === "rating"
          ? { scale: 5 }
          : undefined,
      options:
        question.options && question.options.length > 0
          ? question.options
          : undefined,
    })),
  });

  revalidatePath(`/app/projects/${parsed.data.projectId}`);
  revalidatePath(`/app/forms`);
  return { success: true } as const;
}
