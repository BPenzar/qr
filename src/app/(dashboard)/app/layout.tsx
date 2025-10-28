import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession, getCurrentUser } from "@/lib/auth";
import { getAccounts } from "@/lib/repositories/accounts";
import { listProjects } from "@/lib/repositories/projects";
import { AppShell } from "@/components/layout/app-shell";

type Props = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const user = await getCurrentUser();
  const accounts = await getAccounts();
  const activeAccount = accounts[0] ?? null;
  const projects = activeAccount
    ? await listProjects(activeAccount.id)
    : [];

  return (
    <AppShell
      accounts={accounts}
      activeAccount={activeAccount}
      projects={projects}
      user={user}
    >
      {children}
    </AppShell>
  );
}
