"use client";

import { useTransition } from "react";
import { updateFormStatusAction } from "@/app/(dashboard)/app/forms/[formId]/actions";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
] as const;

type Props = {
  accountId: string;
  formId: string;
  currentStatus: string;
};

export const UpdateFormStatusForm = ({ accountId, formId, currentStatus }: Props) => {
  const [isPending, startTransition] = useTransition();

  const onSubmit = (formStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("accountId", accountId);
      formData.append("formId", formId);
      formData.append("status", formStatus);
      await updateFormStatusAction(formData);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <select
        defaultValue={currentStatus}
        className="h-11 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
        onChange={(event) => onSubmit(event.target.value)}
        disabled={isPending}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <Button
        variant="secondary"
        onClick={() => onSubmit("published")}
        disabled={isPending || currentStatus === "published"}
      >
        {isPending && currentStatus !== "published"
          ? "Publishing..."
          : currentStatus === "published"
            ? "Live"
            : "Publish"}
      </Button>
    </div>
  );
};
