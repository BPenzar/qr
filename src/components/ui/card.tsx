import { twMerge } from "tailwind-merge";
import type { HTMLAttributes } from "react";

export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={twMerge(
      "rounded-2xl border border-slate-200 bg-white shadow-sm",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge("space-y-1.5 border-b border-slate-100 p-6", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={twMerge("text-lg font-semibold text-slate-900", className)} {...props} />
);

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={twMerge("text-sm text-slate-500", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge("p-6", className)} {...props} />
);
