import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export default function TextField({ label, hint, id, className = "", ...props }: TextFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <input
        id={inputId}
        className={`mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 ${className}`}
        {...props}
      />
      {hint ? <span className="mt-1.5 block text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}
