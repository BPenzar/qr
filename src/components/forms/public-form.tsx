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
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-2xl font-semibold text-slate-900">
            {form.thank_you_message ?? "Thank you for your feedback!"}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Your response has been recorded.{" "}
            {form.redirect_url ? "Redirecting..." : ""}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 shadow-xl">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-wide text-blue-600">
            Powered by BSP Feedback
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {form.name}
          </h1>
          {form.description ? (
            <p className="mt-2 text-sm text-slate-500">{form.description}</p>
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
              <div key={question.id} className="space-y-2">
                <Label className="text-base font-medium text-slate-800">
                  {question.label}
                  {question.is_required ? (
                    <span className="text-red-500"> *</span>
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
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition ${
                          Number(selectedValue) === value
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-white text-slate-600"
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
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="radio"
                          className="h-4 w-4"
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
                          className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
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
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </form>
      </div>
    </main>
  );
};
