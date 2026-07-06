"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";

export default function CurationPage() {
  const [activeTab, setActiveTab] = useState<"rss" | "articles">("rss");
  const [isRssModalOpen, setIsRssModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);

  const curatedArticles = [
    {
      id: 1,
      source: "TechCrunch",
      title: "Comment les agents IA redéfinissent la recherche en ligne",
      url: "https://techcrunch.com/ia-search",
      date: "Il y a 2 heures",
      excerpt:
        "Les nouveaux modèles d'intelligence artificielle ne se contentent plus de lister des liens, ils synthétisent l'information en temps réel pour l'utilisateur...",
    },
    {
      id: 2,
      source: "Le Journal du Net",
      title: "Les tendances SEO incontournables à suivre cette année",
      url: "https://jdn.fr/seo-tendances",
      date: "Hier",
      excerpt:
        "L'optimisation pour les moteurs de recherche passe désormais par la compréhension sémantique fine et la qualité brute des contenus éditoriaux...",
    },
    {
      id: 3,
      source: "HubSpot Blog",
      title: "Le guide ultime du Content Marketing pour les agences",
      url: "https://hubspot.com/content-marketing-agency",
      date: "Il y a 3 jours",
      excerpt:
        "Produire du contenu à grande échelle demande une organisation rigoureuse et des outils interconnectés pour centraliser la charte et la curation...",
    },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Curation de contenu
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Suivez vos flux RSS et importez des sources pour nourrir votre
                IA
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium tracking-wide">
              <span className="text-gray-900 font-bold">Sources :</span>
              <span className="text-gray-950 font-bold">12</span> flux actifs
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRssModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm"
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
              className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 transition-colors flex items-center gap-2 text-sm"
            >
              <Image src="/icons/import.png" alt="" width={16} height={16} />
              <span>Importer une URL</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 flex gap-8">
          <button
            onClick={() => setActiveTab("rss")}
            className={`py-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === "rss"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Flux RSS suivis
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`py-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === "articles"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Articles sauvegardés
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === "rss" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded">
                      {article.source}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {article.date}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setIsInspireModalOpen(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Image
                      src="/icons/creer-white.png"
                      alt=""
                      width={16}
                      height={16}
                    />
                    <span>Inspirer l'IA</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setIsPreviewModalOpen(true);
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg font-medium">
              Aucun article sauvegardé manuellement
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Utilisez le bouton "Importer une URL" pour en ajouter un.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isRssModalOpen}
        onClose={() => setIsRssModalOpen(false)}
        title="Ajouter un flux RSS"
        description="Ajoutez une source de veille pour nourrir automatiquement votre IA."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              Nom du flux
            </label>
            <input
              type="text"
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
              placeholder="https://exemple.com/feed"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => setIsRssModalOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              onClick={() => setIsRssModalOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Ajouter la source
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        title="Importer un article"
        description="Importez un article depuis une URL pour l'utiliser comme source d'inspiration."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              URL de l'article
            </label>

            <input
              type="url"
              placeholder="https://www.exemple.com/article"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Catégorie
            </label>

            <select className="w-full rounded-lg border border-gray-200 p-2.5 text-gray-500 text-sm bg-white focus:border-gray-400 focus:outline-none">
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
              placeholder="SEO, IA, Google..."
              className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsUrlModalOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              onClick={() => setIsUrlModalOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Importer l'article
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={selectedArticle?.title || "Aperçu de l'article"}
        description="Prévisualisez l'article avant de l'utiliser comme source."
      >
        {selectedArticle && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-gray-900">
                {selectedArticle.source}
              </span>
              <span>{selectedArticle.date}</span>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm leading-relaxed text-gray-700">
                {selectedArticle.excerpt}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                Cet article pourra être utilisé comme source d'inspiration pour
                enrichir une rédaction IA, détecter des angles éditoriaux et
                générer de nouvelles idées de contenu.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>

              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Voir le site
              </a>
            </div>
          </div>
        )}
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
                Source : {selectedArticle.source}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                Type de contenu
              </label>
              <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
                <option>Article de blog</option>
                <option>Post LinkedIn</option>
                <option>Newsletter</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                Ton
              </label>
              <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
                <option>Professionnel</option>
                <option>Expert</option>
                <option>Storytelling</option>
                <option>Vulgarisation</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                Longueur
              </label>
              <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
                <option>Court</option>
                <option>Moyen</option>
                <option>Long</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsInspireModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                onClick={() => setIsInspireModalOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Générer le contenu
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
