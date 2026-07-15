'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import {
  Agency,
  AgencyAiProvider,
  AgencyAiSettings,
  AiModelOption,
  ApiError,
  CurrentAgency,
  createAgency,
  disconnectNotion,
  getAgencyAiSettings,
  getCurrentAgency,
  getIdeaGenerationSettings,
  getNotionAuthorizeUrl,
  getNotionConnection,
  IdeaGenerationCadence,
  IdeaGenerationSettings,
  listAgencyAiModels,
  NotionConnection,
  updateAgency,
  updateAgencyAiSettings,
  updateIdeaGenerationSettings,
} from '@/lib/api';

type IdeaCount = 3 | 5 | 10;
type AiModelChoice = string;
type SettingsTab = 'organisation' | 'integrations' | 'automatisation' | 'ia';

const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'organisation', label: 'Organisation' },
  { id: 'integrations', label: 'Intégrations' },
  { id: 'automatisation', label: 'Automatisation' },
  { id: 'ia', label: 'IA et éditorial' },
];

const isDemoProviderAvailable = process.env.NODE_ENV !== 'production';

const weekdayOptions = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 7, label: 'Dimanche' },
];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Vous devez etre connecte pour configurer une agence.';
    }

    return error.message;
  }

  return 'Une erreur est survenue pendant le chargement des informations.';
}

