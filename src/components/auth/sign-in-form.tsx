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
        className: {
          container:
            "space-y-4 [&_.supabase-auth-ui_ui-button]:rounded-full [&_.supabase-auth-ui_ui-button]:font-semibold",
          button:
            "rounded-full border border-white/10 bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 focus-visible:ring-offset-black",
          input:
            "rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white shadow-sm placeholder:text-white/50 focus:border-sky-400 focus:outline-none focus:ring-0",
          label:
            "text-xs font-semibold uppercase tracking-[0.2em] text-white/60",
          divider: "text-white/40",
          anchor: "text-sky-400 hover:text-sky-300 text-sm font-medium",
          loader: "text-sky-400",
          message: "text-sm",
        },
        variables: {
          default: {
            colors: {
              brand: "#0ea5e9",
              brandAccent: "#0284c7",
              inputBackground: "rgba(15,23,42,0.7)",
              inputBorder: "rgba(226,232,240,0.2)",
              inputText: "#f8fafc",
              inputPlaceholder: "rgba(226,232,240,0.6)",
              dividerBackground: "rgba(148,163,184,0.4)",
              messageText: "#f8fafc",
              danger: "#f97316",
            },
            fonts: {
              bodyFontFamily: '"Inclusive Sans", system-ui, sans-serif',
              buttonFontFamily: '"Inclusive Sans", system-ui, sans-serif',
              labelFontFamily: '"Inclusive Sans", system-ui, sans-serif',
            },
            radii: {
              borderRadiusButton: "9999px",
              inputBorderRadius: "16px",
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
