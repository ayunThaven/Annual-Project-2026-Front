"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, PublicUser } from "@/lib/api";
import AppLogo from "@/components/ui/AppLogo";

const navigationItems = [
  { icon: "/icons/tableau-de-bord.png", label: "Tableau de bord", href: "/dashboard" },
  { icon: "/icons/curration.png", label: "Veille", href: "/curation" },
  { icon: "/icons/idees.png", label: "Idées IA", href: "/idees", accent: true },
  { icon: "/icons/redaction.png", label: "Rédaction", href: "/redaction" },
  { icon: "/icons/contenus.png", label: "Bibliothèque", href: "/contenus" },
  { icon: "/icons/equipe.png", label: "Équipe", href: "/equipe" },
];

type SidebarProps = {
  user: PublicUser | null;
  onLoggedOut: () => void;
};

export default function Sidebar({ user, onLoggedOut }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isSelected = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => setIsMobileOpen(false), [pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      onLoggedOut();
      router.push("/connexion");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navigation = (
    <>
      <div className="px-5 pb-5 pt-6">
        <AppLogo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Navigation principale">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Espace de travail
        </p>
        {navigationItems.map((item) => {
          const active = isSelected(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-slate-100" : "bg-white/10 group-hover:bg-white/15"}`}>
                <Image
                  src={item.icon}
                  alt=""
                  width={18}
                  height={18}
                  className={`h-[18px] w-[18px] ${active ? "opacity-80" : "brightness-0 invert opacity-75"}`}
                />
              </span>
              <span className="font-semibold">{item.label}</span>
              {item.accent ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 mt-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
        {user ? (
          <div className="mb-1 flex items-center gap-3 px-2.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 to-violet-500 text-xs font-extrabold text-white">
              {(user.displayName || user.email).slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{user.displayName || user.email}</p>
              <p className="truncate text-[11px] text-slate-400">{user.email}</p>
            </div>
          </div>
        ) : null}

        <Link
          href="/profil"
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
            isSelected("/profil") ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"><Image src="/icons/utilisateur.png" alt="" width={15} height={15} className="h-[15px] w-[15px] brightness-0 invert opacity-80" /></span>
          <span className="font-semibold">Mon profil</span>
        </Link>
        <Link
          href="/parametres"
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
            isSelected("/parametres") ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"><Image src="/icons/parametres.png" alt="" width={15} height={15} className="h-[15px] w-[15px] brightness-0 invert opacity-80" /></span>
          <span className="font-semibold">Paramètres</span>
        </Link>
        {user ? (
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition-all hover:bg-slate-800 hover:text-white disabled:text-slate-600"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"><Image src="/icons/x.png" alt="" width={15} height={15} className="h-[15px] w-[15px] brightness-0 invert opacity-80" /></span>
            {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:hidden">
        <AppLogo compact />
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-700"
        >
          {isMobileOpen ? "×" : "☰"}
        </button>
      </header>

      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col bg-slate-950 shadow-2xl shadow-slate-950/20 transition-transform md:static md:min-h-dvh md:translate-x-0 md:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navigation}
      </aside>
    </>
  );
}
