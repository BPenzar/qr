import { twMerge } from "tailwind-merge";

type Props = {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  variant?: "default" | "positive" | "negative";
};

export const KeyMetric = ({
  label,
  value,
  delta,
  deltaLabel,
  variant = "default",
}: Props) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    {delta ? (
      <p
        className={twMerge(
          "mt-2 text-xs font-medium",
          variant === "positive" && "text-emerald-600",
          variant === "negative" && "text-red-600",
          variant === "default" && "text-slate-500",
        )}
      >
        {delta}
        {deltaLabel ? ` ${deltaLabel}` : ""}
      </p>
    ) : null}
  </div>
);
