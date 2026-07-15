"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import Modal from "@/components/Modal";
import {
  ApiError,
  CurationItem,
  CurationStatus,
  CurrentAgency,
  FeedSource,
  createCurationItem,
  createFeedSource,
  generateContent,
  getCurrentAgency,
  ingestAllFeedSources,
  ingestFeedSource,
  listCurationItems,
  listFeedSources,
  removeCurationItem,
  removeFeedSource,
  updateCurationItem,
  updateFeedSource,
} from "@/lib/api";

type ContentType = "Article de blog" | "Post LinkedIn" | "Newsletter";
type Tone = "Professionnel" | "Expert" | "Storytelling" | "Vulgarisation";

const statusLabels: Record<CurationStatus, string> = {
  TO_REVIEW: "À relire",
  REVIEWED: "Relu",
  SHARED: "Partagé",
};

const statusBadgeClasses: Record<CurationStatus, string> = {
  TO_REVIEW: "bg-amber-50 text-amber-600",
  REVIEWED: "bg-blue-50 text-blue-600",
  SHARED: "bg-green-50 text-green-600",
};

const statusOptions: CurationStatus[] = ["TO_REVIEW", "REVIEWED", "SHARED"];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return "Vous devez être connecté pour accéder à la curation.";
    if (error.status === 404) return "Les informations demandées sont introuvables.";
    return error.message;
  }

  return "Une erreur est survenue pendant le chargement de la curation.";
}

