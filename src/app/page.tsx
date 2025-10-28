import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "QR & Web capture",
    description:
      "Launch branded QR codes and instant web widgets that route customers to bite-size forms in seconds.",
  },
  {
    title: "Guided templates",
    description:
      "Kick-start every project with proven question packs and automation hints tailored to hospitality, retail, and SaaS.",
  },
  {
    title: "Insightful dashboards",
    description:
      "Track satisfaction, spot sentiment trends, export CSVs, and loop your team in with weekly digests.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-24 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
            Free MVP · Ready for Stripe upgrade
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Capture feedback everywhere your customers are.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Generate QR journeys for physical touchpoints and embed widgets on
            your site. Responses sync to Supabase in real-time with dashboards,
            limits, and upgrade paths built-in from day one.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-in">Start for free</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="#features">See how it works</Link>
            </Button>
          </div>
        </header>

        <section id="features" className="mt-24 grid gap-12 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
