'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ParametresPage() {
  const [agenceName, setAgenceName] = useState('SEO Genius Agency');
  const [modelIA, setModelIA] = useState('gpt-4o');

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres Généraux</h1>
        <p className="text-gray-500 text-xs mt-0.5">Configurez l'environnement global de votre application SaaS</p>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Mon Organisation / Agence</h2>
          
          <div className="max-w-md text-gray-500">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom de l'agence</label>
            <input 
              type="text" 
              value={agenceName} 
              onChange={(e) => setAgenceName(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Contexte Éditorial Global</h2>
          <p className="text-gray-500 text-xs">Définissez des règles que l'IA appliquera secrètement à toutes vos rédactions pour éviter le contenu creux.</p>
          
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mots-clés interdits ou à éviter (bannis par l'agence)</label>
              <input 
                type="text" 
                placeholder="Ex: révolutionnaire, disruptive, game-changer..."
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description de la cible éditoriale principale</label>
              <textarea 
                rows={3}
                placeholder="Ex: Directeurs marketing en agence, consultants SEO indépendants recherchant de la valeur concrète..."
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Moteur d'Intelligence Artificielle</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Modèle LLM par défaut</label>
              <select 
                value={modelIA}
                onChange={(e) => setModelIA(e.target.value)}
                className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400"
              >
                <option value="gpt-4o">OpenAI GPT-4o (Recommandé)</option>
                <option value="claude-3-5">Anthropic Claude 3.5 Sonnet</option>
                <option value="local">Modèle custom d'agence (API locale)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Clé d'API Clôturée (Chiffrée)</label>
              <input 
                type="password" 
                value="••••••••••••••••••••••••••••" 
                disabled
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}