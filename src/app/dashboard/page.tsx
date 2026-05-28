"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import ContentCard from "@/components/ContentCard";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"suggestions" | "created">(
    "suggestions",
  );

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
                      alt="Icône contenus"
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
                      alt="Icône attente"
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
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                <Image
                  src="/icons/creer-white.png"
                  alt="View icon"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span>Nouveau contenu</span>
              </button>
              <button className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 transition-colors flex items-center gap-2">
                <Image
                  src="/icons/idees.png"
                  alt="Creer une idee"
                  width={18}
                  height={18}
                  className="w-4.5 h-4.5"
                />
                <span>Créer une idée</span>
              </button>
              <button className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 transition-colors flex items-center gap-2">
                <Image
                  src="/icons/import.png"
                  alt="Import Notion"
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
    </div>
  );
}
