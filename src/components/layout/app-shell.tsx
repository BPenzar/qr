import type { Tables } from "@/lib/database.types";
import type { AccountWithPlan } from "@/lib/repositories/accounts";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import type { User } from "@supabase/supabase-js";

type Props = {
  activeAccount: AccountWithPlan | null;
  projects: Tables<"projects">[];
  user: User | null;
  children: React.ReactNode;
};

export const AppShell = ({
  activeAccount,
  projects,
  user,
  children,
}: Props) => {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.15),_transparent_55%)] text-white">
      <AppSidebar activeAccount={activeAccount} projects={projects} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader user={user} account={activeAccount} />
        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="mx-auto w-full max-w-6xl space-y-10">{children}</div>
        </main>
      </div>
    </div>
  );
};
