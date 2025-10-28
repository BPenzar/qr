import { cache } from "react";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type { Session } from "@supabase/supabase-js";

export const getSession = cache(async () => {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to fetch Supabase session", error);
    return null;
  }

  return data.session;
});

export const getCurrentUser = cache(async () => {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to fetch Supabase user", error);
    return null;
  }

  return data.user;
});

export const requireSession = async (): Promise<Session> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthenticated");
  }

  return session;
};
