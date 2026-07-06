'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import {
  Agency,
  ApiError,
  CurrentAgency,
  createAgency,
  getCurrentAgency,
  updateAgency,
} from '@/lib/api';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Vous devez etre connecte pour configurer une agence.';
    }

    return error.message;
  }

  return 'Une erreur est survenue pendant le chargement des informations.';
}

export default function ParametresPage() {
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [agencyName, setAgencyName] = useState('SEO Genius Agency');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const [notionWorkspaceName, setNotionWorkspaceName] = useState('');
  const [modelIA, setModelIA] = useState('gemini-2.0-flash');
  const [isLoadingAgency, setIsLoadingAgency] = useState(true);
  const [isSavingAgency, setIsSavingAgency] = useState(false);
  const [agencyError, setAgencyError] = useState<string | null>(null);
  const [agencySuccess, setAgencySuccess] = useState<string | null>(null);

  const canEditAgency = !agency || currentAgency?.role === 'OWNER';
  const needsAuthentication =
    agencyError === 'Vous devez etre connecte pour configurer une agence.';

  useEffect(() => {
    async function loadAgency() {
      setIsLoadingAgency(true);
      setAgencyError(null);

      try {
        const current = await getCurrentAgency();
        setCurrentAgency(current);
        setAgency(current.agency);
        setAgencyName(current.agency.name);
        setNotionDatabaseId(current.agency.notionDatabaseId ?? '');
        setNotionWorkspaceName(current.agency.notionWorkspaceName ?? '');
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 404) {
          setCurrentAgency(null);
          setAgency(null);
          return;
        }

        setAgencyError(getErrorMessage(caughtError));
      } finally {
        setIsLoadingAgency(false);
      }
    }

    void loadAgency();
  }, []);

  async function handleAgencySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!agencyName.trim() || !canEditAgency) {
      return;
    }

    setIsSavingAgency(true);
    setAgencyError(null);
    setAgencySuccess(null);

    try {
      if (agency) {
        const updatedAgency = await updateAgency(agency.id, {
          name: agencyName,
          notionDatabaseId,
          notionWorkspaceName,
        });

        setAgency(updatedAgency);
        setAgencyName(updatedAgency.name);
        setNotionDatabaseId(updatedAgency.notionDatabaseId ?? '');
        setNotionWorkspaceName(updatedAgency.notionWorkspaceName ?? '');
        setAgencySuccess('Agence mise a jour.');
      } else {
        const createdAgency = await createAgency({
          name: agencyName,
          notionDatabaseId,
          notionWorkspaceName,
        });

        const current: CurrentAgency = {
          membershipId: createdAgency.membership.membershipId,
          role: createdAgency.membership.role,
          agency: createdAgency.agency,
        };

        setCurrentAgency(current);
        setAgency(createdAgency.agency);
        setAgencyName(createdAgency.agency.name);
        setNotionDatabaseId(createdAgency.agency.notionDatabaseId ?? '');
        setNotionWorkspaceName(createdAgency.agency.notionWorkspaceName ?? '');
        setAgencySuccess('Agence creee et rattachee a votre compte.');
      }
    } catch (caughtError) {
      setAgencyError(getErrorMessage(caughtError));
    } finally {
      setIsSavingAgency(false);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Parametres Generaux</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Configurez l&apos;environnement global de votre application SaaS
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">
        <form
          onSubmit={handleAgencySubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4"
        >
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Mon Organisation / Agence</h2>
            <p className="text-xs text-gray-500 mt-1">
              {agency
                ? 'Modifiez les informations generales de votre agence.'
                : 'Creez la premiere agence pour activer le mode equipe.'}
            </p>
          </div>

          {agencyError ? (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
              <p>{agencyError}</p>
              {needsAuthentication ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link
                    href="/connexion?redirect=/parametres"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/inscription?redirect=/parametres"
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                  >
                    Creer un compte
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {agencySuccess ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm font-medium text-green-700">
              {agencySuccess}
            </div>
          ) : null}

          {!canEditAgency ? (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm font-medium text-amber-700">
              Seul un administrateur peut modifier les informations de l&apos;agence.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Nom de l&apos;agence
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(event) => setAgencyName(event.target.value)}
                disabled={isLoadingAgency || !canEditAgency}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Base Notion
              </label>
              <input
                type="text"
                value={notionDatabaseId}
                onChange={(event) => setNotionDatabaseId(event.target.value)}
                disabled={isLoadingAgency || !canEditAgency}
                placeholder="ID de la database"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Workspace Notion
              </label>
              <input
                type="text"
                value={notionWorkspaceName}
                onChange={(event) => setNotionWorkspaceName(event.target.value)}
                disabled={isLoadingAgency || !canEditAgency}
                placeholder="Nom du workspace"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoadingAgency || isSavingAgency || !canEditAgency}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
            >
              {isSavingAgency
                ? 'Enregistrement...'
                : agency
                  ? 'Enregistrer l agence'
                  : 'Creer l agence'}
            </button>
          </div>
        </form>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Contexte Editorial Global
          </h2>
          <p className="text-gray-500 text-xs">
            Definissez des regles que l&apos;IA appliquera secretement a toutes vos
            redactions pour eviter le contenu creux.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Mots-cles interdits ou a eviter
              </label>
              <input
                type="text"
                placeholder="Ex: revolutionnaire, disruptive, game-changer..."
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Description de la cible editoriale principale
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Directeurs marketing en agence, consultants SEO independants recherchant de la valeur concrete..."
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Moteur d&apos;Intelligence Artificielle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Modele LLM par defaut
              </label>
              <select
                value={modelIA}
                onChange={(event) => setModelIA(event.target.value)}
                className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400"
              >
                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                <option value="demo-local">Demo locale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Cle d&apos;API cloturee
              </label>
              <input
                type="password"
                value="****************************"
                disabled
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
