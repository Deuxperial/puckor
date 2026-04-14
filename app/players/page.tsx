'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Users, ArrowLeft, Save, X } from 'lucide-react';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';
import { useTeams } from '@/lib/useTeams';
import { usePlayers } from '@/lib/usePlayers';
import type { Player } from '@/types';

const positions = [
  'Gardien',
  'Défenseur',
  'Ailier',
  'Centre',
  'Attaquant'
];

const handednessOptions = [
  { value: 'left', label: 'Gaucher' },
  { value: 'right', label: 'Droitier' },
  { value: 'both', label: 'Ambidextre' }
];

function PlayersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('team');

  const { user, loading: authLoading } = useSupabaseAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { players, loading: playersLoading, error, createPlayer, updatePlayer, deletePlayer } = usePlayers(teamId || undefined);

  const [selectedTeam, setSelectedTeam] = useState<string>(teamId || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: '',
    handedness: 'right' as Player['handedness']
  });

  // Redirection si non connecté
  if (!authLoading && !user) {
    router.replace('/login');
    return null;
  }

  // Mettre à jour l'équipe sélectionnée quand le paramètre change
  useEffect(() => {
    if (teamId) {
      setSelectedTeam(teamId);
    }
  }, [teamId]);

  const handleTeamChange = (newTeamId: string) => {
    setSelectedTeam(newTeamId);
    const params = new URLSearchParams(searchParams);
    if (newTeamId) {
      params.set('team', newTeamId);
    } else {
      params.delete('team');
    }
    router.replace(`/players?${params.toString()}`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      position: '',
      handedness: 'right'
    });
    setEditingPlayer(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      const playerData = {
        name: formData.name,
        number: parseInt(formData.number),
        position: formData.position,
        handedness: formData.handedness,
        team_id: selectedTeam
      };

      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, playerData);
      } else {
        await createPlayer(playerData);
      }

      resetForm();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      number: player.number.toString(),
      position: player.position,
      handedness: player.handedness
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;

    try {
      await deletePlayer(id);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const selectedTeamData = teams.find(team => team.id === selectedTeam);

  if (authLoading || teamsLoading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300 shadow-2xl shadow-slate-950/20">
        Chargement des joueurs...
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
              href="/teams"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux équipes
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-slate-100">Gestion des joueurs</h1>
          <p className="mt-2 text-slate-300">
            Gérez les joueurs de vos équipes de hockey.
          </p>
        </div>

        <div className="text-sm text-slate-400">
          {players.length} joueur{players.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Sélecteur d'équipe */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
        <label className="block text-sm font-medium text-slate-200 mb-3">
          Sélectionner une équipe
        </label>
        <select
          value={selectedTeam}
          onChange={(e) => handleTeamChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
        >
          <option value="">Toutes les équipes</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {selectedTeamData && (
          <p className="mt-2 text-sm text-slate-400">
            Équipe sélectionnée : <span className="font-medium text-slate-200">{selectedTeamData.name}</span>
          </p>
        )}
      </div>

      {/* Formulaire d'ajout/édition */}
      {selectedTeam && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-100">
              {editingPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
            </h2>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-200">
                  Nom
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  Numéro
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  Position
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                    required
                  >
                    <option value="">Sélectionner une position</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  Latéralité
                  <select
                    value={formData.handedness}
                    onChange={(e) => setFormData(prev => ({ ...prev, handedness: e.target.value as Player['handedness'] }))}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                  >
                    {handednessOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  <Save className="h-4 w-4" />
                  {editingPlayer ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Liste des joueurs */}
      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {!selectedTeam ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl shadow-slate-950/20">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Sélectionnez une équipe</h3>
            <p className="text-slate-400">
              Choisissez une équipe pour voir et gérer ses joueurs.
            </p>
          </div>
        ) : playersLoading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl shadow-slate-950/20">
            <div className="text-slate-300">Chargement des joueurs...</div>
          </div>
        ) : players.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl shadow-slate-950/20">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Aucun joueur</h3>
            <p className="text-slate-400">
              Cette équipe n'a pas encore de joueurs. Ajoutez-en un !
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-2xl font-bold text-sky-400">
                      {player.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">{player.name}</h3>
                      <p className="text-sm text-slate-400">{player.position}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(player)}
                      className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latéralité:</span>
                    <span className="text-slate-200">
                      {handednessOptions.find(h => h.value === player.handedness)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ajouté:</span>
                    <span className="text-slate-200">
                      {new Date(player.created_at).toLocaleDateString('fr-FR')}
                    </span>
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

export default function PlayersPage() {
  return (
    <Suspense fallback={
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300 shadow-2xl shadow-slate-950/20">
        Chargement...
      </div>
    }>
      <PlayersPageContent />
    </Suspense>
  );
}