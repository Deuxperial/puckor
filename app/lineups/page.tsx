'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Save, Search, Shield, Trash2 } from 'lucide-react';
import { HalfRink } from '@/components/HalfRink';
import { LineSelector } from '@/components/LineSelector';
import { MainGoalieSelector } from '@/components/MainGoalieSelector';
import { PlayerSelectorModal } from '@/components/PlayerSelectorModal';
import { useLineups } from '@/lib/useLineups';
import { usePlayers } from '@/lib/usePlayers';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';
import { useTeams } from '@/lib/useTeams';
import type { HockeyLine, LineKind, LinePosition, LinePlayer, LineupData, Player } from '@/types';

type LineDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  kind: LineKind;
  maxPlayers: number;
};

const LINE_DEFINITIONS: LineDefinition[] = [
  { id: 'line-1', label: 'Ligne 1', shortLabel: '1', kind: 'line', maxPlayers: 5 },
  { id: 'line-2', label: 'Ligne 2', shortLabel: '2', kind: 'line', maxPlayers: 5 },
  { id: 'line-3', label: 'Ligne 3', shortLabel: '3', kind: 'line', maxPlayers: 5 },
  { id: 'line-4', label: 'Ligne 4', shortLabel: '4', kind: 'line', maxPlayers: 5 },
  { id: 'pp-1', label: 'Powerplay 1', shortLabel: 'PP1', kind: 'powerplay', maxPlayers: 5 },
  { id: 'pp-2', label: 'Powerplay 2', shortLabel: 'PP2', kind: 'powerplay', maxPlayers: 5 },
  { id: 'bp-1', label: 'Boxplay 1', shortLabel: 'BP1', kind: 'boxplay', maxPlayers: 4 },
  { id: 'bp-2', label: 'Boxplay 2', shortLabel: 'BP2', kind: 'boxplay', maxPlayers: 4 }
];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const createEmptyLines = (): HockeyLine[] =>
  LINE_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    shortLabel: definition.shortLabel,
    kind: definition.kind,
    players: [],
    notes: ''
  }));

const hydrateLines = (incomingLines?: HockeyLine[]): HockeyLine[] =>
  LINE_DEFINITIONS.map((definition, index) => {
    const existingLine =
      incomingLines?.find((line) => line.id === definition.id) ||
      incomingLines?.find((line) => line.shortLabel === definition.shortLabel) ||
      incomingLines?.[index];

    const players = (existingLine?.players || []).filter((player) => {
      if (definition.kind === 'boxplay') {
        return player.linePosition !== 'att_center' && player.linePosition !== 'goalie';
      }

      return player.linePosition !== 'goalie';
    });

    return {
      id: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      kind: definition.kind,
      notes: existingLine?.notes || '',
      players
    };
  });

const getUnitDefinition = (line: HockeyLine, fallbackIndex: number) =>
  LINE_DEFINITIONS.find((definition) => definition.id === line.id) ||
  LINE_DEFINITIONS[fallbackIndex];

const getCurrentLineLabel = (line: HockeyLine | undefined, index: number) =>
  line?.label || LINE_DEFINITIONS[index]?.label || `Ligne ${index + 1}`;

const getPositionLabel = (player: Player) => {
  const position = normalizeText(player.position);
  if (position.includes('gard')) return 'Gardien';
  if (position.includes('def')) return 'Defenseur';
  if (position.includes('centre')) return 'Centre';
  if (position.includes('ailier')) return 'Ailier';
  if (position.includes('attaq')) return 'Attaquant';
  return player.position;
};

const getPlayerBadgeColor = (position: string) => {
  const normalizedPosition = normalizeText(position);

  if (normalizedPosition.includes('gard')) return 'bg-red-600';
  if (normalizedPosition.includes('def')) return 'bg-indigo-600';
  if (normalizedPosition.includes('centre') || normalizedPosition.includes('ailier') || normalizedPosition.includes('attaq')) {
    return 'bg-fuchsia-700';
  }

  return 'bg-slate-600';
};

function AssignmentBadges({ assignments }: { assignments: string[] }) {
  if (!assignments.length) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {assignments.map((assignment) => (
        <span
          key={assignment}
          className="rounded-full border border-slate-500 px-2 py-0.5 text-[11px] font-semibold text-slate-200"
        >
          {assignment}
        </span>
      ))}
    </div>
  );
}

function LineupsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('team');
  const lineupId = searchParams.get('lineup');

  const { user, loading: authLoading } = useSupabaseAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { players } = usePlayers(teamId || undefined);
  const { lineups, createLineup, updateLineup, deleteLineup, getLineup } = useLineups(teamId || undefined);

  const [selectedTeam, setSelectedTeam] = useState<string>(teamId || '');
  const [lines, setLines] = useState<HockeyLine[]>(createEmptyLines());
  const [mainGoalie, setMainGoalie] = useState<LinePlayer | undefined>(undefined);
  const [selectedLineIndex, setSelectedLineIndex] = useState(0);
  const [lineupName, setLineupName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLineupId, setEditingLineupId] = useState<string | null>(lineupId || null);
  const [selectedPositionForModal, setSelectedPositionForModal] = useState<LinePosition | null>(null);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerRoleFilter, setPlayerRoleFilter] = useState<'all' | 'attaquant' | 'defenseur' | 'gardien'>('all');

  if (!authLoading && !user) {
    router.replace('/login');
    return null;
  }

  useEffect(() => {
    if (lineupId) {
      loadLineup(lineupId);
    }
  }, [lineupId]);

  const loadLineup = async (id: string) => {
    if (!id) {
      resetLineup();
      return;
    }

    const lineup = await getLineup(id);
    if (lineup) {
      setEditingLineupId(id);
      setLineupName(lineup.name);
      setLines(hydrateLines(lineup.data.lines));
      setMainGoalie(lineup.data.mainGoalie);
    }
  };

  const resetLineup = () => {
    setLines(createEmptyLines());
    setMainGoalie(undefined);
    setSelectedLineIndex(0);
    setLineupName('');
    setShowSaveDialog(false);
    setEditingLineupId(null);
    setShowPlayerSelector(false);
  };

  const handleTeamChange = (newTeamId: string) => {
    setSelectedTeam(newTeamId);
    const params = new URLSearchParams(searchParams);

    if (newTeamId) {
      params.set('team', newTeamId);
      params.delete('lineup');
    } else {
      params.delete('team');
    }

    router.replace(`/lineups?${params.toString()}`);
    resetLineup();
  };

  const handleLineupChange = async (newLineupId: string) => {
    const params = new URLSearchParams(searchParams);

    if (newLineupId) {
      params.set('lineup', newLineupId);
      router.replace(`/lineups?${params.toString()}`);
      await loadLineup(newLineupId);
      return;
    }

    params.delete('lineup');
    router.replace(`/lineups?${params.toString()}`);
    resetLineup();
  };

  const currentLine = lines[selectedLineIndex];
  const currentLineDefinition = getUnitDefinition(currentLine, selectedLineIndex);
  const usedPlayerIds = new Set<string>(currentLine.players.map((player) => player.id));

  const playerAssignments = useMemo(() => {
    const assignments: Record<string, string[]> = {};

    lines.forEach((line, index) => {
      const label = getUnitDefinition(line, index).shortLabel;
      line.players.forEach((player) => {
        if (!assignments[player.id]) {
          assignments[player.id] = [];
        }

        if (!assignments[player.id].includes(label)) {
          assignments[player.id].push(label);
        }
      });
    });

    if (mainGoalie) {
      assignments[mainGoalie.id] = [...(assignments[mainGoalie.id] || []), 'G'];
    }

    return assignments;
  }, [lines, mainGoalie]);

  const filteredPlayers = useMemo(() => {
    const search = normalizeText(playerSearch);

    return players.filter((player) => {
      const normalizedPosition = normalizeText(player.position);
      const matchesSearch =
        normalizeText(player.name).includes(search) ||
        player.number.toString().includes(playerSearch);

      const matchesFilter =
        playerRoleFilter === 'all' ||
        (playerRoleFilter === 'gardien' && normalizedPosition.includes('gard')) ||
        (playerRoleFilter === 'defenseur' && normalizedPosition.includes('def')) ||
        (playerRoleFilter === 'attaquant' &&
          (normalizedPosition.includes('ailier') ||
            normalizedPosition.includes('centre') ||
            normalizedPosition.includes('attaq')));

      return matchesSearch && matchesFilter;
    });
  }, [playerRoleFilter, playerSearch, players]);

  const handleAddPlayer = (player: Player) => {
    setLines((previousLines) => {
      const nextLines = [...previousLines];
      const targetLine = { ...nextLines[selectedLineIndex] };
      const targetDefinition = getUnitDefinition(targetLine, selectedLineIndex);

      if (!selectedPositionForModal) {
        return previousLines;
      }

      if (targetLine.players.some((existingPlayer) => existingPlayer.id === player.id)) {
        return previousLines;
      }

      if (targetLine.players.some((existingPlayer) => existingPlayer.linePosition === selectedPositionForModal)) {
        return previousLines;
      }

      if (targetLine.players.length >= targetDefinition.maxPlayers) {
        return previousLines;
      }

      if (targetDefinition.kind === 'boxplay' && selectedPositionForModal === 'att_center') {
        return previousLines;
      }

      targetLine.players = [
        ...targetLine.players,
        {
          id: player.id,
          name: player.name,
          number: player.number,
          position: player.position,
          linePosition: selectedPositionForModal
        }
      ];

      nextLines[selectedLineIndex] = targetLine;
      return nextLines;
    });

    setShowPlayerSelector(false);
    setSelectedPositionForModal(null);
  };

  const handleRemovePlayer = (playerId: string) => {
    setLines((previousLines) => {
      const nextLines = [...previousLines];
      const targetLine = { ...nextLines[selectedLineIndex] };
      targetLine.players = targetLine.players.filter((player) => player.id !== playerId);
      nextLines[selectedLineIndex] = targetLine;
      return nextLines;
    });
  };

  const handleOpenPositionSelector = (position: LinePosition) => {
    if (currentLineDefinition.kind === 'boxplay' && position === 'att_center') {
      return;
    }

    setSelectedPositionForModal(position);
    setShowPlayerSelector(true);
  };

  const handleSelectMainGoalie = (player: Player) => {
    setMainGoalie({
      id: player.id,
      name: player.name,
      number: player.number,
      position: player.position,
      linePosition: 'goalie'
    });
  };

  const handleSaveLineup = async () => {
    if (!lineupName.trim()) {
      alert('Veuillez entrer un nom pour le line-up');
      return;
    }

    const totalPlayers = lines.reduce((sum, line) => sum + line.players.length, 0);
    if (totalPlayers === 0 && !mainGoalie) {
      alert('Veuillez ajouter au moins un joueur');
      return;
    }

    try {
      setIsSaving(true);

      const lineupData: LineupData = {
        lines: lines.map((line, index) => ({
          ...line,
          ...getUnitDefinition(line, index)
        })),
        mainGoalie
      };

      if (editingLineupId) {
        await updateLineup(editingLineupId, { name: lineupName, data: lineupData });
        alert('Line-up mis a jour avec succes');
      } else {
        await createLineup(lineupName, lineupData);
        alert('Line-up cree avec succes');
        resetLineup();
      }

      setShowSaveDialog(false);
    } catch (error) {
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const totalAssignedPlayers = lines.reduce((sum, line) => sum + line.players.length, 0);

  if (authLoading || teamsLoading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300 shadow-2xl shadow-slate-950/20">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 transition hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-slate-50 sm:text-5xl">Createur de line-up</h1>
          <p className="mt-2 text-slate-300">Composez vos formations avec drag & drop</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20">
        <label className="mb-3 block text-sm font-medium text-slate-100">Selectionner une equipe</label>
        <select
          value={selectedTeam}
          onChange={(event) => handleTeamChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-red-500"
        >
          <option value="">Choisir une equipe</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <>
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_320px]">
              <div className="space-y-4">
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-100">Selectionner un line-up de base</label>
                  <select
                    value={editingLineupId || ''}
                    onChange={(event) => handleLineupChange(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-red-500"
                  >
                    <option value="">Nouvelle composition</option>
                    {lineups.map((lineup) => (
                      <option key={lineup.id} value={lineup.id}>
                        {lineup.name}
                      </option>
                    ))}
                  </select>
                </div>

                <LineSelector
                  lines={lines}
                  selectedLineIndex={selectedLineIndex}
                  onLineChange={setSelectedLineIndex}
                />

                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/75 p-6">
                  <h2 className="mb-5 text-2xl font-semibold text-slate-50">{getCurrentLineLabel(currentLine, selectedLineIndex)}</h2>

                  <div className="mx-auto max-w-xl">
                    <HalfRink
                      players={currentLine.players}
                      lineKind={currentLineDefinition.kind}
                      onRemovePlayer={handleRemovePlayer}
                      onPositionClick={handleOpenPositionSelector}
                      isEditable
                    />
                  </div>

                  <div className="mx-auto mt-6 max-w-md">
                    <MainGoalieSelector
                      mainGoalie={mainGoalie}
                      players={players.filter((player) => normalizeText(player.position).includes('gard'))}
                      onSelectGoalie={handleSelectMainGoalie}
                      onRemoveGoalie={() => setMainGoalie(undefined)}
                    />
                  </div>
                </div>
              </div>

              <div className="hidden xl:flex xl:flex-col xl:rounded-[1.75rem] xl:border xl:border-slate-800 xl:bg-slate-900/75 xl:p-5">
                <h2 className="text-lg font-semibold text-slate-50">Liste des joueurs</h2>

                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={playerSearch}
                    onChange={(event) => setPlayerSearch(event.target.value)}
                    placeholder="Chercher..."
                    className="flex-1 bg-transparent text-slate-100 outline-none placeholder-slate-500"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {[
                    { key: 'all', label: 'Tous' },
                    { key: 'attaquant', label: 'Attaquant' },
                    { key: 'defenseur', label: 'Defenseur' },
                    { key: 'gardien', label: 'Gardien' }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setPlayerRoleFilter(filter.key as typeof playerRoleFilter)}
                      className={`rounded-full border px-3 py-1.5 transition ${
                        playerRoleFilter === filter.key
                          ? 'border-red-500 bg-red-500/15 text-white'
                          : 'border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3"
                    >
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getPlayerBadgeColor(player.position)}`}>
                        {player.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-100">{player.name}</p>
                        <p className="text-xs text-slate-400">{getPositionLabel(player)}</p>
                      </div>
                      <AssignmentBadges assignments={playerAssignments[player.id] || []} />
                    </div>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-400">
                      Aucun joueur trouve
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20">
              <h2 className="text-lg font-semibold text-slate-50">Joueurs et affectations</h2>
              <div className="mt-4 space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3"
                  >
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getPlayerBadgeColor(player.position)}`}>
                      {player.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-100">{player.name}</p>
                      <p className="text-xs text-slate-400">{getPositionLabel(player)}</p>
                    </div>
                    <AssignmentBadges assignments={playerAssignments[player.id] || []} />
                  </div>
                ))}
              </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">Composition en cours</h2>
                <p className="mt-1 text-slate-400">{lineupName.trim() || 'Nouvelle composition'}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span>{totalAssignedPlayers} affectation{totalAssignedPlayers > 1 ? 's' : ''}</span>
                  <span>{lines.filter((line) => line.players.length > 0).length}/8 unites remplies</span>
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    {mainGoalie ? `${mainGoalie.name} #${mainGoalie.number}` : 'Aucun gardien principal'}
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                  onClick={resetLineup}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500/10"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  Reinitialiser
                </button>

                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={lines.every((line) => line.players.length === 0) && !mainGoalie}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>

          {lineups.length > 0 && (
            <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20">
              <h2 className="mb-4 text-2xl font-semibold text-slate-50">Mes line-ups</h2>

              <div className="space-y-4">
                {lineups.map((lineup) => {
                  const lineupLines = hydrateLines(lineup.data.lines);
                  const totalPlayers = lineupLines.reduce((sum, line) => sum + line.players.length, 0);
                  const filledUnits = lineupLines.filter((line) => line.players.length > 0).length;

                  return (
                    <div
                      key={lineup.id}
                      className="flex flex-col gap-4 rounded-[1.5rem] border border-red-500/90 bg-slate-900/85 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xl font-semibold text-slate-50">{lineup.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {totalPlayers} joueur{totalPlayers > 1 ? 's' : ''} • {filledUnits} unite{filledUnits > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="flex gap-3 self-start lg:self-auto">
                        <button
                          onClick={() => handleLineupChange(lineup.id)}
                          className="inline-flex items-center justify-center rounded-2xl border border-red-500 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500/10"
                          type="button"
                        >
                          Charger
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Etes-vous sur ?')) {
                              deleteLineup(lineup.id);
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-50">Sauvegarder le line-up</h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Nom du line-up</span>
                <input
                  type="text"
                  value={lineupName}
                  onChange={(event) => setLineupName(event.target.value)}
                  placeholder="Ex: Reconciliation du samedi"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-red-500"
                  autoFocus
                  disabled={isSaving}
                />
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  disabled={isSaving}
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveLineup}
                  disabled={isSaving || !lineupName.trim()}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PlayerSelectorModal
        isOpen={showPlayerSelector}
        position={selectedPositionForModal}
        players={players.filter((player) => !normalizeText(player.position).includes('gard'))}
        usedPlayerIds={usedPlayerIds}
        playerAssignments={playerAssignments}
        onSelectPlayer={handleAddPlayer}
        onClose={() => {
          setShowPlayerSelector(false);
          setSelectedPositionForModal(null);
        }}
      />
    </div>
  );
}

export default function LineupsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300 shadow-2xl shadow-slate-950/20">
          Chargement...
        </div>
      }
    >
      <LineupsPageContent />
    </Suspense>
  );
}
