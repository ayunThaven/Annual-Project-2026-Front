import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 px-4 py-5 backdrop-blur sm:px-8 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </header>
  );
}
