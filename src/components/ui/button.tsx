"use client";

import { VariantProps, cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-sky-400/50 bg-sky-500/90 text-white shadow-[0_18px_40px_-24px_rgba(14,165,233,0.7)] hover:bg-sky-400/90 focus-visible:outline-sky-400",
        secondary:
          "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-white/40",
        ghost:
          "border-transparent text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-white/40",
        destructive:
          "border-rose-500/40 bg-rose-500 text-white hover:bg-rose-400 focus-visible:outline-rose-500",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = ({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={twMerge(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
