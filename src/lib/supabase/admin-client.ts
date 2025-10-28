"use server";

import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { serviceRoleSupabaseKey, supabaseUrl } from "@/env/server";

export const getServiceRoleClient = () => {
  if (!serviceRoleSupabaseKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. This operation requires elevated permissions.",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleSupabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
