"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { FolderKanban, Home, Inbox, QrCode, Settings } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import type { AccountWithPlan } from "@/lib/repositories/accounts";

const navItems = [
  { href: "/app", label: "Overview", icon: Home },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/forms", label: "Forms", icon: QrCode },
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

type Props = {
  accounts: AccountWithPlan[];
  activeAccount: AccountWithPlan | null;
  projects: Tables<"projects">[];
};

export const AppSidebar = ({ activeAccount, projects }: Props) => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur md:flex md:flex-col">
      <div className="px-6 pb-4 pt-6">
        <Link href="/app" className="flex items-center gap-2 text-slate-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            QR
          </span>
          <div>
            <p className="text-sm font-semibold">BSP Feedback</p>
            <p className="text-xs text-slate-500">
              {activeAccount?.name ?? "Workspace"}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-900",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Projects
        </p>
        <div className="mt-3 space-y-2">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-400">
              Create your first project to start collecting feedback.
            </p>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                className={clsx(
                  "block rounded-md px-3 py-2 text-sm transition hover:bg-slate-100",
                  pathname.includes(project.id)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500",
                )}
              >
                {project.name}
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
