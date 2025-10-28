import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccounts } from "@/lib/repositories/accounts";
import { getFormWithQuestions } from "@/lib/repositories/forms";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpdateFormStatusForm } from "@/components/forms/update-form-status-form";
import { GenerateQrForm } from "@/components/forms/generate-qr-form";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: Promise<{ formId: string }>;
};

export default async function FormDetailPage({ params }: PageProps) {
  const { formId } = await params;
  const accounts = await getAccounts();
  const account = accounts[0];

  if (!account) {
    notFound();
  }

  const { form, questions } = await getFormWithQuestions(formId, account.id);
  const supabase = await getServerSupabaseClient();
  const { data: qrCodes } = await supabase
    .from("form_qr_codes")
    .select("id, label, short_code, created_at")
    .eq("form_id", form.id)
    .order("created_at", { ascending: false });

  const { count: responseCount } = await supabase
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("form_id", form.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {form.name}
          </h1>
          <p className="text-sm text-slate-500">
            {form.description ?? "Configure and publish this form."}
          </p>
        </div>
        <UpdateFormStatusForm
          accountId={account.id}
          formId={form.id}
          currentStatus={form.status}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Channel</p>
            <p className="text-sm font-medium text-slate-700">
              {form.channel.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Status</p>
            <p className="text-sm font-medium text-slate-700">{form.status}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Responses</p>
            <p className="text-sm font-medium text-slate-700">
              {responseCount ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {index + 1}. {question.type.replace("_", " ")}
              </p>
              <p className="text-sm font-medium text-slate-800">{question.label}</p>
              {question.description ? (
                <p className="text-xs text-slate-500">{question.description}</p>
              ) : null}
              {question.options ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(question.options as { options?: string[] })?.options?.map((option) => (
                    <Badge key={option}>{option}</Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>QR & share links</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={`/app/forms/${form.id}/responses`}>View responses</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href={`/api/forms/${form.id}/responses/export`}>
                Download CSV
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <GenerateQrForm formId={form.id} />
          <div className="space-y-2">
            {qrCodes?.length ? (
              qrCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {code.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      Created {new Date(code.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/api/forms/${form.id}/qr/${code.short_code}`}>Download PNG</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/f/${code.short_code}`} target="_blank">
                        Open form
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No QR codes yet. Generate one to share at your location.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
