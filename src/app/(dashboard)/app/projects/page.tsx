import Link from "next/link";
import { getAccounts } from "@/lib/repositories/accounts";
import { listForms } from "@/lib/repositories/forms";
import { listProjects } from "@/lib/repositories/projects";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectsPage() {
  const accounts = await getAccounts();
  const account = accounts[0];

  if (!account) {
    return null;
  }

  const projects = await listProjects(account.id);
  const forms = await listForms(account.id);
  const formsByProject = new Map<string, number>();

  forms.forEach((form) => {
    const count = formsByProject.get(form.project_id) ?? 0;
    formsByProject.set(form.project_id, count + 1);
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Projects
          </h1>
          <p className="text-sm text-slate-500">
            Organise QR codes, forms, and widgets by project. Free plan allows
            one active project.
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 py-8 text-center">
              <p className="text-sm text-slate-600">
                You don&apos;t have any projects yet. Create one to generate QR
                codes and collect responses.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{project.name}</span>
                    <span className="text-xs font-medium text-blue-600">
                      {formsByProject.get(project.id) ?? 0} forms
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    {project.description ?? "No description yet."}
                  </p>
                  <Link
                    href={`/app/projects/${project.id}`}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Open project →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div id="new-project">
          <CreateProjectForm
            accountId={account.id}
            disabled={projects.length >= 1 && account.plan?.slug === "free"}
          />
        </div>
      </div>
    </div>
  );
}
