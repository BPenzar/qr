import type { Metadata } from "next";
import { Inclusive_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseAuthListener } from "@/components/providers/supabase-auth-listener";

const inclusiveSans = Inclusive_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.bsp-lab.dev"),
  title: {
    default: "BSP Feedback Platform",
    template: "%s | BSP Feedback Platform",
  },
  description:
    "Collect high-signal QR and web feedback with guided templates, dashboards, and intelligent analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inclusiveSans.variable} min-h-screen font-sans antialiased`}
      >
        <QueryProvider>
          <SupabaseAuthListener />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
