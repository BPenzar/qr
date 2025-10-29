"use server";

import "server-only";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { serviceRoleSupabaseKey, supabaseAnonKey, supabaseUrl } from "@/env/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/database.types";

export const listProjects = async (accountId: string) => {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch projects", error);
    throw error;
  }

  return data as Tables<"projects">[];
};

const createProjectSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
});

export const createProject = async (input: z.infer<typeof createProjectSchema>) => {
  const payload = createProjectSchema.parse(input);
  if (!serviceRoleSupabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Unable to create projects.",
    );
  }
  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY missing; cannot create project.");
  }
  const insert: TablesInsert<"projects"> = {
    account_id: payload.accountId,
    name: payload.name,
    description: payload.description ?? null,
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/projects`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${serviceRoleSupabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(insert),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error("Failed to create project", body);
    throw new Error(body.message ?? "Failed to create project");
  }

  const data = (await response.json()) as Tables<"projects">[];
  return data[0];
};

const updateProjectSchema = z.object({
  projectId: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  isArchived: z.boolean().optional(),
});

export const updateProject = async (
  input: z.infer<typeof updateProjectSchema>,
) => {
  const payload = updateProjectSchema.parse(input);
  if (!serviceRoleSupabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Unable to update projects.",
    );
  }

  const update: TablesUpdate<"projects"> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined) {
    update.description = payload.description;
  }
  if (payload.isArchived !== undefined) {
    update.is_archived = payload.isArchived;
    update.archived_at = payload.isArchived ? new Date().toISOString() : null;
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/projects?id=eq.${payload.projectId}&account_id=eq.${payload.accountId}`,
    {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${serviceRoleSupabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(update),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error("Failed to update project", body);
    throw new Error(body.message ?? "Failed to update project");
  }

  const data = (await response.json()) as Tables<"projects">[];
  return data[0];
};
