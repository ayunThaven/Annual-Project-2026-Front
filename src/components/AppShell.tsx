"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ApiError, getProfile, PublicUser } from "@/lib/api";

const publicRoutes = ["/connexion", "/inscription", "/invitations"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const publicRoute = isPublicRoute(pathname);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(!publicRoute);
  const [sessionUnavailable, setSessionUnavailable] = useState(false);

  useEffect(() => {
    if (publicRoute) {
      setIsCheckingSession(false);
      return;
    }

    let ignoreResult = false;

    async function checkSession() {
      setIsCheckingSession(true);
      setSessionUnavailable(false);

      try {
        const profile = await getProfile();
        if (!ignoreResult) setUser(profile);
      } catch (caughtError) {
        if (ignoreResult) return;

        setUser(null);

        if (caughtError instanceof ApiError && caughtError.status === 401) {
          const redirect = encodeURIComponent(pathname);
          router.replace(`/connexion?redirect=${redirect}`);
          return;
        }

        setSessionUnavailable(true);
      } finally {
        if (!ignoreResult) setIsCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      ignoreResult = true;
    };
  }, [pathname, publicRoute, router]);

  if (publicRoute) {
    return <main className="min-h-dvh bg-gray-50">{children}</main>;
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
          Préparation de votre espace…
        </div>
      </div>
    );
  }

  if (!user && !sessionUnavailable) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      <Sidebar user={user} onLoggedOut={() => setUser(null)} />
      <main className="min-w-0 flex-1 overflow-auto pt-16 md:pt-0">
        {sessionUnavailable ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
            Le service est momentanément indisponible. Certaines données peuvent ne pas se charger.
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
