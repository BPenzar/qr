import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
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
    <html lang="en" className="bg-slate-100 text-slate-900">
      <body className={`${inter.variable} min-h-screen font-sans`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
