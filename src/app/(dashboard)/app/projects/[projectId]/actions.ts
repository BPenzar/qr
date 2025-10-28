"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createForm } from "@/lib/repositories/forms";
import type { QuestionInput } from "@/lib/repositories/forms";
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

  const formattedQuestions: QuestionInput[] = [];
  for (const question of questions) {
    const base = {
      label: question.label,
      description: question.description ?? undefined,
      placeholder: question.placeholder ?? undefined,
      isRequired: question.isRequired ?? false,
    };

    switch (question.type) {
      case "single_select":
      case "multi_select": {
        if (!question.options || question.options.length === 0) {
          return {
            success: false,
            errors: { questions: ["Select questions require at least one option"] },
          } as const;
        }

        formattedQuestions.push({
          type: question.type,
          ...base,
          options: question.options,
        });
        break;
      }
      case "rating": {
        formattedQuestions.push({
          type: "rating",
          ...base,
          metadata: { scale: 5 },
        });
        break;
      }
      case "nps":
      case "short_text":
      case "long_text": {
        formattedQuestions.push({
          type: question.type,
          ...base,
        });
        break;
      }
    }
  }

  await createForm({
    ...rest,
    redirectUrl: rest.redirectUrl || null,
    questions: formattedQuestions,
  });

  revalidatePath(`/app/projects/${parsed.data.projectId}`);
  revalidatePath(`/app/forms`);
  return { success: true } as const;
}
