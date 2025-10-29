import type { LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export const Label = ({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={twMerge(
      "text-xs font-semibold uppercase tracking-[0.3em] text-white/50",
      className,
    )}
    {...props}
  />
);
