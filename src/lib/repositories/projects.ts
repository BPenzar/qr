"use server";

import "server-only";
import { z } from "zod";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
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
  const supabase = await getServerSupabaseClient();

  const insert: TablesInsert<"projects"> = {
    account_id: payload.accountId,
    name: payload.name,
    description: payload.description ?? null,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error("Failed to create project", error);
    throw error;
  }

  return data as Tables<"projects">;
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
  const supabase = await getServerSupabaseClient();

  const update: TablesUpdate<"projects"> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined) {
    update.description = payload.description;
  }
  if (payload.isArchived !== undefined) {
    update.is_archived = payload.isArchived;
    update.archived_at = payload.isArchived ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", payload.projectId)
    .eq("account_id", payload.accountId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update project", error);
    throw error;
  }

  return data as Tables<"projects">;
};
