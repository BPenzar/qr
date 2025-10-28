import Link from "next/link";
import { getAccounts } from "@/lib/repositories/accounts";
import { listForms } from "@/lib/repositories/forms";
import { listProjects } from "@/lib/repositories/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function FormsPage() {
  const accounts = await getAccounts();
  const account = accounts[0];

  if (!account) {
    return null;
  }

  const [forms, projects] = await Promise.all([
    listForms(account.id),
    listProjects(account.id),
  ]);
  const projectMap = new Map(projects.map((project) => [project.id, project.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Forms</h1>
          <p className="text-sm text-slate-500">
            Manage all feedback forms across QR, widget, and link channels.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/projects#new-project">Create form</Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No forms yet. Create one from a project to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{form.name}</span>
                  <span className="text-xs font-medium text-slate-500">
                    {form.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <p className="text-sm text-slate-500">
                  {form.description ?? "No description provided."}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                    {form.channel.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                    Project: {projectMap.get(form.project_id) ?? "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/app/forms/${form.id}`}>Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/app/forms/${form.id}/responses`}>
                      Responses
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/app/forms/${form.id}/share`}>Share</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
