'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Player, LinePlayer, LinePosition } from '@/types';

interface LinePlayerDraggerProps {
  players: Player[];
  linePlayersMap: Map<string, LinePosition>; // Map playerId -> linePosition
  onAddPlayer: (player: Player, position: LinePosition) => void;
  onRemovePlayer: (playerId: string) => void;
  isLoading?: boolean;
}

const POSITION_CONFIG: Record<
  LinePosition,
  { label: string; max: 1 | 2 | 3; type: 'goalie' | 'defense' | 'attack' }
> = {
  goalie: { label: '🥅 Gardien', max: 1, type: 'goalie' },
  def_left: { label: '🔵 Déf Gauche', max: 1, type: 'defense' },
  def_right: { label: '🔵 Déf Droit', max: 1, type: 'defense' },
  att_left: { label: '🟢 Att Gauche', max: 1, type: 'attack' },
  att_center: { label: '🟢 Att Centre', max: 1, type: 'attack' },
  att_right: { label: '🟢 Att Droit', max: 1, type: 'attack' }
};

export function LinePlayerDragger({
  players,
  linePlayersMap,
  onAddPlayer,
  onRemovePlayer,
  isLoading = false
}: LinePlayerDraggerProps) {
  const getPlayerPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'gardien':
        return 'bg-red-600 hover:bg-red-500';
      case 'défenseur':
        return 'bg-blue-600 hover:bg-blue-500';
      case 'ailier':
      case 'centre':
        return 'bg-green-600 hover:bg-green-500';
      default:
        return 'bg-gray-600 hover:bg-gray-500';
    }
  };

  const selectedPlayerIds = new Set(linePlayersMap.keys());
  const availablePlayers = players.filter(p => !selectedPlayerIds.has(p.id));

  // Organiser les joueurs par position
  const playersInLine = Array.from(linePlayersMap.entries()).map(([playerId, linePos]) => {
    const player = players.find(p => p.id === playerId);
    return player ? { ...player, linePosition: linePos as LinePosition } : null;
  }).filter(Boolean) as (Player & { linePosition: LinePosition })[];

  return (
    <div className="space-y-4">
      {/* Positions assignées */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Positions assignées</h3>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(POSITION_CONFIG).map(([posKey, config]) => {
            const linePos = posKey as LinePosition;
            const player = playersInLine.find(p => p.linePosition === linePos);

            return (
              <div
                key={linePos}
                className="rounded-lg bg-slate-700/50 p-3 min-h-20 flex flex-col items-center justify-center"
              >
                <p className="text-xs text-slate-400 font-medium mb-2 text-center">
                  {config.label}
                </p>

                {player ? (
                  <div className="w-full space-y-2">
                    <button
                      onClick={() => onRemovePlayer(player.id)}
                      className={`w-full py-2 px-3 rounded-lg text-white text-sm font-bold flex items-center justify-between group ${getPlayerPositionColor(
                        player.position
                      )} transition`}
                      title={`${player.name} - ${player.position}`}
                    >
                      <span>#{player.number}</span>
                      <Trash2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                    <p className="text-xs text-slate-300 truncate text-center">
                      {player.name}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Vide</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Joueurs disponibles */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Joueurs disponibles</h3>

        {isLoading ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            Chargement...
          </div>
        ) : availablePlayers.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getPlayerPositionColor(
                      player.position
                    )}`}
                  >
                    {player.number}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {player.name}
                    </p>
                    <p className="text-xs text-slate-400">{player.position}</p>
                  </div>
                </div>

                {/* Boutons pour ajouter à chaque position */}
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  {Object.entries(POSITION_CONFIG).map(([posKey, config]) => {
                    const linePos = posKey as LinePosition;
                    const positionFull = linePlayersMap.has(
                      Array.from(linePlayersMap.entries()).find(([_, pos]) => pos === linePos)?.[0] || ''
                    );

                    // Vérifier si ce joueur convient pour cette position
                    const isGoaliePosition = config.type === 'goalie';
                    const isDefensePosition = config.type === 'defense';
                    const isAttackPosition = config.type === 'attack';

                    const playerIsGoalie = player.position.toLowerCase() === 'gardien';
                    const playerIsDefender = player.position.toLowerCase() === 'défenseur';
                    const playerIsAttacker = ['ailier', 'centre'].some(p =>
                      player.position.toLowerCase().includes(p)
                    );

                    const canAdd =
                      !positionFull &&
                      ((isGoaliePosition && playerIsGoalie) ||
                        (isDefensePosition && playerIsDefender) ||
                        (isAttackPosition && playerIsAttacker));

                    return (
                      <button
                        key={linePos}
                        onClick={() => {
                          if (canAdd) {
                            onAddPlayer(player, linePos);
                          }
                        }}
                        disabled={!canAdd}
                        className={`px-2 py-1 rounded text-xs font-semibold transition ${
                          canAdd
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                        title={
                          canAdd
                            ? `Ajouter à ${config.label}`
                            : positionFull
                              ? 'Position occupée'
                              : 'Position incompatible'
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <p className="text-sm">Tous les joueurs sont utilisés !</p>
          </div>
        )}
      </div>

      {/* Résumé */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600">
        <p className="text-sm text-slate-300">
          Composition: <span className="font-bold text-sky-400">{playersInLine.length}/6</span>
        </p>
        <p className="text-xs text-slate-400">
          {availablePlayers.length} disponible{availablePlayers.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
