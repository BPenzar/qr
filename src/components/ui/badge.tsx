import { twMerge } from "tailwind-merge";

export const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={twMerge(
      "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600",
      className,
    )}
  >
    {children}
  </span>
);
