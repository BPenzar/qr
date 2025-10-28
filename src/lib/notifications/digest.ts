"use server";

import { subDays } from "date-fns";
import { getServiceRoleClient } from "@/lib/supabase/admin-client";

export type DigestRecipient = {
  email: string;
  threshold?: number;
};

export const buildWeeklyDigestPayload = async (accountId: string) => {
  const supabase = getServiceRoleClient();
  const since = subDays(new Date(), 7).toISOString();

  const { data: responses } = await supabase
    .from("responses")
    .select("id, form_id, submitted_at, channel")
    .eq("account_id", accountId)
    .gte("submitted_at", since);

  return {
    accountId,
    totalResponses: responses?.length ?? 0,
    generatedAt: new Date().toISOString(),
  };
};

export const sendWeeklyDigest = async (
  accountId: string,
  recipients: DigestRecipient[],
) => {
  const payload = await buildWeeklyDigestPayload(accountId);
  // Integrate with Resend/MailerSend here.
  console.info("Weekly digest payload", { payload, recipients });
};
