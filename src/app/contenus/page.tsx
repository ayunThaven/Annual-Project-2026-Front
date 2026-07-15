"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import Modal from "@/components/Modal";
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

export default function ContenusPage() {
  const [selectedDoc, setSelectedDoc] = useState<ContentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
              return (
                <Card key={doc.id} className="group p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">✎</div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={status.tone}>{status.label}</Badge>
                          <span className="text-xs font-semibold text-indigo-600">{doc.contentType ?? doc.channel ?? "Contenu"}</span>
                        </div>
                        <h2 className="mt-2 truncate text-sm font-bold text-slate-950 sm:text-base">{doc.title}</h2>
                        <p className="mt-1 text-xs text-slate-500">Mis à jour le {formatDate(doc.updatedAt ?? doc.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => { setSelectedDoc(doc); setIsPreviewOpen(true); }} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Aperçu</button>
                      <Link href={`/redaction?contentId=${doc.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-3.5 text-xs font-bold text-white transition hover:bg-slate-800">{doc.status === "PUBLISHED" ? "Réutiliser" : "Continuer"}</Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={selectedDoc?.title || "Aperçu du contenu"} description="Relisez le contenu avant de reprendre la rédaction.">
        {selectedDoc ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={getStatus(selectedDoc.status).tone}>{getStatus(selectedDoc.status).label}</Badge>
              <span className="text-xs font-bold text-indigo-600">{selectedDoc.contentType ?? selectedDoc.channel ?? "Contenu"}</span>
              <span className="text-xs text-slate-400">{formatDate(selectedDoc.updatedAt ?? selectedDoc.createdAt)}</span>
            </div>
            <div className="max-h-[45dvh] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4 text-slate-700">
              <MarkdownContent>{selectedDoc.body ?? selectedDoc.notes ?? "Aucun contenu disponible."}</MarkdownContent>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
              <button type="button" onClick={() => setIsPreviewOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Fermer</button>
              <Link href={`/redaction?contentId=${selectedDoc.id}`} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Ouvrir dans la rédaction</Link>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
