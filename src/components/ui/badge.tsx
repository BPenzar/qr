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
      "inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80",
      className,
    )}
  >
    {children}
  </span>
);
