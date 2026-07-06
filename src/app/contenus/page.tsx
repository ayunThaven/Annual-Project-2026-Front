"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";

export default function ContenusPage() {
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const historique = [
    {
      title: "Les secrets du SEO local pour les commerçants",
      type: "Article de Blog",
      date: "Créé le 25 mai 2026",
      status: "Synchronisé Notion ✅",
      excerpt:
        "Un article complet expliquant comment les commerces locaux peuvent améliorer leur visibilité grâce aux mots-clés géolocalisés, aux avis clients et à l'optimisation de leur fiche Google Business Profile.",
    },
    {
      title: "Pourquoi le framework Next.js écrase la concurrence en 2026",
      type: "Newsletter",
      date: "Créé le 20 mai 2026",
      status: "Brouillon local 💾",
      excerpt:
        "Une newsletter qui présente les avantages de Next.js pour les équipes marketing et techniques : performance, SEO, rendu serveur et expérience développeur.",
    },
    {
      title: "Lancement de notre nouvel outil de content marketing IA 🚀",
      type: "Post LinkedIn",
      date: "Créé le 18 mai 2026",
      status: "Synchronisé Notion ✅",
      excerpt:
        "Un post LinkedIn court et engageant pour annoncer le lancement d'un outil de génération de contenu IA connecté à Notion.",
    },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Mes contenus</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Accédez à l'historique de toutes vos rédactions et vérifiez leur état
          de publication
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-4">
        {historique.map((doc, index) => (
          <div
            key={index}
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
                    {doc.type}
                  </span>
                  <span>•</span>
                  <span>{doc.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                {doc.status}
              </span>

              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setIsPreviewOpen(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
              >
                <Image src="/icons/voir.png" alt="Voir" width={16} height={16} />
              </button>
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
                    {selectedDoc.type}
                  </p>
                </div>

                <span className="rounded-full border border-gray-100 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                  {selectedDoc.status}
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                Date
              </p>
              <p className="mt-1 text-sm text-gray-700">{selectedDoc.date}</p>

              <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                Extrait
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                {selectedDoc.excerpt}
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