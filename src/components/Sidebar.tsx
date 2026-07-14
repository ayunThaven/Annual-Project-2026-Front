"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, PublicUser } from "@/lib/api";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  hasBadge?: boolean;
}

const navigationItems: NavItem[] = [
  {
    icon: "/icons/tableau-de-bord.png",
    label: "Tableau de bord",
    href: "/dashboard",
  },
  { icon: "/icons/curration.png", label: "Curation", href: "/curation" },
  {
    icon: "/icons/idees.png",
    label: "Idées IA",
    href: "/idees",
    hasBadge: true,
  },
  { icon: "/icons/redaction.png", label: "Rédaction", href: "/redaction" },
  { icon: "/icons/contenus.png", label: "Mes contenus", href: "/contenus" },
  { icon: "/icons/equipe.png", label: "Équipe", href: "/equipe" },
  {
    icon: "/icons/integrations.png",
    label: "Intégrations",
    href: "/integrations",
  },
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

  const isSelected = (href: string) => pathname === href;

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

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <h1 className="font-bold text-gray-700 text-lg">SEO Genius</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item, index) => {
          const active = isSelected(item.href);
          return (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                active
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
              }`}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                className={`w-5 h-5 ${active ? "opacity-100" : "opacity-75"}`}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        {user ? (
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        ) : null}

        {user ? (
          <>
            <Link
              href="/profil"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isSelected("/profil")
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "text-gray-600 hover:bg-gray-100 font-medium"
              }`}
            >
              <Image
                src="/icons/utilisateur.png"
                alt=""
                width={20}
                height={20}
                className="w-5 h-5 opacity-75"
              />
              <span className="text-sm">Utilisateur</span>
            </Link>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-gray-600 hover:bg-gray-100 font-medium disabled:text-gray-300"
            >
              <Image
                src="/icons/x.png"
                alt=""
                width={20}
                height={20}
                className="w-5 h-5 opacity-75"
              />
              <span className="text-sm">
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </span>
            </button>
          </>
        ) : null}

        <Link
          href="/parametres"
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
            isSelected("/parametres")
              ? "bg-gray-100 text-gray-900 font-bold"
              : "text-gray-600 hover:bg-gray-100 font-medium"
          }`}
        >
          <Image
            src="/icons/parametres.png"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5 opacity-75"
          />
          <span className="text-sm">Paramètres</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-gray-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-purple-600 text-white">
            S
          </span>
          SEO Genius
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-xl text-gray-700"
        >
          {isMobileOpen ? "×" : "☰"}
        </button>
      </header>

      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform md:static md:min-h-dvh md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
