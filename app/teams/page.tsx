'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Users, ArrowLeft } from 'lucide-react';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';
import { useTeams } from '@/lib/useTeams';

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth();
  const { teams, loading: teamsLoading, error, createTeam, deleteTeam } = useTeams();
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirection si non connecté
  if (!authLoading && !user) {
    router.replace('/login');
    return null;
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      setCreating(true);
      await createTeam(newTeamName.trim());
      setNewTeamName('');
    } catch (err) {
      console.error('Erreur lors de la création:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;

    try {
      setDeletingId(id);
      await deleteTeam(id);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || teamsLoading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300 shadow-2xl shadow-slate-950/20">
        Chargement des équipes...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-slate-100">Mes Équipes</h1>
          <p className="mt-2 text-slate-300">
            Gérez vos équipes de hockey et leurs membres.
          </p>
        </div>

        <div className="text-sm text-slate-400">
          {teams.length} équipe{teams.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Formulaire de création */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Créer une équipe</h2>
        <form onSubmit={handleCreateTeam} className="flex gap-3">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Nom de l'équipe"
            className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            required
          />
          <button
            type="submit"
            disabled={creating || !newTeamName.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {creating ? 'Création...' : 'Créer'}
          </button>
        </form>
      </div>

      {/* Liste des équipes */}
      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl shadow-slate-950/20">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Aucune équipe</h3>
            <p className="text-slate-400">
              Créez votre première équipe pour commencer à gérer vos joueurs.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">
                      {team.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Créée le {new Date(team.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/players?team=${team.id}`}
                      className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition"
                      title="Voir les joueurs"
                    >
                      <Users className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      disabled={deletingId === team.id}
                      className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}