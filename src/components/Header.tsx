import React from 'react';
import { StudyMode } from '../types.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  hasWords: boolean;
  onOpenDeckDrawer: () => void;
  onResetSession: () => void;
  totalWordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  hasWords,
  onOpenDeckDrawer,
  onResetSession,
  totalWordsCount,
}) => {
  return (
    <header className="border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectMode(hasWords ? 'learn' : 'load')}
          className="text-lg font-bold tracking-tight text-white hover:text-neutral-200 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          LexiLoop
        </button>

        {/* Zone 2: Single-line text navigation links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            type="button"
            onClick={() => onSelectMode('load')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              currentMode === 'load'
                ? 'text-white border-b-2 border-white pb-0.5'
                : 'hover:text-neutral-200'
            }`}
          >
            Load Words
          </button>

          {hasWords && (
            <>
              <button
                type="button"
                onClick={() => onSelectMode('learn')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentMode === 'learn' || currentMode === 'round-summary'
                    ? 'text-white border-b-2 border-white pb-0.5'
                    : 'hover:text-neutral-200'
                }`}
              >
                Learn Mode
              </button>

              <button
                type="button"
                onClick={() => onSelectMode('test')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentMode === 'test' || currentMode === 'test-result'
                    ? 'text-white border-b-2 border-white pb-0.5'
                    : 'hover:text-neutral-200'
                }`}
              >
                Retention Test (95%)
              </button>

              <button
                type="button"
                onClick={onOpenDeckDrawer}
                className="whitespace-nowrap shrink-0 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Deck ({totalWordsCount})
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <PWAInstallButton />

          {hasWords ? (
            <button
              type="button"
              onClick={onResetSession}
              className="px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Progress
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectMode('load')}
              className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
