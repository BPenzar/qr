"use client";

import Image from "next/image";
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
  activeAccount: AccountWithPlan | null;
  projects: Tables<"projects">[];
};

export const AppSidebar = ({ activeAccount, projects }: Props) => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/[0.04] backdrop-blur-xl md:flex md:flex-col">
      <div className="px-6 pb-6 pt-7">
        <Link
          href="/app"
          className="flex items-center gap-3 text-white transition-opacity hover:opacity-90"
        >
          <Image
            src="/bsp-lab-logo.png"
            alt="BSP Lab"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
              BSP Lab
            </span>
            <span className="text-base font-semibold text-white">
              Feedback Control
            </span>
          </div>
        </Link>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold text-white/50">
            {activeAccount?.plan?.name ?? "Free Plan"}
          </p>
          <p className="text-sm font-medium text-white">
            {activeAccount?.name ?? "My Workspace"}
          </p>
        </div>
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
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-white/12 text-white shadow-[0_18px_35px_-25px_rgba(14,165,233,0.6)]"
                  : "text-white/60 hover:bg-white/6 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
          Projects
        </p>
        <div className="mt-4 space-y-2">
          {projects.length === 0 ? (
            <p className="text-xs text-white/50">
              Create your first project to start collecting feedback.
            </p>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                className={clsx(
                  "block rounded-2xl px-3 py-2 text-sm transition",
                  pathname.includes(project.id)
                    ? "bg-white/12 text-white shadow-[0_18px_35px_-25px_rgba(14,165,233,0.6)]"
                    : "text-white/60 hover:bg-white/6 hover:text-white",
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
