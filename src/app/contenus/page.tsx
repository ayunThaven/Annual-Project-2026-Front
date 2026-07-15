"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MarkdownContent from '@/components/MarkdownContent';
import Modal from '@/components/Modal';
import {
  ApiError,
  getAgencyContent,
  getCurrentAgency,
  type ContentItem,
} from "@/lib/api";

function formatDate(date?: string | null) {
  if (!date) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "DRAFT":
      return "Brouillon";
    case "PUBLISHED":
      return "Publié";
    case "SCHEDULED":
      return "Planifié";
    case "IN_REVIEW":
      return "En relecture";
    case "IDEA":
      return "Idée";
    default:
      return status ?? "Inconnu";
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
        const items = await getAgencyContent(currentAgency.agency.id);

        setContents(items);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Impossible de charger vos contenus.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadContents();
  }, []);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes contenus</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Accédez à l&apos;historique de toutes vos rédactions et vérifiez leur état
          de publication
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-4">
        {isLoading && (
          <p className="text-sm text-gray-500">Chargement des contenus...</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && contents.length === 0 && (
          <p className="text-sm text-gray-500">Aucun contenu pour le moment.</p>
        )}

        {contents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                <Image
                  src="/icons/contenus.png"
                  alt=""
                  width={18}
                  height={18}
                  className="opacity-70"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug">
                  {doc.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="font-semibold text-blue-600">
                    {doc.contentType ?? doc.channel ?? "Contenu"}
                  </span>
                  <span>•</span>
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                {getStatusLabel(doc.status)}
              </span>

              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setIsPreviewOpen(true);
                }}
                aria-label={`Prévisualiser ${doc.title}`}
                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100"
              >
                <Image
                  src="/icons/voir.png"
                  alt="Voir"
                  width={16}
                  height={16}
                />
              </button>
              <Link
                href={`/redaction?contentId=${doc.id}`}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                {doc.status === 'PUBLISHED' ? 'Réutiliser' : 'Continuer'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={selectedDoc?.title || "Aperçu du contenu"}
        description="Prévisualisez le contenu généré et son état de synchronisation."
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Type
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {selectedDoc.contentType ?? selectedDoc.channel ?? "Contenu"}
                  </p>
                </div>

                <span className="rounded-full border border-gray-100 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                  {getStatusLabel(selectedDoc.status)}
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                Date
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {formatDate(selectedDoc.createdAt)}
              </p>

              <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                Contenu
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {selectedDoc.body ?? selectedDoc.notes ?? "Aucun contenu disponible."}
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}