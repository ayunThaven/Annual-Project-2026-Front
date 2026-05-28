'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function CurationPage() {
  const [activeTab, setActiveTab] = useState<'rss' | 'articles'>('rss');

  const curatedArticles = [
    {
      id: 1,
      source: 'TechCrunch',
      title: "Comment les agents IA redéfinissent la recherche en ligne",
      url: "https://techcrunch.com/ia-search",
      date: "Il y a 2 heures",
      excerpt: "Les nouveaux modèles d'intelligence artificielle ne se contentent plus de lister des liens, ils synthétisent l'information en temps réel pour l'utilisateur...",
    },
    {
      id: 2,
      source: 'Le Journal du Net',
      title: "Les tendances SEO incontournables à suivre cette année",
      url: "https://jdn.fr/seo-tendances",
      date: "Hier",
      excerpt: "L'optimisation pour les moteurs de recherche passe désormais par la compréhension sémantique fine et la qualité brute des contenus éditoriaux...",
    },
    {
      id: 3,
      source: 'HubSpot Blog',
      title: "Le guide ultime du Content Marketing pour les agences",
      url: "https://hubspot.com/content-marketing-agency",
      date: "Il y a 3 jours",
      excerpt: "Produire du contenu à grande échelle demande une organisation rigoureuse et des outils interconnectés pour centraliser la charte et la curation...",
    },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Curation de contenu</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Suivez vos flux RSS et importez des sources pour nourrir votre IA
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium tracking-wide">
              <span className="text-gray-900 font-bold">Sources :</span>
              <span className="text-gray-950 font-bold">12</span> flux actifs
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Image src="/icons/creer-white.png" alt="" width={16} height={16} />
              <span>Ajouter un flux RSS</span>
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-200 transition-colors flex items-center gap-2 text-sm">
              <Image src="/icons/import.png" alt="" width={16} height={16} />
              <span>Importer une URL</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 flex gap-8">
          <button
            onClick={() => setActiveTab('rss')}
            className={`py-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'rss'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Flux RSS suivis
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`py-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'articles'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            Articles sauvegardés
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'rss' ? (
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
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                    <Image src="/icons/creer-white.png" alt="" width={16} height={16} />
                    <span>Inspirer l'IA</span>
                  </button>
                  
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <Image src="/icons/voir.png" alt="Voir la source" width={18} height={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg font-medium">Aucun article sauvegardé manuellement</p>
            <p className="text-gray-400 text-sm mt-1">Utilisez le bouton "Importer une URL" pour en ajouter un.</p>
          </div>
        )}
      </div>
    </div>
  );
}