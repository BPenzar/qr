import { NextResponse } from "next/server";
import Papa from "papaparse";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = Promise<{ formId: string }>;

export async function GET(
  _request: Request,
  { params }: { params: RouteParams },
) {
  const { formId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getServerSupabaseClient();

  const { data: questions, error: questionsError } = await supabase
    .from("form_questions")
    .select("id, label")
    .eq("form_id", formId)
    .order("position", { ascending: true });

  if (questionsError) {
    return NextResponse.json({ message: "Unable to fetch questions" }, { status: 500 });
  }

  const { data: responses, error: responsesError } = await supabase
    .from("responses")
    .select(
      `
        id,
        submitted_at,
        channel,
        location_name,
        response_items ( question_id, value )
      `,
    )
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false });

  if (responsesError) {
    return NextResponse.json({ message: "Unable to fetch responses" }, { status: 500 });
  }

  const questionMap = new Map(
    (questions ?? []).map((question) => [question.id, question.label] as const),
  );
  const records = (responses ?? []).map((response) => {
    const row: Record<string, unknown> = {
      response_id: response.id,
      channel: response.channel,
      location_name: response.location_name,
      submitted_at: response.submitted_at,
    };
    response.response_items?.forEach((item) => {
      if (!item.question_id) {
        return;
      }

      const label = questionMap.get(item.question_id) ?? item.question_id;
      row[label] = item.value;
    });
    return row;
  });

  const csv = Papa.unparse(records);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="form_${formId}_responses.csv"`,
    },
  });
}
