/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WordItem, StudyMode, LearnState } from './types.ts';
import { SAMPLE_DECKS } from './utils/sampleDecks.ts';
import { parseWordList } from './utils/parser.ts';
import { Header } from './components/Header.tsx';
import { LoadView } from './components/LoadView.tsx';
import { LearnView } from './components/LearnView.tsx';
import { TestView } from './components/TestView.tsx';
import { WordListDrawer } from './components/WordListDrawer.tsx';

const STORAGE_KEYS = {
  WORDS: 'lexiloop_words_v1',
  LEARN_STATE: 'lexiloop_learn_state_v1',
  CURRENT_MODE: 'lexiloop_current_mode_v1',
};

export default function App() {
  // Load words from localStorage or default to German A1 preset
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored words', e);
    }
    // Default initial preset containing der Vater - Father
    return parseWordList(SAMPLE_DECKS[0].content).items;
  });

  const [currentMode, setCurrentMode] = useState<StudyMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_MODE);
      if (stored && ['load', 'learn', 'test'].includes(stored)) {
        return stored as StudyMode;
      }
    } catch (e) {
      // fallback
    }
    return 'learn';
  });

  // Learn session state
  const [learnState, setLearnState] = useState<LearnState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEARN_STATE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored learn state', e);
    }

    const defaultQueue = words.map((w) => w.id);
    return {
      round: 1,
      currentQueue: defaultQueue,
      currentIndex: 0,
      knownWordIds: [],
      unknownWordIds: [],
      revealed: false,
      history: [],
    };
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
    } catch (e) {
      console.error(e);
    }
  }, [words]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARN_STATE, JSON.stringify(learnState));
    } catch (e) {
      console.error(e);
    }
  }, [learnState]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, currentMode);
    } catch (e) {
      console.error(e);
    }
  }, [currentMode]);

  // Handle newly loaded words
  const handleWordsLoaded = (newWords: WordItem[]) => {
    setWords(newWords);
    const newQueue = newWords.map((w) => w.id);
    setLearnState({
      round: 1,
      currentQueue: newQueue,
      currentIndex: 0,
      knownWordIds: [],
      unknownWordIds: [],
      revealed: false,
      history: [],
    });
    setCurrentMode('learn');
  };

  // Reset current session
  const handleResetSession = () => {
    const freshQueue = words.map((w) => w.id);
    setLearnState({
      round: 1,
      currentQueue: freshQueue,
      currentIndex: 0,
      knownWordIds: [],
      unknownWordIds: [],
      revealed: false,
      history: [],
    });
    setCurrentMode('learn');
  };

  // Switch to Test Mode once learning is complete
  const handleCompleteLearning = () => {
    setCurrentMode('test');
  };

  // If user fails the 95% test, retrain failed words in Learn Mode
  const handleRetrainFailedWords = (failedWordIds: string[]) => {
    // Retain whatever was not failed as known
    const stillKnown = words.map((w) => w.id).filter((id) => !failedWordIds.includes(id));
    setLearnState({
      round: 1,
      currentQueue: failedWordIds,
      currentIndex: 0,
      knownWordIds: stillKnown,
      unknownWordIds: [],
      revealed: false,
      history: [],
    });
    setCurrentMode('learn');
  };

  const handleUpdateWords = (updated: WordItem[]) => {
    setWords(updated);
    // filter learn state queues
    const validIds = new Set(updated.map((u) => u.id));
    setLearnState((prev) => ({
      ...prev,
      currentQueue: prev.currentQueue.filter((id) => validIds.has(id)),
      knownWordIds: prev.knownWordIds.filter((id) => validIds.has(id)),
      unknownWordIds: prev.unknownWordIds.filter((id) => validIds.has(id)),
      currentIndex: Math.min(prev.currentIndex, Math.max(0, updated.length - 1)),
    }));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* Strict 3-zone Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        hasWords={words.length > 0}
        onOpenDeckDrawer={() => setIsDrawerOpen(true)}
        onResetSession={handleResetSession}
        totalWordsCount={words.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentMode === 'load' && (
          <LoadView onWordsLoaded={handleWordsLoaded} existingCount={words.length} />
        )}

        {currentMode === 'learn' && words.length > 0 && (
          <LearnView
            allWords={words}
            learnState={learnState}
            setLearnState={setLearnState}
            onCompleteLearning={handleCompleteLearning}
            onOpenDeckDrawer={() => setIsDrawerOpen(true)}
          />
        )}

        {currentMode === 'test' && words.length > 0 && (
          <TestView
            allWords={words}
            onRestartTest={() => setCurrentMode('test')}
            onRetrainFailedWords={handleRetrainFailedWords}
            onBackToLearn={() => setCurrentMode('learn')}
          />
        )}

        {words.length === 0 && currentMode !== 'load' && (
          <div className="max-w-md mx-auto my-auto px-6 py-12 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">No Vocabulary Loaded</h2>
            <p className="text-xs text-neutral-400">
              Please load your vocabulary list to start learning and testing.
            </p>
            <button
              type="button"
              onClick={() => setCurrentMode('load')}
              className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-md hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Load Words
            </button>
          </div>
        )}
      </main>

      {/* Deck inspection drawer */}
      <WordListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        words={words}
        knownIds={learnState.knownWordIds}
        onUpdateWords={handleUpdateWords}
      />
    </div>
  );
}
