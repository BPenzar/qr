"use server";

import "server-only";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/database.types";

const questionBaseSchema = z.object({
  label: z.string().min(1).max(280),
  description: z.string().max(500).optional(),
  placeholder: z.string().max(200).optional(),
  isRequired: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

const questionOptionsSchema = z.object({
  options: z.array(z.string().min(1)).min(1),
});

const questionSchema = z.discriminatedUnion("type", [
  questionBaseSchema.extend({
    type: z.literal("nps"),
  }),
  questionBaseSchema.extend({
    type: z.literal("rating"),
    metadata: z
      .object({
        scale: z.number().int().min(3).max(10).default(5),
      })
      .optional(),
  }),
  questionBaseSchema.extend({
    type: z.literal("single_select"),
    ...questionOptionsSchema.shape,
  }),
  questionBaseSchema.extend({
    type: z.literal("multi_select"),
    ...questionOptionsSchema.shape,
  }),
  questionBaseSchema.extend({
    type: z.literal("short_text"),
  }),
  questionBaseSchema.extend({
    type: z.literal("long_text"),
  }),
]);

export type QuestionInput = z.infer<typeof questionSchema>;

const formPayloadSchema = z.object({
  accountId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(160),
  description: z.string().max(500).nullable().optional(),
  channel: z.enum(["qr", "widget", "link"]).default("qr"),
  thankYouMessage: z.string().max(320).nullable().optional(),
  redirectUrl: z.string().url().nullable().optional(),
  settings: z
    .object({
      collectEmail: z.boolean().optional(),
      autoTag: z.boolean().optional(),
    })
    .optional(),
  questions: z.array(questionSchema).min(1),
});

export const listForms = async (accountId: string, projectId?: string) => {
  const supabase = await getServerSupabaseClient();
  let query = supabase
    .from("forms")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch forms", error);
    throw error;
  }

  return data as Tables<"forms">[];
};

export const getFormWithQuestions = async (formId: string, accountId: string) => {
  const supabase = await getServerSupabaseClient();
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("account_id", accountId)
    .single();

  if (formError) {
    console.error("Failed to fetch form", formError);
    throw formError;
  }

  const { data: questions, error: questionsError } = await supabase
    .from("form_questions")
    .select("*")
    .eq("form_id", formId)
    .order("position", { ascending: true });

  if (questionsError) {
    console.error("Failed to fetch form questions", questionsError);
    throw questionsError;
  }

  return {
    form: form as Tables<"forms">,
    questions: questions as Tables<"form_questions">[],
  };
};

export const createForm = async (input: z.infer<typeof formPayloadSchema>) => {
  const payload = formPayloadSchema.parse(input);
  const supabase = await getServerSupabaseClient();

  const formInsert: TablesInsert<"forms"> = {
    account_id: payload.accountId,
    project_id: payload.projectId,
    name: payload.name,
    description: payload.description ?? null,
    channel: payload.channel,
    thank_you_message: payload.thankYouMessage ?? null,
    redirect_url: payload.redirectUrl ?? null,
    settings: payload.settings ?? {},
    status: "draft",
  };

  const { data: form, error: formError } = await supabase
    .from("forms")
    .insert(formInsert)
    .select()
    .single();

  if (formError) {
    console.error("Failed to create form", formError);
    throw formError;
  }

  const questionInserts: TablesInsert<"form_questions">[] = payload.questions.map(
    (question, index) => ({
      form_id: form.id,
      position: index,
      type: question.type,
      label: question.label,
      description: question.description ?? null,
      placeholder: question.placeholder ?? null,
      options:
        "options" in question ? { options: question.options } : null,
      is_required: question.isRequired,
      metadata: question.metadata ?? {},
    }),
  );

  const { error: questionsError } = await supabase
    .from("form_questions")
    .insert(questionInserts);

  if (questionsError) {
    console.error("Failed to create form questions", questionsError);
    throw questionsError;
  }

  return getFormWithQuestions(form.id, payload.accountId);
};

const updateFormSchema = z.object({
  accountId: z.string().uuid(),
  formId: z.string().uuid(),
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(["draft", "published", "paused", "archived"]).optional(),
  thankYouMessage: z.string().max(320).nullable().optional(),
  redirectUrl: z.string().url().nullable().optional(),
  settings: z.record(z.any()).optional(),
});

export const updateForm = async (input: z.infer<typeof updateFormSchema>) => {
  const payload = updateFormSchema.parse(input);
  const supabase = await getServerSupabaseClient();

  const update: TablesUpdate<"forms"> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined)
    update.description = payload.description;
  if (payload.status !== undefined) {
    update.status = payload.status;
    update.published_at =
      payload.status === "published"
        ? new Date().toISOString()
        : payload.status === "draft"
          ? null
          : undefined;
  }
  if (payload.thankYouMessage !== undefined) {
    update.thank_you_message = payload.thankYouMessage;
  }
  if (payload.redirectUrl !== undefined) {
    update.redirect_url = payload.redirectUrl;
  }
  if (payload.settings !== undefined) {
    update.settings = payload.settings;
  }

  const { data, error } = await supabase
    .from("forms")
    .update(update)
    .eq("id", payload.formId)
    .eq("account_id", payload.accountId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update form", error);
    throw error;
  }

  return data as Tables<"forms">;
};
