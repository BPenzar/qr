"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { nanoid } from "nanoid";
import { updateForm } from "@/lib/repositories/forms";
import type { Tables, TablesInsert } from "@/lib/database.types";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { appUrl } from "@/env/server";
import { parsePlanLimits, assertQrLimit } from "@/lib/plan-limits";

const publishSchema = z.object({
  accountId: z.string().uuid(),
  formId: z.string().uuid(),
  status: z.enum(["draft", "published", "paused", "archived"]),
});

export async function updateFormStatusAction(formData: FormData) {
  const parsed = publishSchema.safeParse({
    accountId: formData.get("accountId"),
    formId: formData.get("formId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  await updateForm(parsed.data);
  revalidatePath(`/app/forms/${parsed.data.formId}`);
  revalidatePath(`/app/forms`);
  return { success: true } as const;
}

const generateQrSchema = z.object({
  formId: z.string().uuid(),
  label: z.string().min(1).max(80),
});

export async function generateQrCodeAction(formData: FormData) {
  const parsed = generateQrSchema.safeParse({
    formId: formData.get("formId"),
    label: formData.get("label"),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
  }

  const supabase = await getServerSupabaseClient();

  const { data: form, error: formError } = await supabase
    .from("forms")
    .select(
      `
        id,
        account:account_id (*, plan:plan_id (*))
      `,
    )
    .eq("id", parsed.data.formId)
    .single();

  if (formError || !form) {
    return { success: false, errors: { formId: ["Form not found"] } } as const;
  }

  const { count } = await supabase
    .from("form_qr_codes")
    .select("id", { count: "exact", head: true })
    .eq("form_id", parsed.data.formId);

  type FormWithAccount = Tables<"forms"> & {
    account?: (Tables<"accounts"> & { plan?: Tables<"plans"> | null }) | null;
  };

  const formWithAccount = form as FormWithAccount;

  const limits = parsePlanLimits({ plan: formWithAccount.account?.plan });
  try {
    assertQrLimit(limits, count ?? 0);
  } catch (planError) {
    return {
      success: false,
      errors: { limit: [(planError as Error).message] },
    } as const;
  }

  const shortCode = nanoid(8).toLowerCase();
  const destinationUrl = `${appUrl}/f/${shortCode}`;

  const qrInsert: TablesInsert<"form_qr_codes"> = {
    form_id: parsed.data.formId,
    label: parsed.data.label,
    short_code: shortCode,
    destination_url: destinationUrl,
  };

  const { error } = await supabase
    .from("form_qr_codes")
    .insert(qrInsert);

  if (error) {
    console.error("Failed to create QR code", error);
    return { success: false } as const;
  }

  revalidatePath(`/app/forms/${parsed.data.formId}`);
  return { success: true, shortCode } as const;
}
