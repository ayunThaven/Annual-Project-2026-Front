"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProfilPage() {
  const [name, setName] = useState("Utilisateur");
  const [email, setEmail] = useState("admin@agence.com");

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Mon Compte</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Gérez vos informations personnelles et vos accès de connexion
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Informations personnelles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border border-gray-200 text-gray-500 rounded-lg p-2.5 bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors">
              Enregistrer les modifications
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            Fournisseurs d'authentification
          </h2>
          <p className="text-gray-500 text-xs">
            Liez vos comptes tiers pour vous connecter plus rapidement en un
            clic.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <span className="text-red-500 font-bold text-base">G</span>
                <span>Connexion via Google</span>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:underline">
                Associer
              </button>
            </div>

            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <span className="text-black font-black text-base">N</span>
                <span>Connexion via Notion</span>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                Lié ✅
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
