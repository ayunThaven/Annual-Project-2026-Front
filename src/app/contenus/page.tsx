'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MarkdownContent from '@/components/MarkdownContent';
import Modal from '@/components/Modal';
import {
  ApiError,
  ContentItem,
  CurrentAgency,
  getCurrentAgency,
  listContentItems,
} from '@/lib/api';

const statusLabels = {
  IDEA: 'Idee',
  DRAFT: 'Brouillon',
  IN_REVIEW: 'En revue',
  SCHEDULED: 'Planifie',
  PUBLISHED: 'Publie',
};

const syncLabels = {
  PENDING: 'A synchroniser',
  SYNCED: 'Synchronise',
  CONFLICT: 'Conflit',
  ERROR: 'Erreur sync',
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Vous devez etre connecte.';
    if (error.status === 404) return 'Aucune agence active.';

    return error.message;
  }

  return 'Une erreur est survenue pendant le chargement des contenus.';
}

function formatDate(value?: string | null) {
  if (!value) return 'Aucune date';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function ContenusPage() {
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ContentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContents() {
      setIsLoading(true);
      setError(null);

      try {
        const agency = await getCurrentAgency();
        const loadedContents = await listContentItems(agency.agency.id);

        setCurrentAgency(agency);
        setContents(loadedContents);
      } catch (caughtError) {
        setCurrentAgency(null);
        setContents([]);
        setError(getErrorMessage(caughtError));
      } finally {
        setIsLoading(false);
      }
    }

    void loadContents();
  }, []);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes contenus</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Historique editorial de l&apos;agence et sujets acceptes depuis les idees
        </p>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-8 sm:py-8">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500">
            Chargement des contenus...
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

        {!isLoading && currentAgency && contents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Image
              src="/icons/contenus.png"
              alt=""
              width={34}
              height={34}
              className="mx-auto opacity-70"
            />
            <h2 className="mt-3 text-base font-bold text-gray-900">
              Aucun contenu pour le moment
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Acceptez une idee pour l&apos;ajouter au calendrier editorial.
            </p>
            <Link
              href="/idees?generate=1"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Générer des idées
            </Link>
          </div>
        ) : null}

        {contents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                <Image
                  src="/icons/contenus.png"
                  alt=""
                  width={18}
                  height={18}
                  className="opacity-70"
                />
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                  {doc.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                  <span className="font-semibold text-blue-600">
                    {doc.contentType || 'Contenu'}
                  </span>
                  <span>{statusLabels[doc.status]}</span>
                  <span>Cree le {formatDate(doc.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:shrink-0">
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                {doc.syncStatus ? syncLabels[doc.syncStatus] : 'Local'}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedDoc(doc);
                  setIsPreviewOpen(true);
                }}
                aria-label={`Prévisualiser ${doc.title}`}
                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100"
              >
                <Image src="/icons/voir.png" alt="Voir" width={16} height={16} />
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
        title={selectedDoc?.title || 'Apercu du contenu'}
        description="Details du contenu editorial."
      >
        {selectedDoc ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Type
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {selectedDoc.contentType || 'Contenu'}
                  </p>
                </div>

                <span className="rounded-full border border-gray-100 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                  {statusLabels[selectedDoc.status]}
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                Date de publication
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {formatDate(selectedDoc.publicationDate)}
              </p>

              {selectedDoc.tags?.length ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                    Mots-cles
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDoc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}

              {selectedDoc.notes ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {selectedDoc.notes}
                  </p>
                </>
              ) : null}

              {selectedDoc.body ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                    Contenu
                  </p>
                  <MarkdownContent className="mt-1 text-gray-700">
                    {selectedDoc.body}
                  </MarkdownContent>
                </>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
