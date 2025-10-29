import { notFound } from "next/navigation";
import { getAccounts } from "@/lib/repositories/accounts";
import { getFormWithQuestions } from "@/lib/repositories/forms";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ formId: string }>;
};

export default async function FormResponsesPage({ params }: PageProps) {
  const { formId } = await params;
  const accounts = await getAccounts();
  const account = accounts[0];
  if (!account) {
    notFound();
  }

  const { form, questions } = await getFormWithQuestions(formId, account.id);
  const supabase = await getServerSupabaseClient();
  const { data: responses } = await supabase
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
    .eq("form_id", form.id)
    .order("submitted_at", { ascending: false });

  const responseCount = responses?.length ?? 0;
  const ratingAnswers = responses
    ?.flatMap((response) =>
      response.response_items?.filter((item) => {
        const question = questions.find((q) => q.id === item.question_id);
        return question?.type === "rating" || question?.type === "nps";
      }) ?? [],
    )
    .map((item) => Number(item.value))
    .filter((value) => !Number.isNaN(value));
  const averageRating =
    ratingAnswers && ratingAnswers.length > 0
      ? ratingAnswers.reduce((acc, value) => acc + value, 0) /
        ratingAnswers.length
      : null;

  return (
    <div className="space-y-8 text-white">
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Responses
        </span>
        <h1 className="text-3xl font-semibold">{form.name}</h1>
        <p className="text-sm text-white/65">
          {responseCount} responses captured.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{responseCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {averageRating ? averageRating.toFixed(1) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {responses?.length ? (
            responses.map((response) => (
              <div
                key={response.id}
                className="rounded-2xl border border-white/12 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/60">
                  <span>{new Date(response.submitted_at).toLocaleString()}</span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs font-semibold text-white">
                    {response.channel.toUpperCase()}
                  </span>
                </div>
                <dl className="mt-3 space-y-2 text-sm text-white/75">
                  {response.response_items?.map((item) => {
                    const question = questions.find((q) => q.id === item.question_id);
                    if (!question) return null;
                    const value = Array.isArray(item.value)
                      ? item.value.join(", ")
                      : typeof item.value === "object"
                        ? JSON.stringify(item.value)
                        : String(item.value ?? "");
                    return (
                      <div key={item.question_id}>
                        <dt className="font-semibold text-white">{question.label}</dt>
                        <dd className="text-white/65">{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">No responses yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
