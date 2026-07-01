'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, getProfile, logout, PublicUser } from '@/lib/api';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Vous devez etre connecte pour consulter votre profil.';
    }

    return error.message;
  }

  return 'Impossible de charger le profil pour le moment.';
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      router.push('/connexion');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Mon Compte</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Consultez la session active et les agences rattachees.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-sm text-gray-500">
            Chargement du profil...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <Link
              href="/connexion?redirect=/profil"
              className="inline-flex mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
            >
              Se connecter
            </Link>
          </div>
        ) : null}

        {!isLoading && user ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={user.displayName || 'Utilisateur'}
                    className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                  className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  {isLoggingOut ? 'Deconnexion...' : 'Se deconnecter'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h2 className="text-base font-bold text-gray-900">Agences</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Les agences associees a votre compte.
                </p>
              </div>

              {user.memberships?.length ? (
                <div className="space-y-3">
                  {user.memberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between border border-gray-100 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {membership.agency.name}
                        </p>
                        <p className="text-xs text-gray-400">{membership.agency.id}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {membership.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    Aucune agence rattachee pour le moment.
                  </p>
                  <Link
                    href="/parametres"
                    className="inline-flex mt-3 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Creer une agence
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
