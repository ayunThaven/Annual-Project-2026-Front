'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import {
  acceptContentIdea,
  ApiError,
  ContentIdea,
  CurrentAgency,
  generateContentIdeas,
  getCurrentAgency,
  listContentIdeas,
  updateContentIdea,
} from '@/lib/api';

type IdeaCount = 3 | 5 | 10;

const countOptions: IdeaCount[] = [3, 5, 10];

const duplicateLabels = {
  UNIQUE: 'Unique',
  POSSIBLE_DUPLICATE: 'A verifier',
  DUPLICATE: 'Doublon probable',
};

const duplicateClasses = {
  UNIQUE: 'bg-green-50 text-green-700 border-green-100',
  POSSIBLE_DUPLICATE: 'bg-amber-50 text-amber-700 border-amber-100',
  DUPLICATE: 'bg-red-50 text-red-700 border-red-100',
};

const statusLabels = {
  NEW: 'A valider',
  ACCEPTED: 'Ajoute',
  DISMISSED: 'Ignore',
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Vous devez etre connecte.';
    if (error.status === 404) return 'Aucune agence active.';
    if (error.status === 400 && error.message.includes('not configured')) {
      return "Le provider IA n'est pas encore configure cote serveur.";
    }

    return error.message;
  }

  return 'Une erreur est survenue pendant le chargement des idees.';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function mergeIdeas(currentIdeas: ContentIdea[], nextIdeas: ContentIdea[]) {
  const byId = new Map<string, ContentIdea>();

  [...nextIdeas, ...currentIdeas].forEach((idea) => {
    byId.set(idea.id, idea);
  });

  return Array.from(byId.values()).sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export default function IdeesPage() {
  const router = useRouter();
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('');
  const [sector, setSector] = useState('');
  const [count, setCount] = useState<IdeaCount>(3);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: ideas.length,
      newIdeas: ideas.filter((idea) => idea.status === 'NEW').length,
      scheduled: ideas.filter((idea) => idea.source === 'SCHEDULED').length,
    }),
    [ideas],
  );

  async function loadIdeas() {
    setIsLoading(true);
    setError(null);

    try {
      const agency = await getCurrentAgency();
      const loadedIdeas = await listContentIdeas(agency.agency.id);

      setCurrentAgency(agency);
      setIdeas(loadedIdeas);
    } catch (caughtError) {
      setCurrentAgency(null);
      setIdeas([]);
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadIdeas();
  }, []);

  useEffect(() => {
    if (
      currentAgency &&
      new URLSearchParams(window.location.search).get('generate') === '1'
    ) {
      setIsGenerateModalOpen(true);
    }
  }, [currentAgency]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentAgency || !theme.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await generateContentIdeas(currentAgency.agency.id, {
        theme,
        sector: sector.trim() || undefined,
        count,
        checkDuplicates,
      });

      setIdeas((currentIdeas) => mergeIdeas(currentIdeas, result.ideas));
      setTheme('');
      setSector('');
      setCount(3);
      setCheckDuplicates(true);
      setIsGenerateModalOpen(false);
      setSuccess(`${result.ideas.length} idee(s) ajoutee(s) a l'inbox.`);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAccept(idea: ContentIdea) {
    if (!currentAgency || idea.status !== 'NEW') return;

    setAcceptingId(idea.id);
    setError(null);
    setSuccess(null);

    try {
      const updatedIdea = await acceptContentIdea(currentAgency.agency.id, idea.id);

      setIdeas((currentIdeas) =>
        currentIdeas.map((currentIdea) =>
          currentIdea.id === updatedIdea.id ? updatedIdea : currentIdea,
        ),
      );
      const contentId = updatedIdea.acceptedContent?.id;
      if (contentId) {
        router.push(`/redaction?contentId=${contentId}`);
      } else {
        setSuccess('Idée ajoutée aux contenus.');
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleDismiss(idea: ContentIdea) {
    if (!currentAgency || idea.status !== 'NEW') return;

    setDismissingId(idea.id);
    setError(null);
    setSuccess(null);

    try {
      const updatedIdea = await updateContentIdea(currentAgency.agency.id, idea.id, {
        status: 'DISMISSED',
      });

      setIdeas((currentIdeas) =>
        currentIdeas.map((currentIdea) =>
          currentIdea.id === updatedIdea.id ? updatedIdea : currentIdea,
        ),
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setDismissingId(null);
    }
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Idees de contenu IA
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Inbox de sujets SEO generes manuellement ou automatiquement
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={!currentAgency}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Générer</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-[11px] uppercase font-semibold text-gray-500">
              Total
            </p>
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-[11px] uppercase font-semibold text-gray-500">
              A valider
            </p>
            <p className="text-lg font-bold text-gray-900">{stats.newIdeas}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-[11px] uppercase font-semibold text-gray-500">
              Planifiees
            </p>
            <p className="text-lg font-bold text-gray-900">{stats.scheduled}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-8 sm:py-8">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500">
            Chargement des idees...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm font-medium text-red-600">
            <p>{error}</p>
            {error === 'Aucune agence active.' ? (
              <Link
                href="/parametres"
                className="inline-flex mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-xs"
              >
                Configurer une agence
              </Link>
            ) : null}
          </div>
        ) : null}

        {!isLoading && success ? (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm font-medium text-green-700">
            {success}
          </div>
        ) : null}

        {!isLoading && currentAgency && ideas.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Image
              src="/icons/idees.png"
              alt=""
              width={34}
              height={34}
              className="mx-auto opacity-70"
            />
            <h2 className="mt-3 text-base font-bold text-gray-900">
              Aucune idee pour le moment
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Lancez une generation ou activez la generation automatique.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {ideas.map((idea) => (
            <article
              key={idea.id}
              className={`bg-white rounded-lg border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md ${
                idea.status === 'DISMISSED'
                  ? 'border-gray-100 opacity-70'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                      {idea.source === 'SCHEDULED' ? 'Planifiee' : 'Manuelle'}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        duplicateClasses[idea.duplicateStatus]
                      }`}
                    >
                      {duplicateLabels[idea.duplicateStatus]}
                    </span>
                    <span className="rounded border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600">
                      {statusLabels[idea.status]}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-gray-900 leading-snug">
                    {idea.title}
                  </h2>
                </div>

                <span className="shrink-0 text-[11px] text-gray-400">
                  {formatDate(idea.createdAt)}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-gray-400">
                      Angle
                    </p>
                    <p className="text-gray-700">{idea.angle || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-gray-400">
                      Type
                    </p>
                    <p className="text-gray-700">{idea.contentType || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase font-semibold text-gray-400">
                    Intention SEO
                  </p>
                  <p className="text-gray-700">{idea.searchIntent || '-'}</p>
                </div>

                {idea.rationale ? (
                  <p className="text-gray-600 leading-relaxed">{idea.rationale}</p>
                ) : null}

                {idea.keywords?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {idea.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : null}

                {idea.similarItems?.length ? (
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                    <p className="font-semibold">Similarites detectees</p>
                    <p className="mt-1">
                      {idea.similarItems
                        .map((item) => `${item.title} (${Math.round(item.score * 100)}%)`)
                        .join(', ')}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                {idea.status === 'ACCEPTED' && idea.acceptedContent ? (
                  <Link
                    href={`/redaction?contentId=${idea.acceptedContent.id}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Ouvrir dans Rédaction
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleDismiss(idea)}
                      disabled={idea.status !== 'NEW' || dismissingId === idea.id}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:text-gray-300"
                    >
                      {dismissingId === idea.id ? '...' : 'Ignorer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleAccept(idea)}
                      disabled={idea.status !== 'NEW' || acceptingId === idea.id}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {acceptingId === idea.id ? 'Préparation...' : 'Préparer ce contenu'}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generer de nouvelles idees"
        description="Definissez un theme, un secteur et le nombre d'idees a proposer."
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <input
            type="text"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            placeholder="Theme principal : SEO, IA, marketing..."
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
            required
            maxLength={160}
          />

          <input
            type="text"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            placeholder="Secteur : e-commerce, agence, SaaS..."
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
            maxLength={120}
          />

          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value) as IdeaCount)}
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
          >
            {countOptions.map((option) => (
              <option key={option} value={option}>
                {option} idees
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={checkDuplicates}
              onChange={(event) => setCheckDuplicates(event.target.checked)}
            />
            Verifier les doublons
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isGenerating || !theme.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isGenerating ? 'Generation...' : 'Generer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
