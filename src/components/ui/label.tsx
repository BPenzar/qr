import type { LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export const Label = ({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={twMerge(
      "text-sm font-medium text-slate-600",
      className,
    )}
    {...props}
  />
);
