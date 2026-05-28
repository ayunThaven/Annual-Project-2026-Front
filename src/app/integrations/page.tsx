'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function IntegrationsPage() {
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Intégrations & API</h1>
        <p className="text-gray-500 text-xs mt-0.5">Connectez vos espaces de stockage externes pour centraliser vos stratégies</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black text-white font-black text-2xl rounded-xl flex items-center justify-center">
                N
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Notion</h3>
                <p className="text-xs text-gray-400 mt-0.5">Espace central et calendrier éditorial</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isConnected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {isConnected ? 'Connecté' : 'Hors ligne'}
            </span>
          </div>

          <p className="text-gray-600 text-xs leading-relaxed mb-6">
            Permet de stocker automatiquement vos articles générés, d'organiser votre calendrier éditorial distant et de limiter l'empreinte sur la base de données locale.
          </p>

          <button 
            onClick={() => setIsConnected(!isConnected)}
            className={`w-full font-semibold py-2.5 rounded-lg text-xs transition-colors border ${
              isConnected 
                ? 'bg-white hover:bg-red-50 text-red-600 border-red-200' 
                : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
            }`}
          >
            {isConnected ? 'Déconnecter le workspace' : 'Connecter à Notion'}
          </button>
        </div>
      </div>
    </div>
  );
}