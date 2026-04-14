'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { Player, LinePosition } from '@/types';

type PlayerAssignments = Record<string, string[]>;

interface PlayerSelectorModalProps {
  isOpen: boolean;
  position: LinePosition | null;
  players: Player[];
  usedPlayerIds: Set<string>;
  playerAssignments: PlayerAssignments;
  onSelectPlayer: (player: Player) => void;
  onClose: () => void;
}

const POSITION_LABELS: Record<LinePosition, string> = {
  goalie: 'Gardien',
  def_left: 'Defenseur gauche',
  def_right: 'Defenseur droit',
  att_left: 'Ailier gauche',
  att_center: 'Centre',
  att_right: 'Ailier droit'
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getPositionPriority = (slotPosition: LinePosition, playerPosition: string) => {
  const normalizedPosition = normalizeText(playerPosition);

  switch (slotPosition) {
    case 'goalie':
      return normalizedPosition.includes('gard') ? 0 : 3;
    case 'def_left':
    case 'def_right':
      if (normalizedPosition.includes('def')) return 0;
      if (normalizedPosition.includes('centre')) return 1;
      if (normalizedPosition.includes('ailier') || normalizedPosition.includes('attaq')) return 2;
      if (normalizedPosition.includes('gard')) return 4;
      return 3;
    case 'att_center':
      if (normalizedPosition.includes('centre')) return 0;
      if (normalizedPosition.includes('ailier') || normalizedPosition.includes('attaq')) return 1;
      if (normalizedPosition.includes('def')) return 2;
      if (normalizedPosition.includes('gard')) return 4;
      return 3;
    case 'att_left':
    case 'att_right':
      if (normalizedPosition.includes('ailier') || normalizedPosition.includes('attaq')) return 0;
      if (normalizedPosition.includes('centre')) return 1;
      if (normalizedPosition.includes('def')) return 2;
      if (normalizedPosition.includes('gard')) return 4;
      return 3;
    default:
      return 3;
  }
};

const getPlayerColor = (position: string) => {
  const normalizedPosition = normalizeText(position);

  if (normalizedPosition.includes('gard')) return 'bg-red-600';
  if (normalizedPosition.includes('def')) return 'bg-indigo-600';
  if (normalizedPosition.includes('centre') || normalizedPosition.includes('ailier') || normalizedPosition.includes('attaq')) {
    return 'bg-fuchsia-700';
  }

  return 'bg-slate-600';
};

const AssignmentBadges = ({ assignments }: { assignments: string[] }) => {
  if (!assignments.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
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
};

export function PlayerSelectorModal({
  isOpen,
  position,
  players,
  usedPlayerIds,
  playerAssignments,
  onSelectPlayer,
  onClose
}: PlayerSelectorModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen || !position) return null;

  const normalizedSearch = normalizeText(searchTerm);

  const filteredPlayers = players
    .filter((player) =>
      normalizeText(player.name).includes(normalizedSearch) ||
      player.number.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      const priorityDiff = getPositionPriority(position, a.position) - getPositionPriority(position, b.position);
      if (priorityDiff !== 0) return priorityDiff;

      const numberDiff = a.number - b.number;
      if (numberDiff !== 0) return numberDiff;

      return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Selectionner un joueur</h2>
            <p className="mt-1 text-sm text-slate-400">{POSITION_LABELS[position]}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-200"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b border-slate-700 p-6">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Chercher par nom ou numero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-slate-100 outline-none placeholder-slate-500"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[32rem] overflow-y-auto">
          {filteredPlayers.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {filteredPlayers.map((player) => {
                const assignments = playerAssignments[player.id] || [];
                const isAlreadyInCurrentUnit = usedPlayerIds.has(player.id);

                return (
                  <button
                    key={player.id}
                    onClick={() => {
                      if (!isAlreadyInCurrentUnit) {
                        onSelectPlayer(player);
                        onClose();
                      }
                    }}
                    disabled={isAlreadyInCurrentUnit}
                    className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getPlayerColor(player.position)}`}>
                      {player.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-100">{player.name}</p>
                        {isAlreadyInCurrentUnit && (
                          <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                            Deja dans cette unite
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{player.position}</p>
                      <AssignmentBadges assignments={assignments} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400">
              <p className="text-sm">Aucun joueur trouve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
