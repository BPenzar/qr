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
    <div className="grid gap-10 text-white lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Project
            </span>
            <h1 className="text-3xl font-semibold">{project.name}</h1>
            <p className="text-sm text-white/65">
              {project.description ?? "Configure QR forms and widgets."}
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/app/projects/${project.id}/share`}>Share</Link>
          </Button>
        </div>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-white/60">
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
                    <span className="text-xs font-semibold text-white/60">
                      {form.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-white/65">
                    {form.description ?? "No description"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1">
                      {form.channel.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1">
                      Version {form.version}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(qrCodesByForm.get(form.id) ?? []).map((qr) => (
                      <Link
                        key={qr.short_code}
                        href={`/f/${qr.short_code}`}
                        className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
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
