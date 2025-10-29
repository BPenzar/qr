import { twMerge } from "tailwind-merge";
import type { HTMLAttributes } from "react";

export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={twMerge(
      "rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_24px_45px_-30px_rgba(8,47,73,0.6)] backdrop-blur",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={twMerge(
      "space-y-2 border-b border-white/10 p-6 text-white",
      className,
    )}
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={twMerge("text-lg font-semibold text-white", className)}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={twMerge("text-sm text-white/60", className)}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge("p-6 text-white/80", className)} {...props} />
);
