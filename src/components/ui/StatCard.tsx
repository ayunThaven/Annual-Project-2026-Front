import type { ReactNode } from "react";

export default function StatCard({
  value,
  label,
  detail,
  icon,
}: {
  value: ReactNode;
  label: string;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
        </div>
        {icon ? <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</span> : null}
      </div>
      {detail ? <p className="mt-3 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
