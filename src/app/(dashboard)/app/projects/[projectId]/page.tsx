import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccounts } from "@/lib/repositories/accounts";
import { listForms } from "@/lib/repositories/forms";
import { listProjects } from "@/lib/repositories/projects";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { FormBuilder } from "@/components/forms/form-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const accounts = await getAccounts();
  const account = accounts[0];

  if (!account) {
    notFound();
  }

  const projects = await listProjects(account.id);
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  const forms = await listForms(account.id, projectId);
  const supabase = await getServerSupabaseClient();
  const qrCodesByForm = new Map<
    string,
    { form_id: string; short_code: string; label: string }[]
  >();
  if (forms.length > 0) {
    const { data: qrCodes } = await supabase
      .from("form_qr_codes")
      .select("form_id, short_code, label")
      .in(
        "form_id",
        forms.map((form) => form.id),
      );

    qrCodes?.forEach((code) => {
      const existing = qrCodesByForm.get(code.form_id) ?? [];
      existing.push(code);
      qrCodesByForm.set(code.form_id, existing);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {project.name}
            </h1>
            <p className="text-sm text-slate-500">
              {project.description ?? "Configure QR forms and widgets."}
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/app/projects/${project.id}/share`}>Share</Link>
          </Button>
        </div>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              Create your first form to generate a QR code.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{form.name}</span>
                    <span className="text-xs font-medium text-slate-500">
                      {form.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-500">
                    {form.description ?? "No description"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                      {form.channel.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                      Version {form.version}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(qrCodesByForm.get(form.id) ?? []).map((qr) => (
                      <Link
                        key={qr.short_code}
                        href={`/f/${qr.short_code}`}
                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs text-blue-600 hover:text-blue-500"
                      >
                        QR: {qr.label}
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/app/forms/${form.id}`}>Edit</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/app/forms/${form.id}/responses`}>
                        View responses
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FormBuilder accountId={account.id} projectId={project.id} />
    </div>
  );
}
