import type { ReactNode } from "react";
import AppLogo from "@/components/ui/AppLogo";

export default function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#e0e7ff_0,_transparent_34%),radial-gradient(circle_at_bottom_right,_#f5d0fe_0,_transparent_28%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-indigo-950/10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden min-h-[36rem] flex-col justify-between bg-slate-950 p-10 lg:flex">
          <AppLogo />
          <div>
            <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-200">
              Content operations
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white">
              Le contenu SEO, sans la dispersion.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
              Centralisez la veille, les idées et la rédaction de votre équipe dans un même studio.
            </p>
          </div>
          <p className="text-xs text-slate-500">SEO Genius · Le studio éditorial de votre agence</p>
        </aside>

        <main className="flex min-h-[36rem] items-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <AppLogo compact />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">Bienvenue</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