function formatScheduleDate(value?: string | null) {
  if (!value) return 'Non planifie';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ParametresPage() {
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingsTab>('organisation');
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [agencyName, setAgencyName] = useState('SEO Genius Agency');
  const [aiProvider, setAiProvider] = useState<AgencyAiProvider>('gemini');
  const [aiModel, setAiModel] = useState('gemini-3.5-flash');
  const [aiModelChoice, setAiModelChoice] =
    useState<AiModelChoice>('gemini-3.5-flash');
  const [availableAiModels, setAvailableAiModels] = useState<AiModelOption[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiApiKeyConfigured, setGeminiApiKeyConfigured] = useState(false);
  const [clearGeminiApiKey, setClearGeminiApiKey] = useState(false);
  const [ideaCronEnabled, setIdeaCronEnabled] = useState(false);
  const [ideaCronCadence, setIdeaCronCadence] =
    useState<IdeaGenerationCadence>('DAILY');
  const [ideaCronTimeOfDay, setIdeaCronTimeOfDay] = useState('09:00');
  const [ideaCronWeekday, setIdeaCronWeekday] = useState(1);
  const [ideaCronTheme, setIdeaCronTheme] = useState('');
  const [ideaCronSector, setIdeaCronSector] = useState('');
  const [ideaCronCount, setIdeaCronCount] = useState<IdeaCount>(3);
  const [ideaCronCheckDuplicates, setIdeaCronCheckDuplicates] = useState(true);
  const [ideaCronNextRunAt, setIdeaCronNextRunAt] = useState<string | null>(null);
  const [ideaCronLastRunAt, setIdeaCronLastRunAt] = useState<string | null>(null);
  const [isLoadingAgency, setIsLoadingAgency] = useState(true);
  const [isLoadingIdeaSettings, setIsLoadingIdeaSettings] = useState(false);
  const [isLoadingAiSettings, setIsLoadingAiSettings] = useState(false);
  const [isLoadingAiModels, setIsLoadingAiModels] = useState(false);
  const [isSavingAgency, setIsSavingAgency] = useState(false);
  const [isSavingIdeaSettings, setIsSavingIdeaSettings] = useState(false);
  const [isSavingAiSettings, setIsSavingAiSettings] = useState(false);
  const [agencyError, setAgencyError] = useState<string | null>(null);
  const [agencySuccess, setAgencySuccess] = useState<string | null>(null);
  const [ideaSettingsError, setIdeaSettingsError] = useState<string | null>(null);
  const [ideaSettingsSuccess, setIdeaSettingsSuccess] = useState<string | null>(null);
  const [aiSettingsError, setAiSettingsError] = useState<string | null>(null);
  const [aiSettingsSuccess, setAiSettingsSuccess] = useState<string | null>(null);
  const [aiModelsError, setAiModelsError] = useState<string | null>(null);
  const [notionConnection, setNotionConnection] =
    useState<NotionConnection | null>(null);
  const [isLoadingNotion, setIsLoadingNotion] = useState(false);
  const [isConnectingNotion, setIsConnectingNotion] = useState(false);
  const [isDisconnectingNotion, setIsDisconnectingNotion] = useState(false);
  const [notionError, setNotionError] = useState<string | null>(null);
  const [notionBanner, setNotionBanner] = useState<'connected' | 'error' | null>(
    null,
  );

  const canEditAgency = !agency || currentAgency?.role === 'OWNER';
  const needsAuthentication =
    agencyError === 'Vous devez etre connecte pour configurer une agence.';

  function applyIdeaSettings(settings: IdeaGenerationSettings) {
    setIdeaCronEnabled(settings.enabled);
    setIdeaCronCadence(settings.cadence);
    setIdeaCronTimeOfDay(settings.timeOfDay);
    setIdeaCronWeekday(settings.weekday ?? 1);
    setIdeaCronTheme(settings.theme ?? '');
    setIdeaCronSector(settings.sector ?? '');
    setIdeaCronCount(settings.count);
    setIdeaCronCheckDuplicates(settings.checkDuplicates);
    setIdeaCronNextRunAt(settings.nextRunAt ?? null);
    setIdeaCronLastRunAt(settings.lastRunAt ?? null);
  }

  function applyAiSettings(settings: AgencyAiSettings) {
    setAiProvider(settings.provider);
    setAiModel(settings.model);
    setAiModelChoice(settings.model);
    setGeminiApiKey('');
    setGeminiApiKeyConfigured(settings.geminiApiKeyConfigured);
    setClearGeminiApiKey(false);
  }

  async function loadAiModels(
    agencyId: string,
    provider: AgencyAiProvider,
    selectedModel?: string,
  ) {
    setIsLoadingAiModels(true);
    setAiModelsError(null);

    try {
      const models = await listAgencyAiModels(agencyId, provider);
      const model = selectedModel ?? models[0]?.id ?? '';
      const isAvailable = models.some((option) => option.id === model);

      setAvailableAiModels(models);
      setAiModel(model);
      setAiModelChoice(isAvailable ? model : 'custom');
    } catch (caughtError) {
      setAvailableAiModels([]);
      setAiModelChoice('custom');
      setAiModelsError(getErrorMessage(caughtError));
    } finally {
      setIsLoadingAiModels(false);
    }
  }

  async function handleAiProviderChange(provider: AgencyAiProvider) {
    setAiProvider(provider);
    setAiModel('');
    setAiModelChoice('custom');

    if (currentAgency) {
      await loadAiModels(currentAgency.agency.id, provider);
    }
  }

  function handleAiModelChoiceChange(choice: AiModelChoice) {
    setAiModelChoice(choice);

    if (choice === 'custom') {
      setAiModel('');
      return;
    }

    setAiModel(choice);
  }

  async function loadIdeaSettings(agencyId: string) {
    setIsLoadingIdeaSettings(true);
    setIdeaSettingsError(null);

    try {
      const settings = await getIdeaGenerationSettings(agencyId);
      applyIdeaSettings(settings);
    } catch (caughtError) {
      setIdeaSettingsError(getErrorMessage(caughtError));
    } finally {
      setIsLoadingIdeaSettings(false);
    }
  }

  async function loadAiSettings(agencyId: string) {
    setIsLoadingAiSettings(true);
    setAiSettingsError(null);

    try {
      const settings = await getAgencyAiSettings(agencyId);
      applyAiSettings(settings);
      await loadAiModels(agencyId, settings.provider, settings.model);
    } catch (caughtError) {
      setAiSettingsError(getErrorMessage(caughtError));
    } finally {
      setIsLoadingAiSettings(false);
    }
  }

  async function loadNotionConnection(agencyId: string) {
    setIsLoadingNotion(true);
    setNotionError(null);

    try {
      const connection = await getNotionConnection(agencyId);
      setNotionConnection(connection);
    } catch (caughtError) {
      setNotionConnection(null);
      setNotionError(getErrorMessage(caughtError));
    } finally {
      setIsLoadingNotion(false);
    }
  }

  async function handleConnectNotion() {
    if (!currentAgency) return;

    setIsConnectingNotion(true);
    setNotionError(null);

    try {
      const { url } = await getNotionAuthorizeUrl(currentAgency.agency.id);
      window.location.href = url;
    } catch (caughtError) {
      setNotionError(getErrorMessage(caughtError));
      setIsConnectingNotion(false);
    }
  }

  async function handleDisconnectNotion() {
    if (!currentAgency) return;

    setIsDisconnectingNotion(true);
    setNotionError(null);

    try {
      await disconnectNotion(currentAgency.agency.id);
      await loadNotionConnection(currentAgency.agency.id);
      setNotionBanner(null);
    } catch (caughtError) {
      setNotionError(getErrorMessage(caughtError));
    } finally {
      setIsDisconnectingNotion(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notionStatus = params.get('notion');

    if (notionStatus === 'connected' || notionStatus === 'error') {
      setNotionBanner(notionStatus);
      // Nettoie le parametre de l'URL sans recharger la page.
      params.delete('notion');
      const query = params.toString();
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}`,
      );
    }
  }, []);

  useEffect(() => {
    async function loadAgency() {
      setIsLoadingAgency(true);
      setAgencyError(null);

      try {
        const current = await getCurrentAgency();
        setCurrentAgency(current);
        setAgency(current.agency);
        setAgencyName(current.agency.name);
        await Promise.all([
          loadIdeaSettings(current.agency.id),
          loadAiSettings(current.agency.id),
          loadNotionConnection(current.agency.id),
        ]);
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
    // Chargement initial uniquement ; les créations et sauvegardes rafraîchissent
    // explicitement leurs réglages via leurs propres handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        });

        setAgency(updatedAgency);
        setAgencyName(updatedAgency.name);
        setAgencySuccess('Agence mise a jour.');
      } else {
        const createdAgency = await createAgency({
          name: agencyName,
        });

        const current: CurrentAgency = {
          membershipId: createdAgency.membership.membershipId,
          role: createdAgency.membership.role,
          agency: createdAgency.agency,
        };

        setCurrentAgency(current);
        setAgency(createdAgency.agency);
        setAgencyName(createdAgency.agency.name);
        setAgencySuccess('Agence creee et rattachee a votre compte.');
        await Promise.all([
          loadIdeaSettings(createdAgency.agency.id),
          loadAiSettings(createdAgency.agency.id),
          loadNotionConnection(createdAgency.agency.id),
        ]);
      }
    } catch (caughtError) {
      setAgencyError(getErrorMessage(caughtError));
    } finally {
      setIsSavingAgency(false);
    }
  }

  async function handleIdeaSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentAgency || !canEditAgency) {
      return;
    }

    if (ideaCronEnabled && !ideaCronTheme.trim()) {
      setIdeaSettingsError('Un theme est requis pour activer le CRON.');
      return;
    }

    setIsSavingIdeaSettings(true);
    setIdeaSettingsError(null);
    setIdeaSettingsSuccess(null);

    try {
      const settings = await updateIdeaGenerationSettings(currentAgency.agency.id, {
        enabled: ideaCronEnabled,
        cadence: ideaCronCadence,
        timeOfDay: ideaCronTimeOfDay,
        weekday: ideaCronCadence === 'WEEKLY' ? ideaCronWeekday : null,
        timezone: 'Europe/Paris',
        theme: ideaCronTheme,
        sector: ideaCronSector,
        count: ideaCronCount,
        checkDuplicates: ideaCronCheckDuplicates,
      });

      applyIdeaSettings(settings);
      setIdeaSettingsSuccess('Generation automatique mise a jour.');
    } catch (caughtError) {
      setIdeaSettingsError(getErrorMessage(caughtError));
    } finally {
      setIsSavingIdeaSettings(false);
    }
  }

  async function handleAiSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentAgency || !canEditAgency || !aiModel.trim()) {
      return;
    }

    setIsSavingAiSettings(true);
    setAiSettingsError(null);
    setAiSettingsSuccess(null);

    try {
      const settings = await updateAgencyAiSettings(currentAgency.agency.id, {
        provider: aiProvider,
        model: aiModel.trim(),
        ...(geminiApiKey.trim() ? { geminiApiKey: geminiApiKey.trim() } : {}),
        ...(clearGeminiApiKey ? { clearGeminiApiKey: true } : {}),
      });

      applyAiSettings(settings);
      await loadAiModels(
        currentAgency.agency.id,
        settings.provider,
        settings.model,
      );
      setAiSettingsSuccess('Configuration IA mise a jour.');
    } catch (caughtError) {
      setAiSettingsError(getErrorMessage(caughtError));
    } finally {
      setIsSavingAiSettings(false);
    }
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 px-4 py-5 backdrop-blur sm:px-8 sm:py-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">Configuration</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          {agency ? 'Paramètres généraux' : 'Bienvenue dans SEO Genius'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {agency
            ? 'Configurez votre environnement de travail.'
            : 'Commençons par créer votre espace de travail.'}
        </p>
        {agency ? (
          <nav
            aria-label="Sections des paramètres"
            className="mt-5 -mb-5 flex gap-1 overflow-x-auto"
          >
            {settingsTabs.map((tab) => {
              const isActive = activeSettingsTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`settings-panel-${tab.id}`}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-8">
        {activeSettingsTab === 'organisation' ? (
          <section
            id="settings-panel-organisation"
            role="tabpanel"
            aria-labelledby="settings-tab-organisation"
            className="space-y-8"
          >
        {!isLoadingAgency && !agency && !agencyError ? (
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
              Étape 1 sur 3
            </p>
            <h2 className="mt-2 text-2xl font-bold">Donnez un nom à votre espace</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-300">
              Vous pourrez ensuite configurer l’IA, connecter Notion et inviter votre équipe. Ces réglages restent facultatifs pour démarrer.
            </p>
          </div>
        ) : null}
        <form
          onSubmit={handleAgencySubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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
              <p>{agencySuccess}</p>
              {agency ? (
                <Link href="/dashboard" className="mt-2 inline-block text-xs font-bold underline">
                  Continuer vers mon tableau de bord
                </Link>
              ) : null}
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
                  ? 'Enregistrer l’agence'
                  : 'Créer mon espace'}
            </button>
          </div>
        </form>
          </section>
        ) : null}

        {agency && activeSettingsTab === 'integrations' ? (
          <section
            id="settings-panel-integrations"
            role="tabpanel"
            aria-labelledby="settings-tab-integrations"
            className="space-y-8"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-black text-white font-black text-xl rounded-lg flex items-center justify-center">
                    N
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Notion</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Connectez votre espace Notion pour synchroniser vos contenus.
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    notionConnection?.connected
                      ? 'text-green-700'
                      : 'text-gray-400'
                  }`}
                >
                  {isLoadingNotion
                    ? '...'
                    : notionConnection?.connected
                      ? 'Connecte'
                      : 'Non connecte'}
                </span>
              </div>
            </div>

            {notionBanner === 'connected' ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm font-medium text-green-700">
                Notion a bien ete connecte a votre agence.
              </div>
            ) : null}

            {notionBanner === 'error' ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
                La connexion Notion a echoue. Veuillez reessayer.
              </div>
            ) : null}

            {notionError ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
                {notionError}
              </div>
            ) : null}

            {!canEditAgency ? (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm font-medium text-amber-700">
                Seul un administrateur peut connecter Notion.
              </div>
            ) : null}

            {notionConnection?.connected ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  Espace connecte :{' '}
                  <span className="font-semibold text-gray-900">
                    {notionConnection.workspaceName || 'Workspace Notion'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnectNotion}
                  disabled={isDisconnectingNotion || !canEditAgency}
                  className="bg-white hover:bg-gray-50 disabled:opacity-50 text-red-600 border border-gray-200 font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  {isDisconnectingNotion ? 'Deconnexion...' : 'Deconnecter'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Vous serez redirige vers Notion pour autoriser l&apos;acces.
                </p>
                <button
                  type="button"
                  onClick={handleConnectNotion}
                  disabled={isConnectingNotion || isLoadingNotion || !canEditAgency}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  {isConnectingNotion ? 'Redirection...' : 'Connecter Notion'}
                </button>
              </div>
            )}
          </div>
          </section>
        ) : null}

        {agency && activeSettingsTab === 'automatisation' ? (
          <section
            id="settings-panel-automatisation"
            role="tabpanel"
            aria-labelledby="settings-tab-automatisation"
            className="space-y-8"
          >
          <form
            onSubmit={handleIdeaSettingsSubmit}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4"
          >
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Generation automatique d&apos;idees
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Alimente l&apos;inbox d&apos;idees SEO sans creer de contenu.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={ideaCronEnabled}
                    onChange={(event) => setIdeaCronEnabled(event.target.checked)}
                    disabled={isLoadingIdeaSettings || !canEditAgency}
                  />
                  Actif
                </label>
              </div>
            </div>

            {ideaSettingsError ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
                {ideaSettingsError}
              </div>
            ) : null}

            {ideaSettingsSuccess ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm font-medium text-green-700">
                {ideaSettingsSuccess}
              </div>
            ) : null}

            {!canEditAgency ? (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm font-medium text-amber-700">
                Seul un administrateur peut modifier la generation automatique.
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Cadence
                </label>
                <select
                  value={ideaCronCadence}
                  onChange={(event) =>
                    setIdeaCronCadence(event.target.value as IdeaGenerationCadence)
                  }
                  disabled={isLoadingIdeaSettings || !canEditAgency}
                  className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                >
                  <option value="DAILY">Quotidien</option>
                  <option value="WEEKLY">Hebdomadaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Heure locale
                </label>
                <input
                  type="time"
                  value={ideaCronTimeOfDay}
                  onChange={(event) => setIdeaCronTimeOfDay(event.target.value)}
                  disabled={isLoadingIdeaSettings || !canEditAgency}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                />
              </div>

              {ideaCronCadence === 'WEEKLY' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Jour
                  </label>
                  <select
                    value={ideaCronWeekday}
                    onChange={(event) => setIdeaCronWeekday(Number(event.target.value))}
                    disabled={isLoadingIdeaSettings || !canEditAgency}
                    className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                  >
                    {weekdayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Nombre d&apos;idees
                </label>
                <select
                  value={ideaCronCount}
                  onChange={(event) =>
                    setIdeaCronCount(Number(event.target.value) as IdeaCount)
                  }
                  disabled={isLoadingIdeaSettings || !canEditAgency}
                  className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                >
                  <option value={3}>3 idees</option>
                  <option value={5}>5 idees</option>
                  <option value={10}>10 idees</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Theme
                </label>
                <input
                  type="text"
                  value={ideaCronTheme}
                  onChange={(event) => setIdeaCronTheme(event.target.value)}
                  disabled={isLoadingIdeaSettings || !canEditAgency}
                  placeholder="Ex: SEO local, IA generative, content marketing..."
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 disabled:bg-gray-50"
                  maxLength={160}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Secteur
                </label>
                <input
                  type="text"
                  value={ideaCronSector}
                  onChange={(event) => setIdeaCronSector(event.target.value)}
                  disabled={isLoadingIdeaSettings || !canEditAgency}
                  placeholder="Ex: SaaS, e-commerce, agence..."
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 disabled:bg-gray-50"
                  maxLength={120}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={ideaCronCheckDuplicates}
                onChange={(event) =>
                  setIdeaCronCheckDuplicates(event.target.checked)
                }
                disabled={isLoadingIdeaSettings || !canEditAgency}
              />
              Verifier les doublons avec les contenus et la curation
            </label>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
              <p>Prochaine execution : {formatScheduleDate(ideaCronNextRunAt)}</p>
              <p className="mt-1">
                Derniere execution : {formatScheduleDate(ideaCronLastRunAt)}
              </p>
              <p className="mt-1">Fuseau : Europe/Paris</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={
                  isLoadingIdeaSettings ||
                  isSavingIdeaSettings ||
                  !canEditAgency
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
              >
                {isSavingIdeaSettings ? 'Enregistrement...' : 'Enregistrer le CRON'}
              </button>
            </div>
          </form>
          </section>
        ) : null}

        {agency && activeSettingsTab === 'ia' ? (
          <section
            id="settings-panel-ia"
            role="tabpanel"
            aria-labelledby="settings-tab-ia"
            className="space-y-8"
          >
            
          <form
            onSubmit={handleAiSettingsSubmit}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4"
          >
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                Moteur d&apos;Intelligence Artificielle
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Ce reglage est partage par toute l&apos;agence. La cle n&apos;est jamais
                affichee apres son enregistrement.
              </p>
            </div>

            {aiSettingsError ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
                {aiSettingsError}
              </div>
            ) : null}

            {aiSettingsSuccess ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm font-medium text-green-700">
                {aiSettingsSuccess}
              </div>
            ) : null}

            {!canEditAgency ? (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm font-medium text-amber-700">
                Seul un administrateur peut modifier la configuration IA de l&apos;agence.
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Fournisseur
                </label>
                <select
                  value={aiProvider}
                  onChange={(event) =>
                    handleAiProviderChange(event.target.value as AgencyAiProvider)
                  }
                  disabled={isLoadingAiSettings || !canEditAgency}
                  className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                >
                  <option value="gemini">Google Gemini</option>
                  {isDemoProviderAvailable ? (
                    <option value="demo">Demo locale</option>
                  ) : null}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Modele par defaut
                </label>
                <select
                  value={aiModelChoice}
                  onChange={(event) => handleAiModelChoiceChange(event.target.value)}
                  disabled={
                    isLoadingAiSettings || isLoadingAiModels || !canEditAgency
                  }
                  className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
                >
                  {availableAiModels.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                  <option value="custom">Modele personnalise...</option>
                </select>

                {isLoadingAiModels ? (
                  <p className="text-xs text-gray-400 mt-1">
                    Chargement des modeles disponibles...
                  </p>
                ) : null}

                {aiModelsError ? (
                  <p className="text-xs text-amber-700 mt-1">
                    Liste indisponible : {aiModelsError}
                  </p>
                ) : null}

                {aiModelChoice === 'custom' ? (
                  <input
                    type="text"
                    value={aiModel}
                    onChange={(event) => setAiModel(event.target.value)}
                    disabled={isLoadingAiSettings || !canEditAgency}
                    placeholder="Ex: gemini-3.5-pro"
                    className="w-full mt-2 text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 disabled:bg-gray-50"
                    required
                    maxLength={160}
                  />
                ) : null}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">
                    Cle API Gemini
                  </label>
                  <span
                    className={`text-xs font-semibold ${
                      geminiApiKeyConfigured ? 'text-green-700' : 'text-gray-400'
                    }`}
                  >
                    {geminiApiKeyConfigured ? 'Cle configuree' : 'Aucune cle enregistree'}
                  </span>
                </div>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(event) => {
                    setGeminiApiKey(event.target.value);
                    setClearGeminiApiKey(false);
                  }}
                  disabled={
                    isLoadingAiSettings || !canEditAgency || aiProvider !== 'gemini'
                  }
                  placeholder={
                    geminiApiKeyConfigured
                      ? 'Saisissez une nouvelle cle pour la remplacer'
                      : 'Collez votre cle Gemini'
                  }
                  autoComplete="new-password"
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  La cle est chiffree et n&apos;est jamais renvoyee par le serveur.
                </p>
              </div>
            </div>

            {geminiApiKeyConfigured && aiProvider === 'gemini' ? (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={clearGeminiApiKey}
                  onChange={(event) => {
                    setClearGeminiApiKey(event.target.checked);
                    if (event.target.checked) setGeminiApiKey('');
                  }}
                  disabled={isLoadingAiSettings || !canEditAgency}
                />
                Supprimer la cle API enregistree pour cette agence
              </label>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoadingAiSettings || isSavingAiSettings || !canEditAgency}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
              >
                {isSavingAiSettings ? 'Enregistrement...' : 'Enregistrer la configuration IA'}
              </button>
            </div>
          </form>
          </section>
        ) : null}
      </div>
    </div>
  );
}
