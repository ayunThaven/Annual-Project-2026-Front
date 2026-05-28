'use client';

import Image from 'next/image';

export default function ContenusPage() {
  const historique = [
    { title: "Les secrets du SEO local pour les commerçants", type: "Article de Blog", date: "Créé le 25 mai 2026", status: "Synchronisé Notion ✅" },
    { title: "Pourquoi le framework Next.js écrase la concurrence en 2026", type: "Newsletter", date: "Créé le 20 mai 2026", status: "Brouillon local 💾" },
    { title: "Lancement de notre nouvel outil de content marketing IA 🚀", type: "Post LinkedIn", date: "Créé le 18 mai 2026", status: "Synchronisé Notion ✅" },
  ];

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Mes contenus</h1>
        <p className="text-gray-500 text-xs mt-0.5">Accédez à l'historique de toutes vos rédactions et vérifiez leur état de publication</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-4">
        {historique.map((doc, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                <Image src="/icons/contenus.png" alt="" width={18} height={18} className="opacity-70" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{doc.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="font-semibold text-blue-600">{doc.type}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                {doc.status}
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200">
                <Image src="/icons/voir.png" alt="Voir" width={16} height={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}