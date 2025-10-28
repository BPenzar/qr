"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useMemo } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser-client";
import { clientEnv } from "@/env/client";

export const SignInForm = () => {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);

  return (
    <Auth
      supabaseClient={supabase}
      view="sign_in"
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: "#2563eb",
              brandAccent: "#1d4ed8",
              inputBackground: "#f8fafc",
            },
          },
        },
      }}
      providers={["google", "github"]}
      redirectTo={`${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback`}
      magicLink
    />
  );
};
