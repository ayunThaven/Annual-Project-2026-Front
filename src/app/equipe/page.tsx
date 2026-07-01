'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AgencyInvitation,
  AgencyMember,
  AgencyRole,
  ApiError,
  CurrentAgency,
  getAgencyMembers,
  getCurrentAgency,
  inviteAgencyMember,
  updateMemberRole,
} from '@/lib/api';

const roleLabels: Record<AgencyRole, string> = {
  OWNER: 'Administrateur',
  EDITOR: 'Redacteur / Collaborateur',
  VIEWER: 'Lecteur seul',
};

const roleBadgeClasses: Record<AgencyRole, string> = {
  OWNER: 'bg-blue-50 text-blue-600',
  EDITOR: 'bg-violet-50 text-violet-600',
  VIEWER: 'bg-gray-100 text-gray-700',
};

const roleOptions: AgencyRole[] = ['OWNER', 'EDITOR', 'VIEWER'];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Vous devez etre connecte pour acceder au mode agence.';
    }

    if (error.status === 404) {
      return 'Les informations demandees sont introuvables.';
    }

    return error.message;
  }

  return 'Une erreur est survenue pendant le chargement de l equipe.';
}

function getMembersErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Vous devez etre connecte pour acceder au mode agence.';
    }

    if (error.status === 404) {
      return "L'agence est active, mais la liste des membres est indisponible.";
    }

    return error.message;
  }

  return 'Une erreur est survenue pendant le chargement des membres.';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function EquipePage() {
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [invitations, setInvitations] = useState<AgencyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AgencyRole>('EDITOR');
  const [isInviting, setIsInviting] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [lastInvitationLink, setLastInvitationLink] = useState<string | null>(null);

  const canManageTeam = currentAgency?.role === 'OWNER';
  const needsAuthentication =
    error === 'Vous devez etre connecte pour acceder au mode agence.';
  const totalRows = useMemo(
    () => members.length + invitations.length,
    [members.length, invitations.length],
  );

  async function loadTeam() {
    setIsLoading(true);
    setError(null);
    setLastInvitationLink(null);

    let current: CurrentAgency;

    try {
      current = await getCurrentAgency();
      setCurrentAgency(current);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 404) {
        setCurrentAgency(null);
        setMembers([]);
        setInvitations([]);
        return;
      }

      setError(getErrorMessage(caughtError));
      setIsLoading(false);
      return;
    }

    try {
      const team = await getAgencyMembers(current.agency.id);
      setMembers(team.members);
      setInvitations(team.invitations);
    } catch (caughtError) {
      setMembers([]);
      setInvitations([]);
      setError(getMembersErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTeam();
  }, []);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentAgency || !inviteEmail.trim()) {
      return;
    }

    setIsInviting(true);
    setError(null);

    try {
      const invitation = await inviteAgencyMember({
        agencyId: currentAgency.agency.id,
        email: inviteEmail,
        role: inviteRole,
      });

      setInviteEmail('');
      setInviteRole('EDITOR');
      setLastInvitationLink(`${window.location.origin}/invitations/${invitation.token}`);

      const team = await getAgencyMembers(currentAgency.agency.id);
      setMembers(team.members);
      setInvitations(team.invitations);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRoleChange(membershipId: string, role: AgencyRole) {
    if (!canManageTeam) {
      return;
    }

    setUpdatingMemberId(membershipId);
    setError(null);

    try {
      const updatedMember = await updateMemberRole(membershipId, role);
      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.membershipId === membershipId ? updatedMember : member,
        ),
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setUpdatingMemberId(null);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de l&apos;equipe</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {currentAgency
                ? `Agence active : ${currentAgency.agency.name}`
                : "Gerez les membres de votre agence et attribuez leurs roles"}
            </p>
          </div>

          {canManageTeam ? (
            <button
              type="button"
              onClick={() => setInvitePanelOpen((isOpen) => !isOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <span aria-hidden="true">+</span>
              <span>Inviter</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-4">
        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500 shadow-sm">
            Chargement de l&apos;agence...
          </div>
        ) : null}

        {!isLoading && error && !currentAgency ? (
          <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            {needsAuthentication ? (
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/connexion?redirect=/equipe"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription?redirect=/equipe"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  Creer un compte
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void loadTeam()}
                className="mt-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
              >
                Reessayer
              </button>
            )}
          </div>
        ) : null}

        {!isLoading && !error && !currentAgency ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">Aucune agence active</h2>
            <p className="text-sm text-gray-500 mt-1">
              Creez votre premiere agence dans les parametres pour activer la gestion
              d&apos;equipe.
            </p>
            <Link
              href="/parametres"
              className="inline-flex mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
            >
              Ouvrir les parametres
            </Link>
          </div>
        ) : null}

        {!isLoading && error && currentAgency ? (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        {canManageTeam && invitePanelOpen ? (
          <form
            onSubmit={handleInvite}
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Email du collaborateur
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="collaborateur@exemple.com"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as AgencyRole)}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gray-400"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isInviting}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-colors"
            >
              {isInviting ? 'Invitation...' : 'Envoyer'}
            </button>

            {lastInvitationLink ? (
              <div className="md:col-span-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  Lien d&apos;acceptation genere
                </p>
                <input
                  type="text"
                  value={lastInvitationLink}
                  readOnly
                  className="w-full text-xs border border-blue-100 rounded-lg p-2 text-blue-700 bg-white"
                />
              </div>
            ) : null}
          </form>
        ) : null}

        {currentAgency ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Membre</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {members.map((member) => (
                  <tr key={member.membershipId} className="hover:bg-gray-100/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {member.user.displayName || member.user.email}
                      </div>
                      <div className="text-xs text-gray-400">{member.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {canManageTeam ? (
                        <select
                          value={member.role}
                          onChange={(event) =>
                            void handleRoleChange(
                              member.membershipId,
                              event.target.value as AgencyRole,
                            )
                          }
                          disabled={updatingMemberId === member.membershipId}
                          className="text-xs font-medium border border-gray-200 rounded-full px-2.5 py-1 bg-white focus:outline-none focus:border-gray-400"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {roleLabels[role]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadgeClasses[member.role]}`}
                        >
                          {roleLabels[member.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-green-600 font-medium">
                        Actif depuis le {formatDate(member.joinedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-400 font-semibold">
                      {member.membershipId === currentAgency.membershipId ? 'Vous' : 'Membre'}
                    </td>
                  </tr>
                ))}

                {invitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-100/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{invitation.email}</div>
                      <div className="text-xs text-gray-400">Invitation envoyee</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadgeClasses[invitation.role]}`}
                      >
                        {roleLabels[invitation.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-amber-600 font-medium">
                        Invitation en attente
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-400 font-semibold">
                      Expire le {formatDate(invitation.expiresAt)}
                    </td>
                  </tr>
                ))}

                {totalRows === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                      Aucun membre pour le moment.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
