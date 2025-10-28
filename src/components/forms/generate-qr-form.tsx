"use client";

import { useState, useTransition } from "react";
import { generateQrCodeAction } from "@/app/(dashboard)/app/forms/[formId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  formId: string;
};

export const GenerateQrForm = ({ formId }: Props) => {
  const [label, setLabel] = useState("Main location QR");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append("formId", formId);
      formData.append("label", label);
      const result = await generateQrCodeAction(formData);
      if (result.success) {
        setLastCode(result.shortCode ?? null);
        setErrorMessage(null);
        return;
      }

      if (result.errors && "limit" in result.errors) {
        const limitErrors = result.errors.limit;
        if (Array.isArray(limitErrors) && limitErrors.length > 0) {
          setErrorMessage(limitErrors[0]);
        } else {
          setErrorMessage("Unable to generate QR code");
        }
        return;
      }

      if (result.errors) {
        const firstError = Object.values(result.errors)[0]?.[0];
        setErrorMessage(firstError ?? "Unable to generate QR code");
      }
    });
  };

  return (
    <form className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <Label htmlFor="qr-label" className="text-xs uppercase text-slate-500">
          Label
        </Label>
        <Input
          id="qr-label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Front desk QR"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate QR"}
        </Button>
        {lastCode ? (
          <a
            href={`/api/forms/${formId}/qr/${lastCode}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Download last QR
          </a>
        ) : null}
      </div>
      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}
    </form>
  );
};
