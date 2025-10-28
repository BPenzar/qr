import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { getServiceRoleClient } from "@/lib/supabase/admin-client";
import { parsePlanLimits, assertResponsesLimit } from "@/lib/plan-limits";
import { endOfMonth, startOfMonth } from "date-fns";
import type { Tables, TablesInsert } from "@/lib/database.types";

const submissionSchema = z.object({
  channel: z.enum(["qr", "widget", "link"]),
  locationName: z.string().max(120).optional(),
  attributes: z.record(z.any()).optional(),
  responses: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        value: z.any(),
      }),
    )
    .min(1),
});

type RouteParams = Promise<{ formId: string }>;

export async function POST(request: Request, { params }: { params: RouteParams }) {
  const body = await request.json();
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const supabase = getServiceRoleClient();
  const { formId } = await params;
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select(
      `
        id,
        account_id,
        status,
        account:account_id (*, plan:plan_id (*))
      `,
    )
    .eq("id", formId)
    .single();

  if (formError || !form) {
    return NextResponse.json({ message: "Form not found" }, { status: 404 });
  }

  type FormWithAccount = Tables<"forms"> & {
    account?: (Tables<"accounts"> & { plan?: Tables<"plans"> | null }) | null;
  };

  const formWithAccount = form as FormWithAccount;

  if (formWithAccount.status !== "published") {
    return NextResponse.json({ message: "Form is not accepting responses" }, { status: 403 });
  }

  const now = new Date();
  const periodStart = startOfMonth(now).toISOString();
  const periodEndDate = endOfMonth(now).toISOString();
  const { count } = await supabase
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("account_id", formWithAccount.account_id)
    .gte("submitted_at", periodStart);

  const limits = parsePlanLimits({ plan: formWithAccount.account?.plan });
  try {
    assertResponsesLimit(limits, count ?? 0);
  } catch (planError) {
    return NextResponse.json(
      { message: (planError as Error).message },
      { status: 429 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "0.0.0.0";
  const userAgent = request.headers.get("user-agent") ?? "";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  const responseInsert: TablesInsert<"responses"> = {
    account_id: formWithAccount.account_id,
    form_id: formWithAccount.id,
    channel: parsed.data.channel,
    location_name: parsed.data.locationName ?? null,
    attributes: parsed.data.attributes ?? {},
    ip_hash: ipHash,
    user_agent: userAgent,
  };

  const { data: response, error: insertError } = await supabase
    .from<Tables<"responses">, TablesInsert<"responses">>("responses")
    .insert([responseInsert])
    .select()
    .single();

  if (insertError || !response) {
    console.error("Failed to insert response", insertError);
    return NextResponse.json({ message: "Failed to save response" }, { status: 500 });
  }

  const responseItems: TablesInsert<"response_items">[] = parsed.data.responses.map(
    (item) => ({
      response_id: response.id,
      question_id: item.questionId,
      value: item.value,
    }),
  );

  const { error: itemsError } = await supabase
    .from<Tables<"response_items">, TablesInsert<"response_items">>("response_items")
    .insert(responseItems);

  if (itemsError) {
    console.error("Failed to insert response items", itemsError);
  }

  const usageCounterUpsert: TablesInsert<"usage_counters">[] = [
    {
      account_id: formWithAccount.account_id,
      metric: "responses_monthly",
      period_start: periodStart.slice(0, 10),
      period_end: periodEndDate.slice(0, 10),
      value: (count ?? 0) + 1,
    },
  ];

  await supabase
    .from<Tables<"usage_counters">, TablesInsert<"usage_counters">>("usage_counters")
    .upsert(usageCounterUpsert, {
      onConflict: "account_id,metric,period_start",
    });

  return NextResponse.json({ message: "ok" }, { status: 201 });
}
