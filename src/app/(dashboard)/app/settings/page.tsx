import { parsePlanLimits } from "@/lib/plan-limits";
import { getAccounts } from "@/lib/repositories/accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const accounts = await getAccounts();
  const account = accounts[0] ?? null;
  const limits = parsePlanLimits(account);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-500">
          <div>
            <p className="text-slate-600">Plan</p>
            <p className="text-base font-semibold text-slate-900">
              {account?.plan?.name ?? "Free"}
            </p>
          </div>
          <ul className="grid gap-1 text-xs">
            <li>
              Projects: {limits.projects ?? "Unlimited"}
            </li>
            <li>
              Forms per project: {limits.forms_per_project ?? "Unlimited"}
            </li>
            <li>
              Responses per month: {limits.responses_per_month ?? "Unlimited"}
            </li>
          </ul>
          <Button disabled variant="secondary">
            Manage members (coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
