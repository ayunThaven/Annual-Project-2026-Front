"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";

export default function IdeesPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkSuccess, setCheckSuccess] = useState(false);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isRedactionModalOpen, setIsRedactionModalOpen] = useState(false);
  const [selectedIdee, setSelectedIdee] = useState<any>(null);

  const handleCheckDoublons = () => {
    setIsChecking(true);
    setCheckSuccess(false);

    setTimeout(() => {
      setIsChecking(false);
      setCheckSuccess(true);
    }, 1500);
  };

  const ideesProposees = [
    {
      title: "Comment optimiser ses fiches produits pour le SEO en 2026",
      angle: "Technique & Pratique",
      Statut: "Nouveau",
    },
    {
      title: "Le guide de survie du copywriter face aux LLM",
      angle: "Storytelling / Avis d'expert",
      Statut: "Nouveau",
    },
    {
      title: "5 erreurs de content marketing qui coûtent cher aux agences",
      angle: "Stratégique",
      Statut: "Nouveau",
    },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Idées de contenu IA
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Générez des concepts uniques basés sur votre historique et votre veille
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Générer de nouvelles idées</span>
          </button>

          <button
            onClick={handleCheckDoublons}
            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 text-sm transition-colors flex items-center gap-2"
          >
            <Image src="/icons/idees.png" alt="" width={16} height={16} />
            <span>
              {isChecking ? "Analyse sémantique..." : "Vérifier les doublons"}
            </span>
          </button>

          {checkSuccess && (
            <span className="text-green-600 text-xs font-semibold">
              ✓ Aucun doublon trouvé dans votre Notion !
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideesProposees.map((idee, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {idee.angle}
                  </span>
                  <span className="bg-green-50 text-green-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    {idee.Statut}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                  {idee.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  setSelectedIdee(idee);
                  setIsRedactionModalOpen(true);
                }}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-xs border border-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Image
                  src="/icons/redaction.png"
                  alt=""
                  width={14}
                  height={14}
                  className="opacity-70"
                />
                <span>Rédiger avec ce sujet</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Générer de nouvelles idées"
        description="Définissez un thème, un secteur et le nombre d'idées à générer."
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Thème principal : SEO, IA, marketing..."
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <input
            type="text"
            placeholder="Secteur : e-commerce, agence, SaaS..."
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
              onClick={() => setIsGenerateModalOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Générer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRedactionModalOpen}
        onClose={() => setIsRedactionModalOpen(false)}
        title="Rédiger avec ce sujet"
        description="Configurez la rédaction avant d'envoyer le sujet à l'assistant IA."
      >
        {selectedIdee && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Sujet sélectionné
              </p>
              <h3 className="mt-1 text-sm font-bold text-gray-900">
                {selectedIdee.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Angle : {selectedIdee.angle}
              </p>
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
                onClick={() => setIsRedactionModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                onClick={() => setIsRedactionModalOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Ouvrir la rédaction
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}