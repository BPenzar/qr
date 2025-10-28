"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProjectAction } from "@/app/(dashboard)/app/projects/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  accountId: string;
  disabled?: boolean;
};

export const CreateProjectForm = ({ accountId, disabled }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountId,
      name: "",
      description: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [limitError, setLimitError] = useState<string | null>(null);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("accountId", values.accountId);
      formData.append("name", values.name);
      formData.append("description", values.description ?? "");
      const result = await createProjectAction(formData);
      if (result.success) {
        reset({ accountId, name: "", description: "" });
        setLimitError(null);
        return;
      }
      if (result.errors && "limit" in result.errors) {
        const limitErrors = result.errors.limit;
        if (Array.isArray(limitErrors) && limitErrors.length > 0) {
          setLimitError(limitErrors[0]);
        } else {
          setLimitError("Unable to create project");
        }
        return;
      }
      if (result.errors) {
        const firstError = Object.values(result.errors)[0]?.[0];
        setLimitError(firstError ?? "Unable to create project");
        return;
      }
      setLimitError("Unable to create project");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled ? (
          <p className="rounded-lg bg-slate-100 p-3 text-xs text-slate-500">
            The free plan allows one active project. Archive a project or
            upgrade to unlock more workspaces.
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" value={accountId} {...register("accountId")} />
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" placeholder="Summer pop-up feedback" {...register("name")} />
            {errors.name ? (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Optional context for your team"
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            ) : null}
          </div>
          {limitError ? (
            <p className="text-xs text-red-600">{limitError}</p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || disabled}
          >
            {isPending ? "Creating..." : "Create project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
