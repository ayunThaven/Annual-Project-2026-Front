import type { ReactNode } from "react";

type BadgeTone = "neutral" | "indigo" | "success" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-rose-100 bg-rose-50 text-rose-700",
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
