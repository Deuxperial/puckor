'use client';

import React from 'react';
import type { Player } from '@/types';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayers?: any[];
  onAddPlayer?: (player: Player, line?: string) => void;
  onRemovePlayer?: (playerId: string) => void;
  isLoading?: boolean;
}

export function PlayerSelector({
  players,
  isLoading = false
}: PlayerSelectorProps) {
  const getPlayerColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'gardien':
        return 'bg-red-600';
      case 'défenseur':
        return 'bg-blue-600';
      case 'centre':
      case 'ailier':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Liste des joueurs */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Joueurs</h2>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Chargement...
          </div>
        ) : players.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getPlayerColor(
                    player.position
                  )}`}
                >
                  {player.number}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{player.name}</p>
                  <p className="text-xs text-slate-400">{player.position}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Aucun joueur
          </div>
        )}
      </div>
    </div>
  );
}
