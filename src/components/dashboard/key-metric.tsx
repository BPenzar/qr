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
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_45px_-30px_rgba(14,165,233,0.5)] backdrop-blur">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
      {label}
    </p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    {delta ? (
      <p
        className={twMerge(
          "mt-3 text-xs font-medium text-white/60",
          variant === "positive" && "text-emerald-400",
          variant === "negative" && "text-rose-400",
        )}
      >
        {delta}
        {deltaLabel ? ` ${deltaLabel}` : ""}
      </p>
    ) : null}
  </div>
);
