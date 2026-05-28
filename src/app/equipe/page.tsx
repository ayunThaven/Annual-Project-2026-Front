'use client';

import Image from 'next/image';

export default function EquipePage() {
  const membres = [
    { name: 'Utilisateur (Vous)', email: 'admin@agence.com', role: 'Administrateur', status: 'Actif' },
    { name: 'Sarah Connor', email: 's.connor@marketing.com', role: 'Rédacteur / Collaborateur', status: 'Actif' },
    { name: 'Thomas Anderson', email: 'neo@matrix.com', role: 'Lecteur seul', status: 'Invitation en attente' },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de l'équipe</h1>
            <p className="text-gray-500 text-xs mt-0.5">Gérez les membres de votre agence et attribuez leurs rôles</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors flex items-center gap-2">
          <span>+</span> <span>Inviter un collaborateur</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Membre</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
              {membres.map((membre, index) => (
                <tr key={index} className="hover:bg-gray-100/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{membre.name}</div>
                    <div className="text-xs text-gray-400">{membre.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      membre.role === 'Administrateur' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {membre.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs ${membre.status.includes('attente') ? 'text-amber-600' : 'text-green-600'} font-medium`}>
                      {membre.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400 hover:text-gray-600 cursor-pointer font-bold">•••</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}