function formatDate(value?: string | null) {
  if (!value) return "Jamais";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CurationPage() {
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [feedSources, setFeedSources] = useState<FeedSource[]>([]);
  const [curationItems, setCurationItems] = useState<CurationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rss" | "articles">("rss");

  const [isRssModalOpen, setIsRssModalOpen] = useState(false);
  const [rssName, setRssName] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [isCreatingFeed, setIsCreatingFeed] = useState(false);

  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [importTitle, setImportTitle] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importCategory, setImportCategory] = useState("SEO");
  const [importTags, setImportTags] = useState("");
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<CurationItem | null>(null);

  const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("Article de blog");
  const [tone, setTone] = useState<Tone>("Professionnel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedDraftId, setGeneratedDraftId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [busyFeedId, setBusyFeedId] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [isIngestingAll, setIsIngestingAll] = useState(false);

  async function loadCuration() {
    setIsLoading(true);
    setError(null);

    try {
      const agency = await getCurrentAgency();
      setCurrentAgency(agency);

      const [feeds, items] = await Promise.all([
        listFeedSources(agency.agency.id),
        listCurationItems(agency.agency.id),
      ]);
      setFeedSources(feeds);
      setCurationItems(items);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setCurrentAgency(null);
      setFeedSources([]);
      setCurationItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCuration();
  }, []);

  async function handleCreateFeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentAgency || !rssUrl.trim()) return;

    setIsCreatingFeed(true);
    setError(null);

    try {
      const feed = await createFeedSource(currentAgency.agency.id, {
        url: rssUrl.trim(),
        name: rssName.trim() || undefined,
      });
      setFeedSources((current) => [feed, ...current]);
      setRssName("");
      setRssUrl("");
      setIsRssModalOpen(false);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsCreatingFeed(false);
    }
  }

  async function handleToggleFeed(feed: FeedSource) {
    if (!currentAgency) return;

    setBusyFeedId(feed.id);
    setError(null);

    try {
      const updated = await updateFeedSource(currentAgency.agency.id, feed.id, {
        enabled: !feed.enabled,
      });
      setFeedSources((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setBusyFeedId(null);
    }
  }

  async function handleIngestFeed(feed: FeedSource) {
    if (!currentAgency) return;

    setBusyFeedId(feed.id);
    setError(null);
    setNotice(null);

    try {
      const summary = await ingestFeedSource(currentAgency.agency.id, feed.id);
      setNotice(
        `${feed.name ?? feed.url} : ${summary.imported} article(s) importé(s), ${summary.skipped} ignoré(s).`,
      );
      const [feeds, items] = await Promise.all([
        listFeedSources(currentAgency.agency.id),
        listCurationItems(currentAgency.agency.id),
      ]);
      setFeedSources(feeds);
      setCurationItems(items);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setBusyFeedId(null);
    }
  }

  async function handleIngestAll() {
    if (!currentAgency) return;

    setIsIngestingAll(true);
    setError(null);
    setNotice(null);

    try {
      const summary = await ingestAllFeedSources(currentAgency.agency.id);
      setNotice(
        `${summary.imported} article(s) importé(s), ${summary.skipped} ignoré(s) sur l'ensemble des flux actifs.`,
      );
      const [feeds, items] = await Promise.all([
        listFeedSources(currentAgency.agency.id),
        listCurationItems(currentAgency.agency.id),
      ]);
      setFeedSources(feeds);
      setCurationItems(items);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsIngestingAll(false);
    }
  }

  async function handleRemoveFeed(feed: FeedSource) {
    if (!currentAgency) return;

    setBusyFeedId(feed.id);
    setError(null);

    try {
      await removeFeedSource(currentAgency.agency.id, feed.id);
      setFeedSources((current) => current.filter((item) => item.id !== feed.id));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setBusyFeedId(null);
    }
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentAgency || !importTitle.trim() || !importUrl.trim()) return;

    setIsCreatingItem(true);
    setError(null);

    try {
      const item = await createCurationItem(currentAgency.agency.id, {
        title: importTitle.trim(),
        sourceUrl: importUrl.trim(),
        source: importCategory,
        topics: importTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setCurationItems((current) => [item, ...current]);
      setImportTitle("");
      setImportUrl("");
      setImportCategory("SEO");
      setImportTags("");
      setIsUrlModalOpen(false);
      setActiveTab("articles");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsCreatingItem(false);
    }
  }

  async function handleStatusChange(item: CurationItem, status: CurationStatus) {
    if (!currentAgency) return;

    setBusyItemId(item.id);
    setError(null);

    try {
      const updated = await updateCurationItem(currentAgency.agency.id, item.id, {
        status,
      });
      setCurationItems((current) =>
        current.map((existing) => (existing.id === updated.id ? updated : existing)),
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleRemoveItem(item: CurationItem) {
    if (!currentAgency) return;

    setBusyItemId(item.id);
    setError(null);

    try {
      await removeCurationItem(currentAgency.agency.id, item.id);
      setCurationItems((current) => current.filter((existing) => existing.id !== item.id));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setBusyItemId(null);
    }
  }

  function openInspireModal(article: CurationItem) {
    setSelectedArticle(article);
    setGeneratedContent(null);
    setGeneratedDraftId(null);
    setGenerateError(null);
    setIsInspireModalOpen(true);
  }

  async function handleGenerate() {
    if (!currentAgency || !selectedArticle) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const result = await generateContent(currentAgency.agency.id, {
        title: selectedArticle.title,
        brief: selectedArticle.notes ?? selectedArticle.title,
        contentType,
        channel: contentType,
        tone,
        language: "francais",
        saveDraft: true,
      });
      setGeneratedContent(result.content);
      setGeneratedDraftId(result.item?.id ?? null);
    } catch (caughtError) {
      setGenerateError(getErrorMessage(caughtError));
    } finally {
      setIsGenerating(false);
    }
  }

  const activeFeedCount = feedSources.filter((feed) => feed.enabled).length;

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">Veille éditoriale</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Curation de contenu
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {currentAgency
                  ? `Agence active : ${currentAgency.agency.name}`
                  : "Suivez vos flux RSS et importez des sources pour nourrir votre IA"}
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:flex">
              <span className="font-bold text-slate-900">{activeFeedCount}</span> flux actifs
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsRssModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-700 sm:px-4 sm:text-sm"
            >
              <Image
                src="/icons/creer-white.png"
                alt=""
                width={16}
                height={16}
              />
              <span>Ajouter un flux RSS</span>
            </button>

            <button
              onClick={() => setIsUrlModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              <Image src="/icons/import.png" alt="" width={16} height={16} />
              <span>Importer une URL</span>
            </button>

            <button
              onClick={() => void handleIngestAll()}
              disabled={isIngestingAll || activeFeedCount === 0}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              {isIngestingAll ? "Synchronisation..." : "Tout synchroniser"}
            </button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto border-t border-slate-100 px-4 sm:gap-8 sm:px-8">
          <button
            onClick={() => setActiveTab("rss")}
            className={`border-b-2 py-3.5 text-sm font-bold transition-colors ${
              activeTab === "rss"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Flux RSS suivis
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`border-b-2 py-3.5 text-sm font-bold transition-colors ${
              activeTab === "articles"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Articles sauvegardés
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-8 sm:py-8">
        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Chargement de la curation...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!isLoading && notice && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
            {notice}
          </div>
        )}

        {!isLoading && !currentAgency && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">
              Aucune agence active
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Créez votre première agence dans les paramètres pour activer la curation.
            </p>

            <Link
              href="/parametres"
              className="inline-flex mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
            >
              Ouvrir les paramètres
            </Link>
          </div>
        )}

        {!isLoading && currentAgency && activeTab === "rss" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Flux</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Dernière synchronisation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {feedSources.map((feed) => (
                  <tr key={feed.id} className="hover:bg-gray-100/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {feed.name || feed.url}
                      </div>
                      <div className="text-xs text-gray-400">{feed.url}</div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => void handleToggleFeed(feed)}
                        disabled={busyFeedId === feed.id}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          feed.enabled
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {feed.enabled ? "Actif" : "Désactivé"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDate(feed.lastFetchedAt)}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => void handleIngestFeed(feed)}
                        disabled={busyFeedId === feed.id}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        Synchroniser
                      </button>
                      <button
                        onClick={() => void handleRemoveFeed(feed)}
                        disabled={busyFeedId === feed.id}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}

                {feedSources.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                      Aucun flux RSS pour le moment. Ajoutez-en un pour démarrer la curation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && currentAgency && activeTab === "articles" && (
          curationItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curationItems.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded">
                        {article.source || "Import manuel"}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {formatDate(article.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                      {article.title}
                    </h3>

                    {article.notes && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3 leading-relaxed">
                        {article.notes}
                      </p>
                    )}

                    <select
                      value={article.status}
                      onChange={(event) =>
                        void handleStatusChange(article, event.target.value as CurationStatus)
                      }
                      disabled={busyItemId === article.id}
                      className={`mb-4 text-xs font-medium border-0 rounded-full px-2.5 py-1 focus:outline-none ${statusBadgeClasses[article.status]}`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => openInspireModal(article)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Image
                        src="/icons/creer-white.png"
                        alt=""
                        width={16}
                        height={16}
                      />
                      <span>Inspirer l&apos;IA</span>
                    </button>

                    <button
                      onClick={() => {
                        if (article.sourceUrl) {
                          window.open(article.sourceUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                    >
                      <Image
                        src="/icons/voir.png"
                        alt="Voir la source"
                        width={18}
                        height={18}
                      />
                    </button>

                    <button
                      onClick={() => void handleRemoveItem(article)}
                      disabled={busyItemId === article.id}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors shrink-0 text-red-500 text-xs font-bold disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-lg font-medium">
                Aucun article sauvegardé
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Utilisez le bouton &quot;Importer une URL&quot; ou synchronisez un flux RSS pour en ajouter.
              </p>
            </div>
          )
        )}
      </div>

      <Modal
        isOpen={isRssModalOpen}
        onClose={() => setIsRssModalOpen(false)}
        title="Ajouter un flux RSS"
        description="Ajoutez une source de veille pour nourrir automatiquement votre IA."
      >
        <form onSubmit={handleCreateFeed} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              Nom du flux
            </label>
            <input
              type="text"
              value={rssName}
              onChange={(event) => setRssName(event.target.value)}
              placeholder="Ex: TechCrunch AI"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              URL du flux RSS
            </label>
            <input
              type="url"
              value={rssUrl}
              onChange={(event) => setRssUrl(event.target.value)}
              placeholder="https://exemple.com/feed"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setIsRssModalOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isCreatingFeed}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isCreatingFeed ? "Ajout..." : "Ajouter la source"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        title="Importer un article"
        description="Importez un article depuis une URL pour l'utiliser comme source d'inspiration."
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Titre
            </label>

            <input
              type="text"
              value={importTitle}
              onChange={(event) => setImportTitle(event.target.value)}
              placeholder="Titre de l'article"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              URL de l&apos;article
            </label>

            <input
              type="url"
              value={importUrl}
              onChange={(event) => setImportUrl(event.target.value)}
              placeholder="https://www.exemple.com/article"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Catégorie
            </label>

            <select
              value={importCategory}
              onChange={(event) => setImportCategory(event.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-500 text-sm bg-white focus:border-gray-400 focus:outline-none"
            >
              <option>SEO</option>
              <option>Marketing</option>
              <option>Intelligence artificielle</option>
              <option>Content Marketing</option>
              <option>Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Tags
            </label>

            <input
              type="text"
              value={importTags}
              onChange={(event) => setImportTags(event.target.value)}
              placeholder="SEO, IA, Google..."
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isCreatingItem}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isCreatingItem ? "Import..." : "Importer l'article"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isInspireModalOpen}
        onClose={() => setIsInspireModalOpen(false)}
        title="Inspirer la rédaction IA"
        description="Utilisez cet article comme contexte pour générer un nouveau contenu."
      >
        {selectedArticle && (
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Article sélectionné
              </p>
              <h3 className="mt-1 text-sm font-bold text-gray-900">
                {selectedArticle.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Source : {selectedArticle.source || "Import manuel"}
              </p>
            </div>

            {!generatedContent && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                    Type de contenu
                  </label>
                  <select
                    value={contentType}
                    onChange={(event) => setContentType(event.target.value as ContentType)}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
                  >
                    <option>Article de blog</option>
                    <option>Post LinkedIn</option>
                    <option>Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                    Ton
                  </label>
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value as Tone)}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
                  >
                    <option>Professionnel</option>
                    <option>Expert</option>
                    <option>Storytelling</option>
                    <option>Vulgarisation</option>
                  </select>
                </div>
              </>
            )}

            {generateError && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs font-medium text-red-600">
                {generateError}
              </div>
            )}

            {generatedContent && (
              <div className="rounded-lg border border-green-100 bg-green-50 p-4 max-h-64 overflow-y-auto">
                <p className="mb-2 text-xs font-semibold text-green-700">
                  Contenu généré et enregistré en brouillon
                </p>
                <MarkdownContent className="text-gray-700">
                  {generatedContent}
                </MarkdownContent>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsInspireModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {generatedContent ? "Plus tard" : "Annuler"}
              </button>

              {generatedContent && generatedDraftId ? (
                <Link
                  href={`/redaction?contentId=${generatedDraftId}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Continuer dans Rédaction
                </Link>
              ) : null}

              {!generatedContent && (
                <button
                  onClick={() => void handleGenerate()}
                  disabled={isGenerating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isGenerating ? "Génération..." : "Générer le contenu"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
