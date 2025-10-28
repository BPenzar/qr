import Link from "next/link";
import {
  getAccounts,
  type AccountWithPlan,
} from "@/lib/repositories/accounts";
import {
  getRecentResponses,
  getResponseSummary,
  getResponsesTrend,
} from "@/lib/repositories/responses";
import { listForms } from "@/lib/repositories/forms";
import { listProjects } from "@/lib/repositories/projects";
import { KeyMetric } from "@/components/dashboard/key-metric";
import { ResponseTrendChart } from "@/components/dashboard/response-trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parsePlanLimits } from "@/lib/plan-limits";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export default async function AppOverviewPage() {
  const accounts = await getAccounts();
  const account = accounts[0] as AccountWithPlan | undefined;

  if (!account) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white p-12 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome to BSP Feedback
        </h1>
        <p className="text-sm text-slate-500">
          Create your first project to generate QR codes and web widgets, then
          share the form to start collecting responses.
        </p>
        <Link
          href="/app/projects#new-project"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
        >
          Create project
        </Link>
      </div>
    );
  }

  const [summary, trend, recentResponses, forms, projects] = await Promise.all([
    getResponseSummary(account.id),
    getResponsesTrend(account.id, 14),
    getRecentResponses(account.id, 8),
    listForms(account.id),
    listProjects(account.id),
  ]);

  const liveForms = forms.filter((form) => form.status === "published").length;
  const planLimits = parsePlanLimits(account);
  const projectFormCounts = projects.reduce((acc, project) => {
    acc[project.id] = forms.filter((form) => form.project_id === project.id).length;
    return acc;
  }, {} as Record<string, number>);

  const growth =
    summary.responsesLastWeek === 0
      ? summary.responsesThisWeek > 0
        ? "↑ 100%"
        : "0%"
      : `${summary.responsesThisWeek >= summary.responsesLastWeek ? "↑" : "↓"} ${Math.round(((summary.responsesThisWeek - summary.responsesLastWeek) / Math.max(summary.responsesLastWeek, 1)) * 100)}%`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Feedback overview
        </h1>
        <p className="text-sm text-slate-500">
          Track projects, QR scans, and sentiment in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KeyMetric
          label="Total responses"
          value={formatNumber(summary.totalResponses)}
          delta={growth}
          deltaLabel="vs. last week"
          variant={
            summary.responsesThisWeek >= summary.responsesLastWeek
              ? "positive"
              : "negative"
          }
        />
        <KeyMetric
          label="Avg. rating"
          value={
            summary.averageRating
              ? summary.averageRating.toFixed(1)
              : "No rating"
          }
          delta={summary.qrShare + summary.widgetShare > 0 ? `${summary.qrShare}% QR` : undefined}
          deltaLabel={
            summary.qrShare + summary.widgetShare > 0
              ? ` / ${summary.widgetShare}% widget`
              : undefined
          }
        />
        <KeyMetric
          label="Responses this week"
          value={formatNumber(summary.responsesThisWeek)}
        />
        <KeyMetric
          label="Forms live"
          value={String(liveForms)}
          delta={
            forms.length > 0
              ? `${liveForms} published / ${forms.length} total`
              : undefined
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response trend (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponseTrendChart data={trend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Projects</span>
            <span className="font-medium text-slate-800">
              {projects.length}
              {planLimits.projects ? ` / ${planLimits.projects}` : ""}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between text-xs text-slate-500"
              >
                <span>{project.name}</span>
                <span>
                  {projectFormCounts[project.id] ?? 0}
                  {planLimits.forms_per_project
                    ? ` / ${planLimits.forms_per_project} forms`
                    : " forms"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-600">Monthly responses</span>
            <span className="font-medium text-slate-800">
              {summary.responsesThisWeek + summary.responsesLastWeek}
              {planLimits.responses_per_month
                ? ` / ${planLimits.responses_per_month}`
                : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest responses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResponses.length === 0 ? (
            <p className="text-sm text-slate-500">
              No responses yet. Share your first QR code or web widget to start
              collecting feedback.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentResponses.map((response) => (
                <div
                  key={response.id}
                  className="grid gap-3 py-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {response.channel === "qr" ? "QR form" : "Web widget"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(response.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    {response.rating ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        Rating {response.rating}
                      </span>
                    ) : null}
                    <Link
                      href={`/app/responses/${response.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-500"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
