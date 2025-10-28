import type { Tables } from "@/lib/database.types";
import type { AccountWithPlan } from "@/lib/repositories/accounts";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import type { User } from "@supabase/supabase-js";

type Props = {
  accounts: AccountWithPlan[];
  activeAccount: AccountWithPlan | null;
  projects: Tables<"projects">[];
  user: User | null;
  children: React.ReactNode;
};

export const AppShell = ({
  accounts,
  activeAccount,
  projects,
  user,
  children,
}: Props) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar
        accounts={accounts}
        activeAccount={activeAccount}
        projects={projects}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader user={user} account={activeAccount} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
};
