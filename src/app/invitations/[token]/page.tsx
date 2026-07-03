'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { acceptInvitation, ApiError } from '@/lib/api';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Vous devez etre connecte avec le compte invite pour accepter cette invitation.';
    }

    if (error.status === 403) {
      return "L'email du compte connecte ne correspond pas a cette invitation.";
    }

    return error.message;
  }

  return "Impossible d'accepter l'invitation pour le moment.";
}

export default function InvitationPage() {
  const params = useParams<{ token: string }>();
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const redirectPath = `/invitations/${params.token}`;
  const needsAuthentication =
    error ===
    'Vous devez etre connecte avec le compte invite pour accepter cette invitation.';

  async function handleAccept() {
    setIsAccepting(true);
    setError(null);

    try {
      await acceptInvitation(params.token);
      setAccepted(true);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Invitation agence</h1>
        <p className="text-sm text-gray-500 mt-2">
          Acceptez cette invitation pour rejoindre l&apos;espace de travail associe a
          votre compte.
        </p>

        {error ? (
          <div className="mt-5 bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
            <p>{error}</p>
            {needsAuthentication ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  href={`/connexion?redirect=${encodeURIComponent(redirectPath)}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href={`/inscription?redirect=${encodeURIComponent(redirectPath)}`}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Creer un compte
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        {accepted ? (
          <div className="mt-5 bg-green-50 border border-green-100 rounded-lg p-3 text-sm font-medium text-green-700">
            Invitation acceptee. Vous pouvez maintenant acceder a l&apos;equipe.
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href="/equipe"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Voir l&apos;equipe
          </Link>
          <button
            type="button"
            onClick={() => void handleAccept()}
            disabled={isAccepting || accepted}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {isAccepting ? 'Acceptation...' : accepted ? 'Acceptee' : "Accepter l'invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
