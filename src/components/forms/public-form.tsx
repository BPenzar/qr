"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  value: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z.record(z.string(), z.unknown()),
  ]),
});

type FormProps = {
  form: {
    id: string;
    name: string;
    description: string | null;
    thank_you_message: string | null;
    redirect_url: string | null;
    channel: "qr" | "widget" | "link";
  };
  questions: Array<{
    id: string;
    label: string;
    type:
      | "nps"
      | "rating"
      | "single_select"
      | "multi_select"
      | "short_text"
      | "long_text";
    is_required: boolean;
    options: { options?: string[] } | null;
    metadata: { scale?: number } | null;
  }>;
};

type ResponseState = Record<string, string | string[]>;

export const PublicForm = ({ form, questions }: FormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [responses, setResponses] = useState<ResponseState>(() => {
    const result: ResponseState = {};
    questions.forEach((question) => {
      result[question.id] = question.type === "multi_select" ? [] : "";
    });
    return result;
  });

  const handleRatingSelect = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSingleSelect = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (questionId: string, option: string, checked: boolean) => {
    setResponses((prev) => {
      const existing = new Set(Array.isArray(prev[questionId]) ? prev[questionId] : []);
      if (checked) {
        existing.add(option);
      } else {
        existing.delete(option);
      }
      return { ...prev, [questionId]: Array.from(existing) };
    });
  };

  const handleTextChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missingRequired = questions.filter((question) => {
      if (!question.is_required) return false;
      const value = responses[question.id];
      if (Array.isArray(value)) return value.length === 0;
      return !value || String(value).trim().length === 0;
    });

    if (missingRequired.length > 0) {
      setErrorMessage("Please answer all required questions.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const answers = Object.entries(responses)
        .map(([questionId, value]) => ({ questionId, value }))
        .map((entry) => answerSchema.parse(entry));

      const response = await fetch(`/api/forms/${form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: form.channel,
          responses: answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
      if (form.redirect_url) {
        window.location.href = form.redirect_url;
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not submit your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.2),_transparent_60%)] px-6 py-16">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white shadow-[0_35px_65px_-40px_rgba(14,165,233,0.6)] backdrop-blur">
          <h1 className="text-2xl font-semibold">
            {form.thank_you_message ?? "Thank you for your feedback!"}
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Your response has been recorded.{" "}
            {form.redirect_url ? "Redirecting..." : ""}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.2),_transparent_60%)] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.06] p-10 shadow-[0_45px_80px_-40px_rgba(14,165,233,0.55)] backdrop-blur">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            Powered by BSP Feedback
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{form.name}</h1>
          {form.description ? (
            <p className="mt-3 text-base text-white/70">{form.description}</p>
          ) : null}
        </header>

        <form className="space-y-6" onSubmit={onSubmit}>
          {questions.map((question) => {
            const ratingScale =
              question.type === "rating"
                ? Number(question.metadata?.scale ?? 5)
                : 0;
            const selectedValue = responses[question.id];

            return (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-semibold text-white normal-case">
                  {question.label}
                  {question.is_required ? (
                    <span className="text-rose-400"> *</span>
                  ) : null}
                </Label>

                {question.type === "rating" || question.type === "nps" ? (
                  <div className="flex flex-wrap gap-2">
                    {(question.type === "nps"
                      ? Array.from({ length: 11 }, (_, value) => value)
                      : Array.from({ length: ratingScale }, (_, index) => index + 1)
                    ).map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition ${
                          Number(selectedValue) === value
                            ? "border-sky-400 bg-sky-500/30 text-white"
                            : "border-white/15 bg-white/5 text-white/70 hover:border-white/25"
                        }`}
                        onClick={() => handleRatingSelect(question.id, String(value))}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                ) : null}

                {question.type === "single_select" ? (
                  <div className="space-y-2">
                    {(question.options?.options ?? []).map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 text-sm text-white/75"
                      >
                        <input
                          type="radio"
                          className="h-4 w-4 accent-sky-400"
                          checked={selectedValue === option}
                          onChange={() => handleSingleSelect(question.id, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : null}

                {question.type === "multi_select" ? (
                  <div className="space-y-2">
                    {(question.options?.options ?? []).map((option) => {
                      const selectedOptions = new Set(
                        Array.isArray(selectedValue) ? selectedValue : [],
                      );
                      return (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 text-sm text-white/75"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-sky-400"
                            checked={selectedOptions.has(option)}
                            onChange={(event) =>
                              handleMultiSelect(
                                question.id,
                                option,
                                event.target.checked,
                              )
                            }
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {question.type === "short_text" ? (
                  <Input
                    placeholder="Your answer"
                    value={typeof selectedValue === "string" ? selectedValue : ""}
                    onChange={(event) =>
                      handleTextChange(question.id, event.target.value)
                    }
                  />
                ) : null}

                {question.type === "long_text" ? (
                  <Textarea
                    placeholder="Share more details"
                    rows={4}
                    value={typeof selectedValue === "string" ? selectedValue : ""}
                    onChange={(event) =>
                      handleTextChange(question.id, event.target.value)
                    }
                  />
                ) : null}
              </div>
            );
          })}

          {errorMessage ? (
            <p className="text-sm text-rose-400">{errorMessage}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </form>
      </div>
    </main>
  );
};
