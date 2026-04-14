'use client';

import React from 'react';
import { Users } from 'lucide-react';

// Type local pour ce composant deprecated
interface RinkPosition {
  playerId: string;
  playerName: string;
  playerNumber: number;
  position: string;
  x: number;
  y: number;
  line?: string;
}

interface RinkProps {
  positions: RinkPosition[];
  onPositionMove?: (playerId: string, x: number, y: number) => void;
  isEditable?: boolean;
}

export function Rink({ positions, onPositionMove, isEditable = true }: RinkProps) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const rinkRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, playerId: string) => {
    if (!isEditable) return;
    e.preventDefault();
    setDraggingId(playerId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingId || !rinkRef.current || !isEditable) return;

    const rect = rinkRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    onPositionMove?.(draggingId, clampedX, clampedY);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

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

  const getLineLabel = (line: string) => {
    switch (line) {
      case 'defense':
        return 'Défense';
      case 'line1':
        return 'Ligne 1';
      case 'line2':
        return 'Ligne 2';
      case 'line3':
        return 'Ligne 3';
      case 'bench':
        return 'Banc';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Patinoire */}
      <div
        ref={rinkRef}
        className="relative w-full bg-gradient-to-b from-sky-200 via-sky-100 to-sky-200 rounded-lg border-4 border-slate-700 overflow-hidden cursor-move"
        style={{ aspectRatio: '2 / 1', minHeight: '300px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Ligne rouge au centre */}
        <div className="absolute top-0 left-1/2 w-1 h-full bg-red-600 transform -translate-x-1/2" />

        {/* Cercles bleus (attacking zones) */}
        <div className="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 border-2 border-blue-400 rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-40" />

        {/* Joueurs */}
        {positions.map((pos) => (
          <div
            key={pos.playerId}
            className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all ${getPlayerColor(
              pos.position
            )} ${draggingId === pos.playerId ? 'ring-2 ring-yellow-300 scale-110' : ''} ${
              isEditable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => handleMouseDown(e, pos.playerId)}
            title={`${pos.playerName} #${pos.playerNumber}`}
          >
            {pos.playerNumber}
          </div>
        ))}

        {/* Texte si aucun joueur */}
        {positions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Glace vide</p>
            </div>
          </div>
        )}
      </div>

      {/* Légende et informations */}
      <div className="grid grid-cols-2 gap-4">
        {/* Légende des couleurs */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <h3 className="text-xs font-semibold text-slate-200 mb-2">Positions</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-slate-300">Gardien</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-slate-300">Défenseur</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span className="text-slate-300">Attaquant</span>
            </div>
          </div>
        </div>

        {/* Informations des lignes */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <h3 className="text-xs font-semibold text-slate-200 mb-2">Sur glace</h3>
          <div className="space-y-1 text-xs text-slate-300">
            <p>Total: {positions.length} joueur{positions.length !== 1 ? 's' : ''}</p>
            {positions.length > 0 && (
              <p>Éd: {isEditable ? '✓ ' : '✗ '}Modifiable</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
