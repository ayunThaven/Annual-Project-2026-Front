'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AiCompletionResult,
  AiProviderStatus,
  AiProvidersResponse,
  ApiError,
  generateText,
  getAiProviders,
} from '@/lib/api';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Vous devez être connecté pour consulter les intégrations.';
    }

    return error.message;
  }

  return 'Impossible de charger les intégrations pour le moment.';
}

function ProviderStatusBadge({ provider }: { provider?: AiProviderStatus }) {
  if (!provider) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
        Indisponible
      </span>
    );
  }

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
        provider.configured
          ? 'bg-green-50 text-green-600'
          : 'bg-amber-50 text-amber-600'
      }`}
    >
      {provider.configured ? 'Configuré' : 'À configurer'}
    </span>
  );
}

export default function IntegrationsPage() {
  const [providersResponse, setProvidersResponse] =
    useState<AiProvidersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState(
    'Propose une idée de post LinkedIn sur le SEO technique en 3 lignes.',
  );
  const [testResult, setTestResult] = useState<AiCompletionResult | null>(null);

  const geminiProvider = useMemo(
    () =>
      providersResponse?.providers.find((provider) => provider.id === 'gemini'),
    [providersResponse],
  );
  const isGeminiDefault = providersResponse?.defaultProvider === 'gemini';
  const needsAuthentication =
    error === 'Vous devez être connecté pour consulter les intégrations.';

  async function loadProviders() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAiProviders();
      setProvidersResponse(response);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setProvidersResponse(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProviders();
  }, []);

  async function handleGeminiTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!testPrompt.trim() || !geminiProvider?.configured) {
      return;
    }

    setIsTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const result = await generateText({
        provider: 'gemini',
        model: geminiProvider.defaultModel,
        prompt: testPrompt,
        context: 'Test manuel depuis la page Intégrations de SEO Genius.',
        temperature: 0.4,
        maxTokens: 500,
      });

      setTestResult(result);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intégrations</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Contrôlez les services connectés à votre espace de travail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadProviders()}
            disabled={isLoading}
            className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
          >
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm font-medium text-red-600">
            <p>{error}</p>
            {needsAuthentication ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  href="/connexion?redirect=/integrations"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription?redirect=/integrations"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 text-white font-black text-xl rounded-lg flex items-center justify-center">
                  G
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">
                    Google Gemini
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modèle IA utilisé pour la génération de contenu.
                  </p>
                </div>
              </div>
              <ProviderStatusBadge provider={geminiProvider} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-gray-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Provider par défaut
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {isGeminiDefault ? 'Gemini' : providersResponse?.defaultProvider ?? '-'}
                </p>
              </div>
              <div className="border border-gray-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Modèle
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {geminiProvider?.defaultModel ?? '-'}
                </p>
              </div>
            </div>

            {geminiProvider?.missingConfig?.length ? (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-sm font-semibold text-amber-700">
                  Configuration serveur incomplète
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Variable manquante : {geminiProvider.missingConfig.join(', ')}
                </p>
              </div>
            ) : null}

            <form onSubmit={handleGeminiTest} className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase">
                Prompt de test
              </label>
              <textarea
                value={testPrompt}
                onChange={(event) => setTestPrompt(event.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-gray-400 resize-none"
              />
              <button
                type="submit"
                disabled={!geminiProvider?.configured || isTesting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
              >
                {isTesting ? 'Test en cours...' : 'Tester Gemini'}
              </button>
            </form>

            {testResult ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Réponse
                  </p>
                  <p className="text-xs text-gray-400">{testResult.model}</p>
                </div>
                <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                  {testResult.content}
                </p>
              </div>
            ) : null}
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black text-white font-black text-2xl rounded-lg flex items-center justify-center">
                  N
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Notion</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Espace central et calendrier éditorial.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                Bientôt
              </span>
            </div>

            <p className="text-gray-600 text-xs leading-relaxed">
              Les champs Notion sont conservés dans les paramètres agence. Le
              branchement complet pourra être activé quand le module Notion sera
              disponible côté API.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
