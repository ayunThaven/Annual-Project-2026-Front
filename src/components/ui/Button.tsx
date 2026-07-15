import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-500",
  quiet: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-slate-500",
  danger: "bg-rose-600 text-white shadow-sm shadow-rose-600/25 hover:bg-rose-700 focus-visible:outline-rose-600",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
