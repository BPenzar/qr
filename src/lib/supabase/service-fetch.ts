"use server";

import { serviceRoleSupabaseKey, supabaseAnonKey, supabaseUrl } from "@/env/server";

export const serviceFetch = async <T>(path: string, init: RequestInit = {}) => {
  if (!serviceRoleSupabaseKey || !supabaseAnonKey) {
    throw new Error("Supabase service role or anon key not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${serviceRoleSupabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? response.statusText);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};
