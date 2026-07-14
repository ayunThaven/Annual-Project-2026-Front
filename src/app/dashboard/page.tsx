"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  ContentIdea,
  ContentItem,
  CurrentAgency,
  CurationItem,
  getCurrentAgency,
  listContentIdeas,
  listContentItems,
  listCurationItems,
} from "@/lib/api";

type DashboardData = {
  agency: CurrentAgency;
  ideas: ContentIdea[];
  contents: ContentItem[];
  curation: CurationItem[];
};

const statusLabels = {
  IDEA: "À préparer",
  DRAFT: "Brouillon",
  IN_REVIEW: "À relire",
  SCHEDULED: "Planifié",
  PUBLISHED: "Publié",
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Impossible de charger votre espace de travail pour le moment.";
}

function formatDashboardDate(value?: string | null) {
  if (!value) return "Date à définir";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsAgency, setNeedsAgency] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignoreResult = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      setNeedsAgency(false);

      try {
        const agency = await getCurrentAgency();
        const [ideas, contents, curation] = await Promise.all([
          listContentIdeas(agency.agency.id),
          listContentItems(agency.agency.id),
          listCurationItems(agency.agency.id),
        ]);

        if (!ignoreResult) setData({ agency, ideas, contents, curation });
      } catch (caughtError) {
        if (ignoreResult) return;
        setData(null);

        if (caughtError instanceof ApiError && caughtError.status === 404) {
          setNeedsAgency(true);
        } else {
          setError(getErrorMessage(caughtError));
        }
      } finally {
        if (!ignoreResult) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      ignoreResult = true;
    };
  }, []);

  const newIdeas = useMemo(
    () => data?.ideas.filter((idea) => idea.status === "NEW") ?? [],
    [data],
  );
  const workInProgress = useMemo(
    () =>
      data?.contents.filter((content) =>
        ["IDEA", "DRAFT", "IN_REVIEW"].includes(content.status),
      ) ?? [],
    [data],
  );
  const scheduled =
    data?.contents.filter((content) => content.status === "SCHEDULED").length ?? 0;
  const published =
    data?.contents.filter((content) => content.status === "PUBLISHED").length ?? 0;
  const scheduledItems = useMemo(
    () =>
      (data?.contents ?? [])
        .filter((content) => content.status === "SCHEDULED")
        .sort((left, right) => {
          const leftDate = left.publicationDate
            ? new Date(left.publicationDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          const rightDate = right.publicationDate
            ? new Date(right.publicationDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          return leftDate - rightDate;
        }),
    [data],
  );
  const syncIssues = useMemo(
    () =>
      data?.contents.filter((content) =>
        ["ERROR", "CONFLICT"].includes(content.syncStatus ?? ""),
      ) ?? [],
    [data],
  );
  const reviewItems = useMemo(
    () => data?.contents.filter((content) => content.status === "IN_REVIEW") ?? [],
    [data],
  );
  const recentIdeas = useMemo(() => data?.ideas.slice(0, 3) ?? [], [data]);
  const recentCuration = useMemo(
    () =>
      [...(data?.curation ?? [])]
        .sort(
          (left, right) =>
            new Date(right.createdAt ?? 0).getTime() -
            new Date(left.createdAt ?? 0).getTime(),
        )
        .slice(0, 3),
    [data],
  );

  const nextAction = useMemo(() => {
    if (needsAgency) {
      return {
        eyebrow: "Première étape",
        title: "Créez votre espace agence",
        description:
          "Quelques informations suffisent pour activer les idées, la rédaction et le travail en équipe.",
        label: "Configurer mon espace",
        href: "/parametres?onboarding=1",
      };
    }

    if (!data) return null;

    if (newIdeas.length > 0) {
      return {
        eyebrow: `${newIdeas.length} idée${newIdeas.length > 1 ? "s" : ""} à décider`,
        title: "Choisissez votre prochain sujet",
        description:
          "Validez une idée pour la transformer en brief et poursuivre directement dans la rédaction.",
        label: "Examiner les idées",
        href: "/idees",
      };
    }

    if (workInProgress.length > 0) {
      return {
        eyebrow: "À reprendre",
        title: workInProgress[0].title,
        description: `Ce contenu est au statut « ${statusLabels[workInProgress[0].status]} ». Continuez là où vous vous êtes arrêté.`,
        label: "Continuer la rédaction",
        href: `/redaction?contentId=${workInProgress[0].id}`,
      };
    }

    if (data.contents.length === 0 && data.ideas.length === 0) {
      return {
        eyebrow: "Votre premier contenu",
        title: "Commencez par une idée guidée",
        description:
          "Donnez un thème et un secteur : l’IA préparera plusieurs angles à valider avant rédaction.",
        label: "Générer des idées",
        href: "/idees?generate=1",
      };
    }

    return {
      eyebrow: "Nouvelle opportunité",
      title: "Alimentez votre veille éditoriale",
      description:
        "Ajoutez une source ou un article pour nourrir les prochaines idées de contenu.",
      label: "Ouvrir la curation",
      href: "/curation",
    };
  }, [data, needsAgency, newIdeas, workInProgress]);

  const activationSteps = data
    ? [
        { label: "Espace agence créé", done: true, href: "/parametres" },
        {
          label: "Première source ajoutée",
          done: data.curation.length > 0 || Boolean(data.agency.agency.notionDatabaseId),
          href: "/curation",
        },
        {
          label: "Première idée validée",
          done: data.contents.length > 0,
          href: "/idees",
        },
        {
          label: "Premier brouillon rédigé",
          done: data.contents.some((content) => Boolean(content.body)),
          href: "/redaction",
        },
      ]
    : [];
  const completedSteps = activationSteps.filter((step) => step.done).length;
  const priorityItems = [
    newIdeas.length
      ? {
          key: "ideas",
          title: "Idées à décider",
          description: "Valider ou ignorer les nouveaux sujets",
          count: newIdeas.length,
          href: "/idees",
          tone: "blue",
        }
      : null,
    reviewItems.length
      ? {
          key: "reviews",
          title: "Contenus à relire",
          description: "Finaliser les contenus avant planification",
          count: reviewItems.length,
          href: "/contenus",
          tone: "amber",
        }
      : null,
    syncIssues.length
      ? {
          key: "sync",
          title: "Synchronisation à vérifier",
          description: "Des contenus sont en erreur ou en conflit",
          count: syncIssues.length,
          href: "/contenus",
          tone: "red",
        }
      : null,
    scheduledItems.length
      ? {
          key: "scheduled",
          title: "Prochaine publication",
          description: `${scheduledItems[0].title} · ${formatDashboardDate(
            scheduledItems[0].publicationDate,
          )}`,
          count: scheduledItems.length,
          href: "/contenus",
          tone: "gray",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="min-h-full bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Votre espace de travail
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-950 sm:text-3xl">
              Bonjour, que publie-t-on ensuite ?
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Une vue claire de ce qui mérite votre attention aujourd’hui.
            </p>
          </div>
          {data ? (
            <div className="hidden items-center gap-2 md:flex">
              {completedSteps === 4 ? (
                <>
                  <Link
                    href="/curation"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Ajouter une source
                  </Link>
                  <Link
                    href="/idees?generate=1"
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Générer des idées
                  </Link>
                </>
              ) : null}
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
                {data.agency.agency.name}
              </span>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8" aria-live="polite">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-7 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-gray-100" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Le tableau de bord n’a pas pu être chargé.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}

        {!isLoading && nextAction && completedSteps < 4 ? (
          <section className="overflow-hidden rounded-2xl bg-gray-950 text-white shadow-sm">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                  {nextAction.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{nextAction.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {nextAction.description}
                </p>
              </div>
              <Link
                href={nextAction.href}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {nextAction.label}
                <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
          </section>
        ) : null}

        {data ? (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Idées à valider", value: newIdeas.length, href: "/idees" },
                { label: "En cours", value: workInProgress.length, href: "/contenus" },
                { label: "Planifiés", value: scheduled, href: "/contenus" },
                { label: "Publiés", value: published, href: "/contenus" },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
                >
                  <p className="text-2xl font-bold text-gray-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{stat.label}</p>
                </Link>
              ))}
            </section>

            <div
              className={`grid gap-6 ${
                completedSteps < 4 || priorityItems.length
                  ? "lg:grid-cols-[1.5fr_1fr]"
                  : ""
              }`}
            >
              <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-950">File de production</h2>
                    <p className="mt-1 text-xs text-gray-500">Vos contenus à reprendre en priorité.</p>
                  </div>
                  <Link href="/contenus" className="text-xs font-bold text-blue-600 hover:underline">
                    Tout voir
                  </Link>
                </div>

                {workInProgress.length ? (
                  <div className="mt-5 divide-y divide-gray-100">
                    {workInProgress.slice(0, 4).map((content) => (
                      <div key={content.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">{content.title}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {content.contentType || "Contenu"} · {statusLabels[content.status]}
                          </p>
                        </div>
                        <Link
                          href={`/redaction?contentId=${content.id}`}
                          className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                          Continuer
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                    <p className="text-sm font-semibold text-gray-700">Votre file est à jour.</p>
                    <Link href="/idees?generate=1" className="mt-2 inline-block text-xs font-bold text-blue-600 hover:underline">
                      Préparer un nouveau sujet
                    </Link>
                  </div>
                )}
              </section>

              {completedSteps < 4 ? (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-950">Mise en route</h2>
                    <p className="mt-1 text-xs text-gray-500">{completedSteps}/4 étapes terminées</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                    {Math.round((completedSteps / 4) * 100)}%
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {activationSteps.map((step) => (
                    <Link
                      key={step.label}
                      href={step.href}
                      className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          step.done ? "bg-green-100 text-green-700" : "border border-gray-300 text-gray-400"
                        }`}
                      >
                        {step.done ? "✓" : ""}
                      </span>
                      <span className={step.done ? "text-gray-400 line-through" : "font-medium"}>
                        {step.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
              ) : priorityItems.length ? (
                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-950">Priorités</h2>
                      <p className="mt-1 text-xs text-gray-500">Les points qui demandent votre attention.</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                      {priorityItems.length} sujet{priorityItems.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2">
                    {priorityItems.map((priority) => {
                      const countClasses = {
                        blue: "bg-blue-100 text-blue-700",
                        amber: "bg-amber-100 text-amber-700",
                        red: "bg-red-100 text-red-700",
                        gray: "bg-gray-200 text-gray-700",
                      }[priority.tone];

                      return (
                        <Link
                          key={priority.key}
                          href={priority.href}
                          className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-3 hover:bg-gray-100"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900">{priority.title}</p>
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              {priority.description}
                            </p>
                          </div>
                          <span
                            className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-xs font-bold ${countClasses}`}
                          >
                            {priority.count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </div>

            {completedSteps === 4 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-950">Dernières idées</h2>
                      <p className="mt-1 text-xs text-gray-500">Les sujets les plus récemment proposés.</p>
                    </div>
                    <Link href="/idees" className="text-xs font-bold text-blue-600 hover:underline">
                      Toutes les idées
                    </Link>
                  </div>

                  {recentIdeas.length ? (
                    <div className="mt-5 divide-y divide-gray-100">
                      {recentIdeas.map((idea) => (
                        <Link
                          key={idea.id}
                          href={idea.acceptedContent ? `/redaction?contentId=${idea.acceptedContent.id}` : "/idees"}
                          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">{idea.title}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {idea.contentType || "Contenu"} · {idea.source === "SCHEDULED" ? "Automatique" : "Manuelle"}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                            idea.status === "NEW"
                              ? "bg-blue-50 text-blue-700"
                              : idea.status === "ACCEPTED"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                          }`}>
                            {idea.status === "NEW" ? "À décider" : idea.status === "ACCEPTED" ? "Validée" : "Ignorée"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
                      <p className="text-sm font-semibold text-gray-700">Aucune idée récente.</p>
                      <Link href="/idees?generate=1" className="mt-2 inline-block text-xs font-bold text-blue-600 hover:underline">
                        Lancer une génération
                      </Link>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-950">Veille récente</h2>
                      <p className="mt-1 text-xs text-gray-500">Les dernières sources ajoutées à la curation.</p>
                    </div>
                    <Link href="/curation" className="text-xs font-bold text-blue-600 hover:underline">
                      Ouvrir la veille
                    </Link>
                  </div>

                  {recentCuration.length ? (
                    <div className="mt-5 divide-y divide-gray-100">
                      {recentCuration.map((article) => (
                        <Link
                          key={article.id}
                          href="/curation"
                          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">{article.title}</p>
                            <p className="mt-1 truncate text-xs text-gray-500">
                              {article.source || "Import manuel"}
                              {article.topics?.length ? ` · ${article.topics.slice(0, 2).join(", ")}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-gray-400">
                            {formatDashboardDate(article.createdAt)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
                      <p className="text-sm font-semibold text-gray-700">Votre veille est encore vide.</p>
                      <Link href="/curation" className="mt-2 inline-block text-xs font-bold text-blue-600 hover:underline">
                        Ajouter une source
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
