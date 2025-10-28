import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { clientEnv } from "@/env/client";

let browserClient:
  | ReturnType<typeof createBrowserClient<Database>>
  | undefined;

export const getBrowserSupabaseClient = () => {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return browserClient;
};
