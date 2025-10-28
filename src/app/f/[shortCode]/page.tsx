import { notFound } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { PublicForm } from "@/components/forms/public-form";

type PageProps = {
  params: Promise<{ shortCode: string }>;
};

export default async function PublicFormPage({ params }: PageProps) {
  const { shortCode } = await params;
  const supabase = await getServerSupabaseClient();
  const { data: qrCode, error } = await supabase
    .from("form_qr_codes")
    .select(
      `
        id,
        label,
        destination_url,
        form_id,
        forms:form_id (
          id,
          name,
          description,
          thank_you_message,
          redirect_url,
          channel,
          status
        )
      `,
    )
    .eq("short_code", shortCode)
    .maybeSingle();

  if (error || !qrCode || !qrCode.forms || qrCode.forms.status !== "published") {
    notFound();
  }

  const { data: questions, error: questionsError } = await supabase
    .from("form_questions")
    .select("id, label, type, is_required, options, metadata")
    .eq("form_id", qrCode.form_id)
    .order("position", { ascending: true });

  if (questionsError) {
    notFound();
  }

  const formattedQuestions = (questions ?? []).map((question) => ({
    id: question.id,
    label: question.label,
    type: question.type,
    is_required: question.is_required,
    options: (question.options as { options?: string[] } | null) ?? null,
    metadata: (question.metadata as { scale?: number } | null) ?? null,
  }));

  return (
    <PublicForm
      form={qrCode.forms}
      questions={formattedQuestions}
    />
  );
}
