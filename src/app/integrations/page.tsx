'use client';

export default function IntegrationsPage() {
  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Controlez les services connectes a votre espace de travail.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <section className="max-w-xl bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black text-white font-black text-2xl rounded-lg flex items-center justify-center">
                N
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">Notion</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Espace central et calendrier editorial.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
              Bientot
            </span>
          </div>

          <p className="text-gray-600 text-xs leading-relaxed">
            Les champs Notion sont conserves dans les parametres de l&apos;agence.
            Le branchement complet pourra etre active quand le module Notion sera
            disponible cote API.
          </p>
        </section>
      </div>
    </div>
  );
}
