import React, { useState, useEffect, useCallback } from 'react';
import { WordItem, LearnState } from '../types.ts';
import { speakText } from '../utils/speech.ts';
import { Volume2, Check, X, ArrowRight, RotateCcw, ListFilter, ShieldCheck } from 'lucide-react';

interface LearnViewProps {
  allWords: WordItem[];
  learnState: LearnState;
  setLearnState: React.Dispatch<React.SetStateAction<LearnState>>;
  onCompleteLearning: () => void;
  onOpenDeckDrawer: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  allWords,
  learnState,
  setLearnState,
  onCompleteLearning,
  onOpenDeckDrawer,
}) => {
  const wordsMap = React.useMemo(() => {
    const map = new Map<string, WordItem>();
    allWords.forEach((w) => map.set(w.id, w));
    return map;
  }, [allWords]);

  const { round, currentQueue, currentIndex, knownWordIds, unknownWordIds, revealed } = learnState;

  // Current active word
  const currentWordId = currentQueue[currentIndex];
  const currentWord = wordsMap.get(currentWordId);

  // Round summary state
  const isRoundFinished = currentIndex >= currentQueue.length || !currentWord;

  // Handle "I Know"
  const handleIKnow = useCallback(() => {
    if (!currentWordId) return;

    setLearnState((prev) => {
      // Add to known, remove from unknown
      const newKnown = Array.from(new Set([...prev.knownWordIds, currentWordId]));
      const newUnknown = prev.unknownWordIds.filter((id) => id !== currentWordId);

      return {
        ...prev,
        knownWordIds: newKnown,
        unknownWordIds: newUnknown,
        currentIndex: prev.currentIndex + 1,
        revealed: false,
        history: [
          ...prev.history,
          {
            wordId: currentWordId,
            round: prev.round,
            knew: true,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [currentWordId, setLearnState]);

  // Handle "Don't Know" (shows translation with original word)
  const handleIDontKnow = useCallback(() => {
    if (!currentWordId) return;

    setLearnState((prev) => {
      // Mark into unknown for this round
      const newUnknown = Array.from(new Set([...prev.unknownWordIds, currentWordId]));
      // Remove from known if it was previously considered known
      const newKnown = prev.knownWordIds.filter((id) => id !== currentWordId);

      return {
        ...prev,
        unknownWordIds: newUnknown,
        knownWordIds: newKnown,
        revealed: true, // Show translation + original word
        history: [
          ...prev.history,
          {
            wordId: currentWordId,
            round: prev.round,
            knew: false,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [currentWordId, setLearnState]);

  // Handle advancing after seeing the translation in "Don't Know"
  const handleNextAfterReveal = useCallback(() => {
    setLearnState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      revealed: false,
    }));
  }, [setLearnState]);

  // Start next round with ONLY the unmastered words
  const handleStartNextRound = () => {
    if (unknownWordIds.length === 0) {
      onCompleteLearning();
      return;
    }

    // Shuffle unknown words slightly for better recall
    const shuffledUnknown = [...unknownWordIds];
    for (let i = shuffledUnknown.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUnknown[i], shuffledUnknown[j]] = [shuffledUnknown[j], shuffledUnknown[i]];
    }

    setLearnState((prev) => ({
      ...prev,
      round: prev.round + 1,
      currentQueue: shuffledUnknown,
      currentIndex: 0,
      unknownWordIds: [], // reset for new round
      revealed: false,
    }));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (isRoundFinished) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (unknownWordIds.length === 0) {
            onCompleteLearning();
          } else {
            handleStartNextRound();
          }
        }
        return;
      }

      if (!revealed) {
        if (e.key === '1' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'k') {
          e.preventDefault();
          handleIKnow();
        } else if (e.key === '2' || e.key === 'ArrowLeft' || e.key.toLowerCase() === 'd' || e.key === ' ') {
          e.preventDefault();
          handleIDontKnow();
        } else if (e.key.toLowerCase() === 'p' && currentWord) {
          e.preventDefault();
          speakText(currentWord.original);
        }
      } else {
        // When card is revealed
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextAfterReveal();
        } else if (e.key.toLowerCase() === 'p' && currentWord) {
          e.preventDefault();
          speakText(currentWord.translation);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    revealed,
    isRoundFinished,
    unknownWordIds.length,
    currentWord,
    handleIKnow,
    handleIDontKnow,
    handleNextAfterReveal,
    onCompleteLearning,
  ]);

  // Total words mastered vs remaining
  const totalMasteredCount = knownWordIds.length;
  const totalWordsCount = allWords.length;
  const progressPercent = totalWordsCount > 0 ? (totalMasteredCount / totalWordsCount) * 100 : 0;

  // View: Round Summary / Finished
  if (isRoundFinished) {
    const hasRemaining = unknownWordIds.length > 0;

    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-8">
        <div className="border border-[#27272a] rounded-xl p-8 bg-[#121214] space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Round {round} Completed
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {hasRemaining ? 'Unmastered Words Stack' : 'Mastery Achieved'}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#27272a]">
            <div className="text-left space-y-1">
              <div className="text-xs text-neutral-400">Mastered Words</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {totalMasteredCount} / {totalWordsCount}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-neutral-400">Needs Practice</div>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {unknownWordIds.length}
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {hasRemaining
              ? `Next round will quiz ONLY the ${unknownWordIds.length} words you didn't know yet, until every word is known.`
              : `All ${totalWordsCount} words have been mastered! You are now prepared for the final 95% retention test.`}
          </p>

          <div className="pt-2">
            {hasRemaining ? (
              <button
                type="button"
                onClick={handleStartNextRound}
                className="w-full py-3 px-6 bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Round {round + 1} ({unknownWordIds.length} words)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onCompleteLearning}
                className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Begin Retention Test (95% Required)</span>
              </button>
            )}
          </div>
        </div>

        {hasRemaining && unknownWordIds.length > 0 && (
          <div className="text-left border border-[#27272a] rounded-lg p-5 bg-[#121214] space-y-3">
            <div className="text-xs uppercase font-semibold text-neutral-400 flex items-center justify-between">
              <span>Words Queued for Next Round ({unknownWordIds.length})</span>
            </div>
            <div className="divide-y divide-[#27272a] max-h-48 overflow-y-auto font-mono text-xs">
              {unknownWordIds.map((id, idx) => {
                const w = wordsMap.get(id);
                if (!w) return null;
                return (
                  <div key={id} className="py-2 flex items-center justify-between text-neutral-300">
                    <span className="truncate flex-1">{idx + 1}. {w.original}</span>
                    <span className="text-neutral-500 truncate flex-1 text-right">{w.translation}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col min-h-[calc(100vh-4rem)] justify-between">
      {/* Top Meta & Progress Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">ROUND {round}</span>
            <span>·</span>
            <span className="tabular-nums">
              Card {currentIndex + 1} of {currentQueue.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-400 tabular-nums">
              {totalMasteredCount}/{totalWordsCount} Mastered
            </span>
            <button
              type="button"
              onClick={onOpenDeckDrawer}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Deck</span>
            </button>
          </div>
        </div>

        {/* Minimalist Progress Track */}
        <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-[#27272a]">
          <div
            className="bg-neutral-200 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Centered Flashcard */}
      <div className="my-auto py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl border border-[#27272a] rounded-2xl bg-[#121214] p-8 sm:p-12 text-center transition-all duration-200 shadow-2xl relative">
          {/* Audio Pronounce Action */}
          <button
            type="button"
            onClick={() => speakText(currentWord.original)}
            title="Pronounce (Key: P)"
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white hover:bg-[#1f1f23] rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Original Word in the middle of the screen */}
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest font-mono text-neutral-500">
              {revealed ? 'Original Word & Translation' : 'Prompt'}
            </div>

            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white select-text">
              {currentWord.original}
            </div>

            {/* When user doesn't know the word, show its translation with original word */}
            {revealed && (
              <div className="pt-6 mt-6 border-t border-[#27272a] space-y-3 animate-fadeIn">
                <div className="text-xl sm:text-2xl md:text-3xl font-medium text-neutral-300 font-sans">
                  {currentWord.translation}
                </div>
                <div className="text-xs text-amber-400/90 font-mono">
                  Saved to review stack · Will re-test in Round {round + 1}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-xl mt-8">
          {!revealed ? (
            <div className="grid grid-cols-2 gap-4">
              {/* "Don't Know" Button: reveals translation with the original word */}
              <button
                type="button"
                onClick={handleIDontKnow}
                className="py-3.5 px-6 rounded-xl bg-[#18181b] hover:bg-[#202024] active:bg-[#27272a] border border-[#27272a] hover:border-neutral-700 text-neutral-200 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Don't Know</span>
                <span className="hidden sm:inline font-mono text-[11px] text-neutral-500 ml-1">[2]</span>
              </button>

              {/* "I Know" Button: moves to knowing list and advances */}
              <button
                type="button"
                onClick={handleIKnow}
                className="py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>I Know</span>
                <span className="hidden sm:inline font-mono text-[11px] text-neutral-600 ml-1">[1]</span>
              </button>
            </div>
          ) : (
            /* After revealed: Continue to next word */
            <button
              type="button"
              onClick={handleNextAfterReveal}
              className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Next Word</span>
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-[11px] text-neutral-600 ml-1">[Space]</span>
            </button>
          )}
        </div>
      </div>

      {/* Quiet Bottom Keyboard Shortcuts Guide */}
      <div className="py-4 text-center text-xs text-neutral-500 font-mono">
        {!revealed ? (
          <span>[1] I Know · [2] Don't Know (Reveal) · [P] Audio</span>
        ) : (
          <span>[Space / Enter] Next Word</span>
        )}
      </div>
    </div>
  );
};
