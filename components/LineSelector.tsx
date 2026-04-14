'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HockeyLine } from '@/types';

interface LineSelectorProps {
  lines: HockeyLine[];
  selectedLineIndex: number;
  onLineChange: (index: number) => void;
}

const getTargetCount = (line: HockeyLine | undefined) => (line?.kind === 'boxplay' ? 4 : 5);

export function LineSelector({ lines, selectedLineIndex, onLineChange }: LineSelectorProps) {
  const currentLine = lines[selectedLineIndex];
  const playerCount = currentLine?.players?.length || 0;
  const targetCount = getTargetCount(currentLine);

  return (
    <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 px-4 py-5 shadow-2xl shadow-slate-950/20 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onLineChange(Math.max(selectedLineIndex - 1, 0))}
          disabled={selectedLineIndex === 0}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <div className="flex-1 text-center">
          <h2 className="text-2xl font-semibold text-slate-50">
            {currentLine?.label || `Ligne ${selectedLineIndex + 1}`}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {playerCount}/{targetCount} joueurs
          </p>
        </div>

        <button
          onClick={() => onLineChange(Math.min(selectedLineIndex + 1, lines.length - 1))}
          disabled={selectedLineIndex === lines.length - 1}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {lines.map((line, index) => (
          <button
            key={line.id || index}
            onClick={() => onLineChange(index)}
            className={`h-2.5 rounded-full transition ${
              index === selectedLineIndex ? 'w-8 bg-red-500' : 'w-2.5 bg-red-500 hover:opacity-80'
            }`}
            title={line.label || `Ligne ${index + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
