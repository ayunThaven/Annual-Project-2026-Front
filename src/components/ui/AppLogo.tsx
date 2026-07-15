import Link from "next/link";

type AppLogoProps = {
  compact?: boolean;
  href?: string;
};

export default function AppLogo({ compact = false, href = "/dashboard" }: AppLogoProps) {
  const content = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-indigo-950/25">
        S
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-sm font-extrabold tracking-tight text-white">SEO Genius</span>
          <span className="block text-[10px] font-medium tracking-wide text-slate-400">CONTENT STUDIO</span>
        </span>
      ) : null}
    </>
  );

  return (
    <Link href={href} className="inline-flex items-center gap-3" aria-label="SEO Genius, tableau de bord">
      {content}
    </Link>
  );
}
