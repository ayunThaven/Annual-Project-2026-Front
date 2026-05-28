'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function IdeesPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkSuccess, setCheckSuccess] = useState(false);

  const handleCheckDoublons = () => {
    setIsChecking(true);
    setCheckSuccess(false);
    setTimeout(() => {
      setIsChecking(false);
      setCheckSuccess(true);
    }, 1500);
  };

  const ideesProposees = [
    { title: "Comment optimiser ses fiches produits pour le SEO en 2026", angle: "Technique & Pratique", Statut: "Nouveau" },
    { title: "Le guide de survie du copywriter face aux LLM", angle: "Storytelling / Avis d'expert", Statut: "Nouveau" },
    { title: "5 erreurs de content marketing qui coûtent cher aux agences", angle: "Stratégique", Statut: "Nouveau" },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Idées de contenu IA</h1>
            <p className="text-gray-500 text-xs mt-0.5">Générez des concepts uniques basés sur votre historique et votre veille</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors flex items-center gap-2">
            <span>+</span> <span>Générer de nouvelles idées</span>
          </button>
          <button 
            onClick={handleCheckDoublons}
            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 text-sm transition-colors flex items-center gap-2"
          >
            <Image src="/icons/idees.png" alt="" width={16} height={16} />
            <span>{isChecking ? 'Analyse sémantique...' : 'Vérifier les doublons'}</span>
          </button>
          {checkSuccess && <span className="text-green-600 text-xs font-semibold">✓ Aucun doublon trouvé dans votre Notion !</span>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideesProposees.map((idee, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {idee.angle}
                  </span>
                  <span className="bg-green-50 text-green-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    {idee.Statut}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-4 leading-snug">{idee.title}</h3>
              </div>
              <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-xs border border-gray-200 transition-colors flex items-center justify-center gap-2">
                <Image src="/icons/redaction.png" alt="" width={14} height={14} className="opacity-70" />
                <span>Rédiger avec ce sujet</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}