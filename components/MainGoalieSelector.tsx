'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { Player, LinePlayer } from '@/types';

interface MainGoalieSelectorProps {
  mainGoalie: LinePlayer | undefined;
  players: Player[];
  onSelectGoalie: (player: Player) => void;
  onRemoveGoalie: () => void;
}

export function MainGoalieSelector({
  mainGoalie,
  players,
  onSelectGoalie,
  onRemoveGoalie
}: MainGoalieSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const goalies = players.filter(p => !mainGoalie || p.id !== mainGoalie.id);
  const filteredGoalies = goalies.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.number.toString().includes(searchTerm)
  );

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">🥅 Gardien Principal</h3>
      
      {mainGoalie ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">{mainGoalie.name}</p>
            <p className="text-xs text-slate-400">#{mainGoalie.number}</p>
          </div>
          <button
            onClick={onRemoveGoalie}
            className="text-slate-400 hover:text-rose-400 transition"
            title="Retirer le gardien principal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400 mb-3 italic">Aucun gardien sélectionné</p>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition"
      >
        {mainGoalie ? 'Changer' : 'Sélectionner'}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100">Sélectionner le gardien principal</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-slate-700">
              <input
                type="text"
                placeholder="Chercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-sky-400 transition"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredGoalies.length > 0 ? (
                <div className="divide-y divide-slate-700">
                  {filteredGoalies.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => {
                        onSelectGoalie(player);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-red-600">
                        {player.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {player.name}
                        </p>
                        <p className="text-xs text-slate-400">{player.position}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Aucun gardien trouvé
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
