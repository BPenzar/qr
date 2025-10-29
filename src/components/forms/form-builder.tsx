"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFormAction } from "@/app/(dashboard)/app/projects/[projectId]/actions";

const formSchema = z.object({
  accountId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  channel: z.enum(["qr", "widget", "link"]),
  thankYouMessage: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

type QuestionFormState = {
  id: string;
  type: "nps" | "rating" | "single_select" | "multi_select" | "short_text" | "long_text";
  label: string;
  description?: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
};

const defaultQuestion = (): QuestionFormState => ({
  id: nanoid(),
  type: "rating",
  label: "How would you rate your experience?",
  placeholder: "",
  isRequired: true,
});

const questionPresets: { label: string; type: QuestionFormState["type"]; description: string }[] = [
  {
    label: "Rating",
    type: "rating",
    description: "1-5 scale suitable for quick sentiment pulses.",
  },
  {
    label: "NPS",
    type: "nps",
    description: "Net Promoter Score question (0-10).",
  },
  {
    label: "Single select",
    type: "single_select",
    description: "Let respondents pick one option.",
  },
  {
    label: "Multi select",
    type: "multi_select",
    description: "Allow multiple options for multi-choice.",
  },
  {
    label: "Short text",
    type: "short_text",
    description: "Short free-form response (255 chars).",
  },
  {
    label: "Long text",
    type: "long_text",
    description: "Longer feedback with paragraph formatting.",
  },
];

type Props = {
  accountId: string;
  projectId: string;
  onCreated?: () => void;
};

export const FormBuilder = ({ accountId, projectId, onCreated }: Props) => {
  const [questions, setQuestions] = useState<QuestionFormState[]>([
    defaultQuestion(),
  ]);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId,
      projectId,
      name: "Customer feedback",
      description: "",
      channel: "qr",
      thankYouMessage: "Thank you for sharing your feedback!",
      redirectUrl: "",
    },
  });

  const [channel, setChannel] = useState<FormValues["channel"]>("qr");
  const channelField = register("channel", {
    onChange: (event) =>
      setChannel(event.target.value as FormValues["channel"]),
  });

  const addQuestion = (type: QuestionFormState["type"]) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: nanoid(),
        type,
        label:
          type === "nps"
            ? "How likely are you to recommend us to a friend?"
            : type === "single_select"
              ? "What stood out the most?"
              : type === "multi_select"
                ? "What would you improve?"
                : type === "short_text"
                  ? "Any comments?"
                  : type === "long_text"
                    ? "Tell us more"
                    : "How would you rate us?",
        placeholder: type.includes("text") ? "Share your thoughts" : "",
        isRequired: type !== "multi_select",
        options:
          type === "single_select"
            ? ["Food", "Service", "Ambience"]
            : type === "multi_select"
              ? ["Speed", "Cleanliness", "Staff"].map((option) => option)
              : undefined,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((question) => question.id !== id));
  };

  const updateQuestion = (id: string, patch: Partial<QuestionFormState>) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    );
  };

  const onSubmit = (values: FormValues) => {
    if (questions.length === 0) {
      setFormError("Add at least one question to publish the form.");
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("accountId", values.accountId);
      formData.append("projectId", values.projectId);
      formData.append("name", values.name);
      formData.append("description", values.description ?? "");
      formData.append("channel", values.channel);
      formData.append("thankYouMessage", values.thankYouMessage ?? "");
      formData.append("redirectUrl", values.redirectUrl ?? "");
      formData.append(
        "questions",
        JSON.stringify(
          questions.map((question) => ({
            type: question.type,
            label: question.label,
            description: question.description,
            placeholder: question.placeholder,
            isRequired: question.isRequired,
            options: question.options?.filter((option) => option.trim().length > 0),
          })),
        ),
      );
      const result = await createFormAction(formData);
      if (result.success) {
        reset({
          accountId,
          projectId,
          name: "Customer feedback",
          description: "",
          channel: values.channel,
          thankYouMessage: values.thankYouMessage,
          redirectUrl: values.redirectUrl,
        });
        setChannel(values.channel);
        setQuestions([defaultQuestion()]);
        onCreated?.();
        return;
      }

      if (result.errors && "limit" in result.errors) {
        const limitErrors = result.errors.limit;
        if (Array.isArray(limitErrors) && limitErrors.length > 0) {
          setFormError(limitErrors[0]);
        } else {
          setFormError("Unable to create form. Please review required fields.");
        }
        return;
      }

      if (result.errors) {
        const firstError = Object.values(result.errors)[0]?.[0];
        setFormError(firstError ?? "Unable to create form. Please review required fields.");
        return;
      }

      setFormError("Unable to create form. Please review required fields.");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/75">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("accountId")} />
          <input type="hidden" {...register("projectId")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Form name</Label>
              <Input id="name" placeholder="Feedback form" {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <select
                id="channel"
                className="h-11 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                {...channelField}
              >
                <option value="qr">QR code</option>
                <option value="widget">Website widget</option>
                <option value="link">Direct link</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="Internal notes for your team"
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thankYouMessage">Thank you message</Label>
            <Input id="thankYouMessage" {...register("thankYouMessage")} />
          </div>
          {channel === "link" ? (
            <div className="space-y-2">
              <Label htmlFor="redirectUrl">Redirect URL</Label>
              <Input id="redirectUrl" placeholder="https://example.com" {...register("redirectUrl")} />
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Questions
              </h3>
              <div className="flex flex-wrap gap-2">
                {questionPresets.map((preset) => (
                  <Button
                    key={preset.type}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => addQuestion(preset.type)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-white/12 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        {index + 1}. {question.type.replace("_", " ")}
                      </p>
                      <div className="mt-3 space-y-3">
                        <Input
                          value={question.label}
                          onChange={(event) =>
                            updateQuestion(question.id, {
                              label: event.target.value,
                            })
                          }
                          placeholder="Question label"
                        />
                        {(question.type === "short_text" ||
                          question.type === "long_text") && (
                          <Input
                            value={question.placeholder}
                            onChange={(event) =>
                              updateQuestion(question.id, {
                                placeholder: event.target.value,
                              })
                            }
                            placeholder="Placeholder"
                          />
                        )}
                        {(question.type === "single_select" ||
                          question.type === "multi_select") && (
                          <Textarea
                            rows={3}
                            value={(question.options ?? []).join("\n")}
                            onChange={(event) =>
                              updateQuestion(question.id, {
                                options: event.target.value
                                  .split("\n")
                                  .map((option) => option.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="One option per line"
                          />
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                    <input
                      id={`required-${question.id}`}
                      type="checkbox"
                      checked={question.isRequired}
                      onChange={(event) =>
                        updateQuestion(question.id, {
                          isRequired: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border border-white/25 bg-white/10 accent-sky-400"
                    />
                    <label htmlFor={`required-${question.id}`}>
                      Required question
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {formError ? (
            <p className="text-xs text-rose-400">{formError}</p>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create form"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
