"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import Badge from "@/components/ui/Badge";
import { ApiError, getContentItem, getCurrentAgency, type ContentItem } from "@/lib/api";

function formatDate(date?: string | null) {
  if (!date) return "Date à définir";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
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

export default function ContentPreviewPage() {
  const params = useParams<{ contentId: string }>();
  const contentId = Array.isArray(params.contentId) ? params.contentId[0] : params.contentId;
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) return;

    let ignoreResult = false;

    async function loadContent() {
      try {
        setIsLoading(true);
        setError(null);
        const currentAgency = await getCurrentAgency();
        const item = await getContentItem(currentAgency.agency.id, contentId);
        if (!ignoreResult) setContent(item);
      } catch (caughtError) {
        if (!ignoreResult) {
          setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de charger ce contenu.");
        }
      } finally {
        if (!ignoreResult) setIsLoading(false);
      }
    }

    void loadContent();
    return () => {
      ignoreResult = true;
    };
  }, [contentId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-7 h-12 max-w-3xl animate-pulse rounded bg-slate-200" />
        <div className="mt-8 h-[60dvh] animate-pulse rounded-3xl bg-slate-200/70" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <Link href="/contenus" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">← Retour aux contenus</Link>
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
          {error ?? "Ce contenu est introuvable."}
        </div>
      </div>
    );
  }

  const status = getStatus(content.status);

  return (
    <div className="min-h-full bg-[#f7f8fc] pb-10">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          <Link href="/contenus" className="inline-flex items-center text-sm font-bold text-slate-600 transition hover:text-indigo-600">← Retour aux contenus</Link>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-5xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={status.tone}>{status.label}</Badge>
                <span className="text-xs font-bold text-indigo-600">{content.contentType ?? content.channel ?? "Contenu"}</span>
                <span className="text-xs font-medium text-slate-400">Mis à jour le {formatDate(content.updatedAt ?? content.createdAt)}</span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{content.title}</h1>
            </div>
            <Link href={`/redaction?contentId=${content.id}`} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-700">Ouvrir dans la rédaction</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
        <article className="rounded-3xl border border-slate-200 bg-white px-5 py-8 text-slate-700 shadow-sm sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <MarkdownContent className="text-base leading-8 sm:text-lg sm:leading-9">
            {content.body ?? content.notes ?? "Aucun contenu disponible."}
          </MarkdownContent>
        </article>
      </main>
    </div>
  );
}
