'use client';

import React from 'react';
import type { LineKind, LinePlayer, LinePosition } from '@/types';

interface HalfRinkProps {
  players: LinePlayer[];
  lineKind: LineKind;
  onRemovePlayer?: (playerId: string) => void;
  onPositionClick?: (position: LinePosition) => void;
  isEditable?: boolean;
}

const FULL_STRENGTH_COORDS: Record<Exclude<LinePosition, 'goalie'>, { x: number; y: number; label: string }> = {
  def_left: { x: 35, y: 67, label: 'Def' },
  def_right: { x: 65, y: 67, label: 'Def' },
  att_left: { x: 28, y: 30, label: 'Att' },
  att_center: { x: 50, y: 18, label: 'Att' },
  att_right: { x: 72, y: 30, label: 'Att' }
};

const BOXPLAY_COORDS: Record<'def_left' | 'def_right' | 'att_left' | 'att_right', { x: number; y: number; label: string }> = {
  def_left: { x: 35, y: 67, label: 'Def' },
  def_right: { x: 65, y: 67, label: 'Def' },
  att_left: { x: 38, y: 28, label: 'Att' },
  att_right: { x: 62, y: 28, label: 'Att' }
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getPlayerColor = (position: string) => {
  const normalizedPosition = normalizeText(position);

  if (normalizedPosition.includes('gard')) return 'bg-rose-600 ring-rose-400';
  if (normalizedPosition.includes('def')) return 'bg-indigo-600 ring-indigo-400';
  if (normalizedPosition.includes('centre') || normalizedPosition.includes('ailier') || normalizedPosition.includes('attaq')) {
    return 'bg-fuchsia-700 ring-fuchsia-400';
  }

  return 'bg-slate-600 ring-slate-400';
};

const getActivePositions = (lineKind: LineKind): Exclude<LinePosition, 'goalie'>[] => {
  if (lineKind === 'boxplay') {
    return ['att_left', 'att_right', 'def_left', 'def_right'];
  }

  return ['att_left', 'att_center', 'att_right', 'def_left', 'def_right'];
};

export function HalfRink({ players, lineKind, onRemovePlayer, onPositionClick, isEditable = false }: HalfRinkProps) {
  const activePositions = getActivePositions(lineKind);
  const coordsMap = lineKind === 'boxplay' ? BOXPLAY_COORDS : FULL_STRENGTH_COORDS;

  return (
    <div className="space-y-5">
      <div
        className="relative w-full overflow-hidden rounded-[1.5rem] border-[5px] border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 shadow-inner"
        style={{ aspectRatio: '1 / 1', minHeight: '360px' }}
      >
        <div className="absolute left-0 right-0 top-[6%] h-1 bg-red-500" />
        <div className="absolute left-0 right-0 bottom-[50%] h-1 bg-blue-600" />
        <div className="absolute bottom-[10%] left-0 right-0 h-1 bg-red-500" />
        <div className="absolute left-1/2 top-[-3%] h-28 w-28 -translate-x-1/2 rounded-full border-4 border-red-500/80" />
        <div className="absolute bottom-[10%] left-1/2 h-16 w-16 -translate-x-1/2 rounded-t-full border-4 border-red-500/80 border-b-0" />

        {activePositions.map((position) => {
          const coords = coordsMap[position as keyof typeof coordsMap];
          const player = players.find((entry) => entry.linePosition === position);

          return (
            <div
              key={position}
              className="absolute"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {player ? (
                <div className="group flex flex-col items-center" title={`${player.name} #${player.number}`}>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg ring-2 transition-all ${getPlayerColor(
                      player.position
                    )}`}
                  >
                    {player.number}
                  </div>

                  {isEditable && (
                    <button
                      onClick={() => onRemovePlayer?.(player.id)}
                      className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs text-white opacity-0 transition group-hover:flex group-hover:opacity-100"
                      type="button"
                    >
                      x
                    </button>
                  )}

                  <p className="mt-2 max-w-[6.5rem] text-center text-[11px] font-medium leading-tight text-slate-500">
                    {player.name}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => isEditable && onPositionClick?.(position)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-400 bg-white/45 text-xs font-medium text-slate-500 transition hover:border-slate-500 hover:bg-white/70"
                  title={isEditable ? `Ajouter ${coords.label}` : coords.label}
                  type="button"
                >
                  {coords.label}
                </button>
              )}
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-white/55 px-4 py-2 text-center text-sm text-slate-500 backdrop-blur-sm">
              Glace vide
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Attaquants</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            {players.filter((player) => player.linePosition.startsWith('att')).length}/{lineKind === 'boxplay' ? 2 : 3}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Defenseurs</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            {players.filter((player) => player.linePosition.startsWith('def')).length}/2
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-center sm:col-span-1 col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            {players.length}/{lineKind === 'boxplay' ? 4 : 5}
          </p>
        </div>
      </div>
    </div>
  );
}
