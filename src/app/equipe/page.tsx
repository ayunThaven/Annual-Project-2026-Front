"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

export default function EquipePage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const membres = [
    {
      name: "Utilisateur (Vous)",
      email: "admin@agence.com",
      role: "Administrateur",
      status: "Actif",
    },
    {
      name: "Sarah Connor",
      email: "s.connor@marketing.com",
      role: "Rédacteur / Collaborateur",
      status: "Actif",
    },
    {
      name: "Thomas Anderson",
      email: "neo@matrix.com",
      role: "Lecteur seul",
      status: "Invitation en attente",
    },
  ];

  return (
    <div className="w-full" onClick={() => setOpenMenu(null)}>
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion de l'équipe
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Gérez les membres de votre agence et attribuez leurs rôles
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsInviteOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Inviter un collaborateur</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-visible shadow-sm">
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
                <tr
                  key={index}
                  className="hover:bg-gray-100/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {membre.name}
                    </div>
                    <div className="text-xs text-gray-400">{membre.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        membre.role === "Administrateur"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {membre.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-xs ${
                        membre.status.includes("attente")
                          ? "text-amber-600"
                          : "text-green-600"
                      } font-medium`}
                    >
                      {membre.status}
                    </span>
                  </td>

                  <td className="relative px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === index ? null : index);
                      }}
                      className="rounded px-2 py-1 font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      •••
                    </button>

                    {openMenu === index && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-6 top-12 z-20 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-lg"
                      >
                        <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50">
                          Modifier le rôle
                        </button>

                        <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50">
                          Renvoyer l'invitation
                        </button>

                        <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50">
                          Désactiver l'accès
                        </button>

                        <div className="border-t border-gray-100" />

                        <button className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50">
                          Supprimer le membre
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Inviter un collaborateur"
        description="Ajoutez un membre à votre agence et attribuez-lui un rôle."
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom du collaborateur"
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <input
            type="email"
            placeholder="Adresse email"
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none"
          />

          <select className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-500 focus:border-gray-400 focus:outline-none">
            <option>Administrateur</option>
            <option>Rédacteur / Collaborateur</option>
            <option>Lecteur seul</option>
          </select>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              onClick={() => setIsInviteOpen(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Envoyer l'invitation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}