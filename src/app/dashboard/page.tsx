"use client";

import { useState } from "react";
import Image from "next/image";
import ContentCard from "@/components/ContentCard";
import Modal from "@/components/Modal";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"suggestions" | "created">(
    "suggestions",
  );

  const [isNewContentOpen, setIsNewContentOpen] = useState(false);
  const [isIdeaOpen, setIsIdeaOpen] = useState(false);
  const [isNotionOpen, setIsNotionOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateFromIdeaOpen, setIsCreateFromIdeaOpen] = useState(false);

  const suggestedContents = [
    {
      type: "blog" as const,
      title: "10 astuces SEO pour booster votre visibilité",
      description: "Suggestion générée par l'IA.",
    },
    {
      type: "linkedin" as const,
      title: "Comment l'IA transforme le marketing digital",
      description: "Suggestion générée par l'IA.",
    },
    {
      type: "blog" as const,
      title: "Guide complet du Content Marketing en 2026",
      description: "Suggestion générée par l'IA.",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tableau de bord
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  Gérez vos contenus SEO boostés à l'IA
                </p>
              </div>

              <div className="flex items-center gap-6 text-gray-500 font-medium text-xs tracking-wide">
                <span className="text-gray-900 font-bold">Contenus :</span>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/icons/contenus.png"
                      alt=""
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 opacity-80"
                    />
                    <span>
                      <strong className="text-gray-950 font-bold">5</strong>{" "}
                      créés
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/icons/attente.png"
                      alt=""
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 opacity-80"
                    />
                    <span>
                      <strong className="text-gray-950 font-bold">3</strong> en
                      attente
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNewContentOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Image
                  src="/icons/creer-white.png"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span>Nouveau contenu</span>
              </button>

              <button
                onClick={() => setIsIdeaOpen(true)}
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 transition-colors flex items-center gap-2"
              >
                <Image
                  src="/icons/idees.png"
                  alt=""
                  width={18}
                  height={18}
                  className="w-4.5 h-4.5"
                />
                <span>Créer une idée</span>
              </button>

              <button
                onClick={() => setIsNotionOpen(true)}
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 transition-colors flex items-center gap-2"
              >
                <Image
                  src="/icons/import.png"
                  alt=""
                  width={18}
                  height={18}
                  className="w-4.5 h-4.5"
                />
                <span>Import Notion</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 px-8 flex gap-8">
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`py-4 font-semibold transition-colors border-b-2 ${
                activeTab === "suggestions"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Suggestions IA
            </button>

            <button
              onClick={() => setActiveTab("created")}
              className={`py-4 font-semibold transition-colors border-b-2 ${
                activeTab === "created"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Contenus créés
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {activeTab === "suggestions" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedContents.map((content, index) => (
                <ContentCard
                  key={index}
                  type={content.type}
                  title={content.title}
                  description={content.description}
                  generatedByAI={true}
                  onCreate={() => {
                    setSelectedContent(content);
                    setIsCreateFromIdeaOpen(true);
                  }}
                  onPreview={() => {
                    setSelectedContent(content);
                    setIsPreviewOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Aucun contenu créé pour le moment
              </p>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isNewContentOpen}
        onClose={() => setIsNewContentOpen(false)}
        title="Nouveau contenu"
        description="Créez un contenu SEO à partir d'un sujet, d'un ton et de mots-clés."
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Titre ou sujet du contenu"
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
            <option>Article de blog</option>
            <option>Post LinkedIn</option>
            <option>Newsletter</option>
          </select>

          <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
            <option>Professionnel</option>
            <option>Expert</option>
            <option>Storytelling</option>
          </select>

          <input
            type="text"
            placeholder="Mots-clés : SEO, IA, contenu..."
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => setIsNewContentOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => setIsNewContentOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isIdeaOpen}
        onClose={() => setIsIdeaOpen(false)}
        title="Créer une idée IA"
        description="Générez une nouvelle idée de contenu en évitant les doublons."
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Sujet principal"
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <input
            type="text"
            placeholder="Secteur : SEO, e-commerce, marketing..."
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
            <option>3 idées</option>
            <option>5 idées</option>
            <option>10 idées</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" defaultChecked />
            Vérifier les doublons dans l'historique Notion
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => setIsIdeaOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => setIsIdeaOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Générer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isNotionOpen}
        onClose={() => setIsNotionOpen(false)}
        title="Import Notion"
        description="Connectez une base Notion pour importer vos contenus existants."
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom du workspace Notion"
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
            <option>Calendrier éditorial</option>
            <option>Base articles</option>
            <option>Veille SEO</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" defaultChecked />
            Activer la synchronisation automatique
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => setIsNotionOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => setIsNotionOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Importer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={selectedContent?.title || "Aperçu de la suggestion"}
        description="Prévisualisez cette suggestion générée par l'IA."
      >
        {selectedContent && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Type de contenu
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {selectedContent.type === "blog"
                  ? "Article de blog"
                  : "Post LinkedIn"}
              </p>

              <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                Description
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {selectedContent.description}
              </p>

              <p className="mt-4 text-xs font-semibold uppercase text-gray-500">
                Pourquoi cette idée ?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                Cette suggestion a été générée à partir de votre historique
                éditorial, de vos contenus existants et des tendances détectées
                dans votre veille.
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
                onClick={() => {
                  setIsPreviewOpen(false);
                  setIsCreateFromIdeaOpen(true);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Créer avec cette idée
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isCreateFromIdeaOpen}
        onClose={() => setIsCreateFromIdeaOpen(false)}
        title="Créer un contenu"
        description="Transformez cette suggestion IA en contenu rédigé."
      >
        {selectedContent && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Suggestion sélectionnée
              </p>
              <h3 className="mt-1 text-sm font-bold text-gray-900">
                {selectedContent.title}
              </h3>
            </div>

            <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
              <option>Article de blog</option>
              <option>Post LinkedIn</option>
              <option>Newsletter</option>
            </select>

            <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
              <option>Professionnel</option>
              <option>Expert</option>
              <option>Storytelling</option>
            </select>

            <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
              <option>Court</option>
              <option>Moyen</option>
              <option>Long</option>
            </select>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setIsCreateFromIdeaOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                onClick={() => setIsCreateFromIdeaOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Ouvrir Rédaction
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
