import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordItem, TestState, TestAnswer } from '../types.ts';
import { speakText } from '../utils/speech.ts';
import { Volume2, Check, X, RotateCcw, ArrowRight, ShieldAlert, ShieldCheck, Keyboard, Eye } from 'lucide-react';

interface TestViewProps {
  allWords: WordItem[];
  onRestartTest: () => void;
  onRetrainFailedWords: (failedWordIds: string[]) => void;
  onBackToLearn: () => void;
}

export const TestView: React.FC<TestViewProps> = ({
  allWords,
  onRestartTest,
  onRetrainFailedWords,
  onBackToLearn,
}) => {
  const wordsMap = React.useMemo(() => {
    const map = new Map<string, WordItem>();
    allWords.forEach((w) => map.set(w.id, w));
    return map;
  }, [allWords]);

  // Initialized shuffled test queue
  const [testQueue, setTestQueue] = useState<string[]>(() => {
    const ids = allWords.map((w) => w.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'self' | 'type'>('self');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [typedEvaluated, setTypedEvaluated] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWordId = testQueue[currentIndex];
  const currentWord = wordsMap.get(currentWordId);

  // Focus input when moving to next word in typing mode
  useEffect(() => {
    if (inputMode === 'type' && !revealed && !typedEvaluated) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, inputMode, revealed, typedEvaluated]);

  // Record Answer (Self-Assessment)
  const handleRecordSelfAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentWord) return;

      const newAnswer: TestAnswer = {
        wordId: currentWord.id,
        original: currentWord.original,
        translation: currentWord.translation,
        isCorrect,
      };

      const nextAnswers = [...answers, newAnswer];
      setAnswers(nextAnswers);

      if (currentIndex + 1 >= testQueue.length) {
        setIsTestFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setRevealed(false);
      }
    },
    [currentWord, answers, currentIndex, testQueue.length]
  );

  // Evaluate Typed Answer
  const handleEvaluateTyped = () => {
    if (!currentWord) return;
    setTypedEvaluated(true);
    setRevealed(true);

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .trim()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
        .replace(/\s+/g, ' ');

    const userNorm = normalize(typedAnswer);
    const targetNorm = normalize(currentWord.translation);

    // Also check if multiple options separated by / or ,
    const targetAlts = currentWord.translation
      .split(/[/,;]/)
      .map((s) => normalize(s))
      .filter(Boolean);

    const isMatch = userNorm === targetNorm || targetAlts.includes(userNorm);

    const newAnswer: TestAnswer = {
      wordId: currentWord.id,
      original: currentWord.original,
      translation: currentWord.translation,
      userAnswer: typedAnswer,
      isCorrect: isMatch,
    };

    setAnswers((prev) => [...prev, newAnswer]);
  };

  const handleNextAfterTyped = () => {
    setTypedAnswer('');
    setTypedEvaluated(false);
    setRevealed(false);

    if (currentIndex + 1 >= testQueue.length) {
      setIsTestFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Override typed answer as correct if typo occurred
  const handleOverrideTypedCorrect = () => {
    setAnswers((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          isCorrect: true,
        };
      }
      return copy;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTestFinished) return;

      if (inputMode === 'self') {
        if (!revealed) {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setRevealed(true);
          } else if (e.key.toLowerCase() === 'p' && currentWord) {
            e.preventDefault();
            speakText(currentWord.original);
          }
        } else {
          // Revealed: 1 for Correct, 2 for Incorrect
          if (e.key === '1' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'k') {
            e.preventDefault();
            handleRecordSelfAnswer(true);
          } else if (e.key === '2' || e.key === 'ArrowLeft' || e.key.toLowerCase() === 'd') {
            e.preventDefault();
            handleRecordSelfAnswer(false);
          } else if (e.key.toLowerCase() === 'p' && currentWord) {
            e.preventDefault();
            speakText(currentWord.translation);
          }
        }
      } else {
        // Typing mode
        if (typedEvaluated) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNextAfterTyped();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTestFinished,
    inputMode,
    revealed,
    typedEvaluated,
    currentWord,
    handleRecordSelfAnswer,
  ]);

  // If Test is finished, show the exact 95% pass/fail screen
  if (isTestFinished) {
    const totalCount = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const scorePercent = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    const isPassed = scorePercent >= 95.0;
    const failedAnswers = answers.filter((a) => !a.isCorrect);

    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 text-center animate-fadeIn">
        {/* Outcome Box */}
        <div
          className={`border rounded-2xl p-8 sm:p-12 bg-[#121214] space-y-6 ${
            isPassed ? 'border-emerald-600/50 shadow-emerald-950/20' : 'border-rose-900/60 shadow-rose-950/20'
          }`}
        >
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Retention Examination · 95% Threshold
            </div>

            {/* Exactly "You Failed" or "Passed" as explicitly requested by the user */}
            <h1
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                isPassed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPassed ? 'Passed' : 'You Failed'}
            </h1>
          </div>

          {/* Score details */}
          <div className="py-4 border-y border-[#27272a] grid grid-cols-3 gap-2 font-mono text-center">
            <div>
              <div className="text-xs text-neutral-500 uppercase">Score</div>
              <div
                className={`text-2xl sm:text-3xl font-bold tabular-nums ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {scorePercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase">Correct</div>
              <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {correctCount} / {totalCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase">Required</div>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-400 tabular-nums">
                95.0%
              </div>
            </div>
          </div>

          <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            {isPassed
              ? `Outstanding memory retention! You surpassed the 95% threshold across all ${totalCount} words.`
              : `You scored ${scorePercent.toFixed(1)}%, which is below the 95.0% passing requirement. Review your missed words below.`}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isPassed && failedAnswers.length > 0 && (
              <button
                type="button"
                onClick={() => onRetrainFailedWords(failedAnswers.map((a) => a.wordId))}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Practice Failed Words ({failedAnswers.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onRestartTest}
              className="w-full sm:w-auto px-6 py-3 bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-neutral-200 hover:text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>

            <button
              type="button"
              onClick={onBackToLearn}
              className="w-full sm:w-auto px-6 py-3 bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-neutral-400 hover:text-white font-medium text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
            >
              Back to Learning
            </button>
          </div>
        </div>

        {/* Failed Words Breakdown if failed */}
        {!isPassed && failedAnswers.length > 0 && (
          <div className="text-left border border-[#27272a] rounded-xl p-6 bg-[#121214] space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider text-rose-400">
                Failed Words ({failedAnswers.length})
              </span>
              <span className="font-mono text-neutral-500">Need Practice</span>
            </div>

            <div className="divide-y divide-[#27272a] max-h-72 overflow-y-auto text-xs font-mono">
              {failedAnswers.map((item, idx) => (
                <div key={item.wordId} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 truncate flex-1">
                    <span className="text-neutral-500 w-6">{idx + 1}.</span>
                    <span className="text-neutral-200 font-medium truncate">{item.original}</span>
                  </div>
                  <div className="text-neutral-400 truncate flex-1 text-right">
                    {item.translation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active testing in progress
  const answeredCount = answers.length;
  const currentCorrect = answers.filter((a) => a.isCorrect).length;
  const currentRunningRate = answeredCount > 0 ? (currentCorrect / answeredCount) * 100 : 100;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col min-h-[calc(100vh-4rem)] justify-between">
      {/* Top Meta Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">TESTING MODE</span>
            <span>·</span>
            <span className="tabular-nums">
              Word {currentIndex + 1} of {testQueue.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              Score: {currentCorrect}/{answeredCount || 0} (
              {answeredCount > 0 ? `${currentRunningRate.toFixed(1)}%` : '—'})
            </span>
            <span>·</span>
            <span className="text-neutral-500">Pass: 95.0%</span>
          </div>
        </div>

        {/* Minimalist Progress Track */}
        <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-[#27272a]">
          <div
            className="bg-neutral-200 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / testQueue.length) * 100}%` }}
          />
        </div>

        {/* Mode Toggle: Self-Assessment vs Typing */}
        <div className="flex items-center justify-end gap-2 pt-1 text-xs">
          <span className="text-neutral-500">Input Mode:</span>
          <button
            type="button"
            onClick={() => setInputMode('self')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              inputMode === 'self'
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Self-Recall
          </button>
          <button
            type="button"
            onClick={() => setInputMode('type')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              inputMode === 'type'
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Type Answer
          </button>
        </div>
      </div>

      {/* Main Centered Test Card */}
      <div className="my-auto py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl border border-[#27272a] rounded-2xl bg-[#121214] p-8 sm:p-12 text-center transition-all duration-200 shadow-2xl relative">
          {/* Audio Pronounce Action */}
          {currentWord && (
            <button
              type="button"
              onClick={() => speakText(currentWord.original)}
              title="Pronounce (Key: P)"
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white hover:bg-[#1f1f23] rounded-lg transition-colors cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest font-mono text-neutral-500">
              Recall the Translation
            </div>

            <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white select-text">
              {currentWord?.original}
            </div>

            {/* If revealed or evaluated */}
            {revealed && currentWord && (
              <div className="pt-6 mt-6 border-t border-[#27272a] space-y-2 animate-fadeIn">
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono">
                  Correct Translation
                </div>
                <div className="text-2xl sm:text-3xl font-medium text-neutral-200">
                  {currentWord.translation}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls based on Self vs Typing mode */}
        <div className="w-full max-w-xl mt-8">
          {inputMode === 'self' ? (
            !revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Reveal Answer</span>
                <span className="hidden sm:inline font-mono text-[11px] text-neutral-600 ml-1">
                  [Space / Enter]
                </span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRecordSelfAnswer(false)}
                  className="py-3.5 px-6 rounded-xl bg-[#18181b] hover:bg-[#202024] active:bg-[#27272a] border border-[#27272a] hover:border-neutral-700 text-neutral-200 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>I Forgot / Incorrect</span>
                  <span className="hidden sm:inline font-mono text-[11px] text-neutral-500 ml-1">[2]</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecordSelfAnswer(true)}
                  className="py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>I Remembered</span>
                  <span className="hidden sm:inline font-mono text-[11px] text-neutral-600 ml-1">[1]</span>
                </button>
              </div>
            )
          ) : (
            /* Type-In Mode */
            <div className="space-y-4">
              {!typedEvaluated ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (typedAnswer.trim()) {
                      handleEvaluateTyped();
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type translation and press Enter..."
                    className="flex-1 bg-[#121214] border border-[#27272a] focus:border-white rounded-xl px-4 py-3 text-white text-sm focus:outline-none font-mono"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!typedAnswer.trim()}
                    className="px-6 py-3 bg-white disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-neutral-200 text-black font-semibold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    Submit
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {answers[answers.length - 1]?.isCorrect ? (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Correct match!</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs font-mono flex items-center justify-between gap-2">
                      <span className="text-rose-300 flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400" />
                        <span>You typed: "{typedAnswer}"</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleOverrideTypedCorrect}
                        className="text-[11px] underline text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Override as correct
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleNextAfterTyped}
                    className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Next Word</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-mono text-[11px] text-neutral-600">[Enter]</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quiet Bottom Keyboard Shortcuts Guide */}
      <div className="py-4 text-center text-xs text-neutral-500 font-mono">
        {inputMode === 'self' ? (
          !revealed ? (
            <span>[Space / Enter] Reveal · [P] Audio</span>
          ) : (
            <span>[1] Remembered · [2] Forgot · [P] Audio</span>
          )
        ) : (
          <span>Type translation & hit Enter · 95% required to pass</span>
        )}
      </div>
    </div>
  );
};
