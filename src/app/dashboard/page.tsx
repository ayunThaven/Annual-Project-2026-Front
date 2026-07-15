"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
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

type DashboardData = { agency: CurrentAgency; ideas: ContentIdea[]; contents: ContentItem[]; curation: CurationItem[] };

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Impossible de charger votre espace de travail pour le moment.";
}

function formatDate(value?: string | null) {
  if (!value) return "À planifier";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(value));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsAgency, setNeedsAgency] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const agency = await getCurrentAgency();
        const [ideas, contents, curation] = await Promise.all([
          listContentIdeas(agency.agency.id), listContentItems(agency.agency.id), listCurationItems(agency.agency.id),
        ]);
        if (!cancelled) setData({ agency, ideas, contents, curation });
      } catch (caughtError) {
        if (cancelled) return;
        setData(null);
        if (caughtError instanceof ApiError && caughtError.status === 404) setNeedsAgency(true);
        else setError(getErrorMessage(caughtError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void loadDashboard();
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => {
    const ideas = data?.ideas ?? [];
    const contents = data?.contents ?? [];
    const curation = data?.curation ?? [];
    return {
      newIdeas: ideas.filter((idea) => idea.status === "NEW"),
      inProgress: contents.filter((content) => ["IDEA", "DRAFT", "IN_REVIEW"].includes(content.status)),
      scheduled: contents.filter((content) => content.status === "SCHEDULED"),
      published: contents.filter((content) => content.status === "PUBLISHED"),
      recentIdeas: [...ideas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3),
      recentCuration: [...curation].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()).slice(0, 3),
    };
  }, [data]);

  const nextAction = useMemo(() => {
    if (needsAgency) return { label: "Configurer mon espace", title: "Créez votre espace agence", description: "Activez la veille, les idées et la rédaction collaborative en quelques minutes.", href: "/parametres?onboarding=1" };
    if (summary.newIdeas.length) return { label: "Examiner les idées", title: "Des opportunités attendent votre décision", description: `${summary.newIdeas.length} idée${summary.newIdeas.length > 1 ? "s" : ""} est prête à devenir un contenu.`, href: "/idees" };
    if (summary.inProgress.length) return { label: "Reprendre la rédaction", title: summary.inProgress[0].title, description: "Votre prochain contenu est prêt à être finalisé.", href: `/redaction?contentId=${summary.inProgress[0].id}` };
    return { label: "Générer des idées", title: "Donnez une impulsion à votre calendrier", description: "Partagez un thème : l’IA vous proposera des angles adaptés à votre stratégie.", href: "/idees?generate=1" };
  }, [needsAgency, summary]);

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Pilotage éditorial"
        title="Bonjour, prêt à faire avancer votre contenu ?"
        description="Une vue claire de votre production, de la prochaine action et des opportunités de la semaine."
        actions={data ? <Badge tone="indigo">{data.agency.agency.name}</Badge> : undefined}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        {isLoading ? <div className="grid gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200/60" />)}</div> : null}
        {error ? <Card className="border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error}</Card> : null}

        {!isLoading && !error ? (
          <>
            <section className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8 sm:py-9">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-2xl">
                  <Badge tone="indigo" className="border-white/10 bg-white/10 text-indigo-100">À faire maintenant</Badge>
                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{nextAction.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{nextAction.description}</p>
                </div>
                <Link href={nextAction.href} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-indigo-50">{nextAction.label} <span className="ml-2 text-indigo-600">→</span></Link>
              </div>
            </section>

            {data ? (
              <>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Link href="/idees"><StatCard value={summary.newIdeas.length} label="Idées à décider" detail="À trier dans votre inbox" icon="✦" /></Link>
                  <Link href="/contenus"><StatCard value={summary.inProgress.length} label="En production" detail="Briefs, brouillons et relectures" icon="↗" /></Link>
                  <Link href="/contenus"><StatCard value={summary.scheduled.length} label="Planifiés" detail="Dans votre calendrier" icon="◷" /></Link>
                  <Link href="/contenus"><StatCard value={summary.published.length} label="Publiés" detail="Contenus finalisés" icon="✓" /></Link>
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                  <Card className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Production</p><h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">À reprendre</h2></div>
                      <Link href="/contenus" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Tout voir</Link>
                    </div>
                    {summary.inProgress.length ? <div className="mt-5 divide-y divide-slate-100">
                      {summary.inProgress.slice(0, 4).map((content) => <div key={content.id} className="py-4 first:pt-0 last:pb-0"><div className="min-w-0"><p className="break-words text-sm font-bold leading-5 text-slate-900 [overflow-wrap:anywhere]">{content.title}</p><p className="mt-1 text-xs text-slate-500">{content.contentType || "Contenu"} · {content.status === "IN_REVIEW" ? "En relecture" : "Brouillon"}</p></div><Link href={`/redaction?contentId=${content.id}`} className="mt-3 inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Continuer</Link></div>)}
                    </div> : <div className="mt-5 rounded-2xl bg-slate-50 px-5 py-9 text-center"><p className="text-sm font-bold text-slate-800">Votre file est à jour.</p><Link href="/idees?generate=1" className="mt-2 inline-block text-xs font-bold text-indigo-600">Préparer un nouveau sujet</Link></div>}
                  </Card>

                  <Card className="p-5 sm:p-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Calendrier</p>
                    <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">Prochaines publications</h2>
                    {summary.scheduled.length ? <div className="mt-5 space-y-3">{summary.scheduled.slice(0, 3).map((content) => <Link key={content.id} href={`/redaction?contentId=${content.id}`} className="block rounded-xl bg-slate-50 p-3.5 transition hover:bg-indigo-50"><p className="text-xs font-bold text-indigo-600">{formatDate(content.publicationDate)}</p><p className="mt-1 break-words text-sm font-bold leading-5 text-slate-900 [overflow-wrap:anywhere]">{content.title}</p></Link>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5"><p className="text-sm font-semibold text-slate-600">Aucune publication planifiée.</p><Link href="/contenus" className="mt-2 inline-block text-xs font-bold text-indigo-600">Voir la bibliothèque</Link></div>}
                  </Card>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <Card className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Idées</p><h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">Dernières propositions</h2></div><Link href="/idees" className="text-xs font-bold text-indigo-600">Voir les idées</Link></div>{summary.recentIdeas.length ? <div className="mt-5 space-y-3">{summary.recentIdeas.map((idea) => <Link key={idea.id} href="/idees" className="block rounded-xl border border-slate-100 p-3.5 transition hover:border-indigo-100 hover:bg-indigo-50/40"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold text-slate-900">{idea.title}</p><Badge tone={idea.status === "NEW" ? "indigo" : idea.status === "ACCEPTED" ? "success" : "neutral"}>{idea.status === "NEW" ? "À décider" : idea.status === "ACCEPTED" ? "Ajoutée" : "Ignorée"}</Badge></div><p className="mt-1 text-xs text-slate-500">{idea.contentType || "Contenu"}</p></Link>)}</div> : <p className="mt-5 text-sm text-slate-500">Aucune idée récente.</p>}</Card>
                  <Card className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Veille</p><h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">Sources récentes</h2></div><Link href="/curation" className="text-xs font-bold text-indigo-600">Ouvrir la veille</Link></div>{summary.recentCuration.length ? <div className="mt-5 space-y-3">{summary.recentCuration.map((article) => <Link key={article.id} href="/curation" className="block rounded-xl border border-slate-100 p-3.5 transition hover:border-indigo-100 hover:bg-indigo-50/40"><p className="truncate text-sm font-bold text-slate-900">{article.title}</p><p className="mt-1 text-xs text-slate-500">{article.source || "Import manuel"} · {formatDate(article.createdAt)}</p></Link>)}</div> : <p className="mt-5 text-sm text-slate-500">Votre veille est encore vide.</p>}</Card>
                </section>
              </>
            ) : null}
            {needsAgency ? <EmptyState icon="✦" title="Votre studio vous attend" description="Créez votre agence afin d’activer les idées, la rédaction et la veille partagée." action={<Link href="/parametres?onboarding=1" className="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Configurer mon espace</Link>} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
