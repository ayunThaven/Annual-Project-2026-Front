"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { ApiError, getAgencyContent, getCurrentAgency, type ContentItem } from "@/lib/api";

function formatDate(date?: string | null) {
  if (!date) return "Date à définir";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function getStatus(status?: string): { label: string; tone: "neutral" | "indigo" | "success" | "warning" } {
  switch (status) {
    case "DRAFT": return { label: "Brouillon", tone: "neutral" };
    case "PUBLISHED": return { label: "Publié", tone: "success" };
    case "SCHEDULED": return { label: "Planifié", tone: "indigo" };
    case "IN_REVIEW": return { label: "En relecture", tone: "warning" };
    case "IDEA": return { label: "À préparer", tone: "neutral" };
    default: return { label: status ?? "Inconnu", tone: "neutral" };
  }
}

function getNotionSync(content: ContentItem): { label: string; tone: "neutral" | "indigo" | "success" | "warning" | "danger" } | null {
  if (content.status !== "SCHEDULED" && content.status !== "PUBLISHED") return null;

  switch (content.syncStatus) {
    case "SYNCED": return { label: "Sur Notion", tone: "success" };
    case "ERROR": return { label: "Erreur de synchro Notion", tone: "danger" };
    case "CONFLICT": return { label: "Conflit Notion", tone: "warning" };
    default: return { label: "Synchro Notion en cours", tone: "neutral" };
  }
}

export default function ContenusPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContents() {
      try {
        setIsLoading(true);
        setError(null);
        const currentAgency = await getCurrentAgency();
        setContents(await getAgencyContent(currentAgency.agency.id));
      } catch (caughtError) {
        setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de charger vos contenus.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadContents();
  }, []);

  const counts = useMemo(() => ({
    drafts: contents.filter((content) => ["DRAFT", "IDEA", "IN_REVIEW"].includes(content.status)).length,
    scheduled: contents.filter((content) => content.status === "SCHEDULED").length,
    published: contents.filter((content) => content.status === "PUBLISHED").length,
  }), [contents]);

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Bibliothèque éditoriale"
        title="Vos contenus, au même endroit"
        description="Suivez chaque rédaction depuis le brief jusqu’à sa publication."
        actions={<Link href="/redaction" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-700">Nouvelle rédaction <span className="ml-2">→</span></Link>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "À finaliser", value: counts.drafts, detail: "Idées, brouillons et relectures" },
            { label: "Planifiés", value: counts.scheduled, detail: "En attente de publication" },
            { label: "Publiés", value: counts.published, detail: "Contenus finalisés" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <p className="text-xl font-extrabold tracking-tight text-slate-950">{item.value}</p>
              <p className="mt-0.5 text-xs font-bold text-slate-700">{item.label}</p>
              <p className="mt-1 text-[11px] text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />)}
          </div>
        ) : null}

        {error ? <Card className="border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error}</Card> : null}

        {!isLoading && !error && contents.length === 0 ? (
          <EmptyState
            icon="✦"
            title="Votre bibliothèque est prête"
            description="Créez votre première rédaction ou transformez une idée en brief pour l’alimenter."
            action={<Link href="/idees?generate=1" className="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700">Générer des idées</Link>}
          />
        ) : null}

        {!isLoading && !error && contents.length ? (
          <div className="grid gap-3">
            {contents.map((doc) => {
              const status = getStatus(doc.status);
              const notionSync = getNotionSync(doc);
              return (
                <Card key={doc.id} className="group p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5">
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">✎</div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={status.tone}>{status.label}</Badge>
                          {notionSync ? (
                            doc.notionPageId ? (
                              <a
                                href={`https://notion.so/${doc.notionPageId.replace(/-/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Badge tone={notionSync.tone}>{notionSync.label}</Badge>
                              </a>
                            ) : (
                              <Badge tone={notionSync.tone}>{notionSync.label}</Badge>
                            )
                          ) : null}
                          <span className="text-xs font-semibold text-indigo-600">{doc.contentType ?? doc.channel ?? "Contenu"}</span>
                        </div>
                        <h2 className="mt-2 break-words text-sm font-bold leading-6 text-slate-950 [overflow-wrap:anywhere] sm:text-base">{doc.title}</h2>
                        <p className="mt-1 text-xs text-slate-500">Mis à jour le {formatDate(doc.updatedAt ?? doc.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/contenus/${doc.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Aperçu</Link>
                      <Link href={`/redaction?contentId=${doc.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-3.5 text-xs font-bold text-white transition hover:bg-slate-800">{doc.status === "PUBLISHED" ? "Réutiliser" : "Continuer"}</Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>

    </div>
  );
}
