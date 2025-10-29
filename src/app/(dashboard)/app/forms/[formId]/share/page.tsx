import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccounts } from "@/lib/repositories/accounts";
import { getFormWithQuestions } from "@/lib/repositories/forms";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ formId: string }>;
};

export default async function FormSharePage({ params }: PageProps) {
  const { formId } = await params;
  const accounts = await getAccounts();
  const account = accounts[0];
  if (!account) {
    notFound();
  }

  const { form } = await getFormWithQuestions(formId, account.id);
  const supabase = await getServerSupabaseClient();
  const { data: qrCodes } = await supabase
    .from("form_qr_codes")
    .select("label, short_code")
    .eq("form_id", form.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 text-white">
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Share
        </span>
        <h1 className="text-3xl font-semibold">{form.name}</h1>
        <p className="text-sm text-white/65">
          Download QR assets, embed the widget, or share a direct link.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {qrCodes?.length ? (
            qrCodes.map((code) => (
              <div
                key={code.short_code}
                className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 p-4"
              >
                <span className="text-sm font-semibold text-white">
                  {code.label}
                </span>
                <Link
                  href={`/api/forms/${form.id}/qr/${code.short_code}`}
                  className="text-sm font-semibold text-sky-400 hover:text-sky-300"
                >
                  Download PNG
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">
              Generate QR codes on the form detail page to share offline.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Public link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/70">
          <p>
            Share the hosted form link anywhere. Each response is tracked with
            rate limiting and sentiment tagging.
          </p>
          <div className="rounded-2xl border border-white/12 bg-white/10 p-3 font-mono text-xs text-white">
            https://app.bsp-lab.dev/f/{qrCodes?.[0]?.short_code ?? "your-code"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
