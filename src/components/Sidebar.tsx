"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, getProfile, logout, PublicUser } from "@/lib/api";

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
  { icon: "/icons/redaction.png", label: "Redaction", href: "/redaction" },
  { icon: "/icons/curration.png", label: "Curation", href: "/curation" },
  { icon: "/icons/contenus.png", label: "Mes contenus", href: "/contenus" },
  {
    icon: "/icons/idees.png",
    label: "Idees IA",
    href: "/idees",
    hasBadge: true,
  },
  { icon: "/icons/equipe.png", label: "Equipe", href: "/equipe" },
  {
    icon: "/icons/integrations.png",
    label: "Integrations",
    href: "/integrations",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isSelected = (href: string) => pathname === href;

  useEffect(() => {
    let ignoreResult = false;

    async function loadUser() {
      setIsLoadingUser(true);

      try {
        const profile = await getProfile();

        if (!ignoreResult) {
          setUser(profile);
        }
      } catch (caughtError) {
        if (!ignoreResult) {
          if (
            !(caughtError instanceof ApiError) ||
            caughtError.status !== 401
          ) {
            console.error(caughtError);
          }

          setUser(null);
        }
      } finally {
        if (!ignoreResult) {
          setIsLoadingUser(false);
        }
      }
    }

    void loadUser();

    return () => {
      ignoreResult = true;
    };
  }, [pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      setUser(null);
      router.push("/connexion");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
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

        {isLoadingUser ? (
          <div className="px-4 py-2.5 text-xs text-gray-400">Session...</div>
        ) : user ? (
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
              <span className="w-5 h-5 flex items-center justify-center text-sm">
                x
              </span>
              <span className="text-sm">
                {isLoggingOut ? "Deconnexion..." : "Deconnexion"}
              </span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/connexion"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isSelected("/connexion")
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
              <span className="text-sm">Connexion</span>
            </Link>

            <Link
              href="/inscription"
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isSelected("/inscription")
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "text-gray-600 hover:bg-gray-100 font-medium"
              }`}
            >
              <Image
                src="/icons/creer.png"
                alt=""
                width={16}
                height={16}
              />
              <span className="text-sm">Inscription</span>
            </Link>
          </>
        )}

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
          <span className="text-sm">Parametres</span>
        </Link>
      </div>
    </aside>
  );
}
