'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ApiError, login } from '@/lib/api';

function getRedirectPath() {
  const redirect = new URLSearchParams(window.location.search).get('redirect');

  if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }

  return '/parametres';
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Email ou mot de passe incorrect.';
    }

    return error.message;
  }

  return 'Impossible de se connecter pour le moment.';
}

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      router.push(getRedirectPath());
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-8 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connectez-vous pour acceder au mode agence.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg p-2.5 text-gray-500 focus:outline-none focus:border-gray-400"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg p-2.5 text-gray-500 focus:outline-none focus:border-gray-400"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
        >
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="font-semibold text-blue-600 hover:underline">
            Creer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
