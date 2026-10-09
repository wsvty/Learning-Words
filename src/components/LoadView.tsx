import React, { useState, useMemo } from 'react';
import { WordItem } from '../types.ts';
import { parseWordList } from '../utils/parser.ts';
import { SAMPLE_DECKS } from '../utils/sampleDecks.ts';
import { Upload, FileText, ArrowRight, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface LoadViewProps {
  onWordsLoaded: (items: WordItem[], options: { reverse: boolean; shuffle: boolean }) => void;
  existingCount: number;
}

export const LoadView: React.FC<LoadViewProps> = ({ onWordsLoaded, existingCount }) => {
  const [rawText, setRawText] = useState<string>(SAMPLE_DECKS[0].content);
  const [reverseDirection, setReverseDirection] = useState<boolean>(false);
  const [shuffleInitial, setShuffleInitial] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const parsed = useMemo(() => {
    return parseWordList(rawText);
  }, [rawText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleStart = () => {
    if (parsed.items.length === 0) return;

    let finalItems = [...parsed.items];

    if (reverseDirection) {
      finalItems = finalItems.map((item) => ({
        ...item,
        original: item.translation,
        translation: item.original,
      }));
    }

    if (shuffleInitial) {
      // Fisher-Yates shuffle
      for (let i = finalItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalItems[i], finalItems[j]] = [finalItems[j], finalItems[i]];
      }
    }

    onWordsLoaded(finalItems, { reverse: reverseDirection, shuffle: shuffleInitial });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Load Your Vocabulary
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Paste your word list below (up to 500 words). Use a hyphen or slash separator, for example:{' '}
          <code className="text-neutral-200 bg-[#18181b] px-2 py-0.5 rounded font-mono text-xs">der Vater - Father</code> or{' '}
          <code className="text-neutral-200 bg-[#18181b] px-2 py-0.5 rounded font-mono text-xs">der Vater / Father</code>.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="border border-[#27272a] rounded-lg p-5 bg-[#121214] space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
            Quick Start Presets
          </div>
          <span className="text-xs text-neutral-500">Click to load instantly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {SAMPLE_DECKS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setRawText(preset.content)}
              className="p-3 text-left bg-[#18181b] hover:bg-[#202024] border border-[#27272a] hover:border-neutral-700 rounded-md transition-all cursor-pointer group"
            >
              <div className="font-semibold text-xs text-neutral-200 group-hover:text-white truncate">
                {preset.name}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {preset.count} words · {preset.description.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Textarea */}
      <div className="border border-[#27272a] rounded-lg bg-[#121214] overflow-hidden focus-within:border-neutral-500 transition-colors">
        <div className="border-b border-[#27272a] px-4 py-3 flex items-center justify-between text-xs text-neutral-400 bg-[#0e0e10]">
          <div className="flex items-center gap-3">
            <span className="font-medium text-neutral-300">Word Input</span>
            <span>·</span>
            <span className="tabular-nums font-mono text-neutral-400">
              {parsed.items.length} valid {parsed.items.length === 1 ? 'word' : 'words'}
            </span>
            {parsed.errors.length > 0 && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{parsed.errors.length} formatting {parsed.errors.length === 1 ? 'alert' : 'alerts'}</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded cursor-pointer transition-colors">
              <Upload className="w-3 h-3" />
              <span>Import .txt</span>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setRawText('')}
              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={14}
          placeholder="der Vater - Father&#10;die Mutter - Mother&#10;das Kind - Child&#10;das Haus / House&#10;der Hund / Dog"
          className="w-full p-4 bg-transparent text-neutral-200 placeholder-neutral-600 font-mono text-xs sm:text-sm resize-y focus:outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Format Alerts list if any */}
      {showErrors && parsed.errors.length > 0 && (
        <div className="border border-amber-900/40 bg-amber-950/20 rounded-lg p-4 text-xs space-y-2">
          <div className="font-semibold text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Unparsed Lines (Check missing separator like "-" or "/")</span>
          </div>
          <div className="space-y-1 font-mono max-h-36 overflow-y-auto text-amber-200/80">
            {parsed.errors.map((err, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-amber-500 shrink-0">Line {err.line}:</span>
                <span className="truncate">{err.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options and Launch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#27272a]">
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reverseDirection}
              onChange={(e) => setReverseDirection(e.target.checked)}
              className="rounded bg-[#18181b] border-[#3f3f46] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Flip direction (Prompt: Translation → Word)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shuffleInitial}
              onChange={(e) => setShuffleInitial(e.target.checked)}
              className="rounded bg-[#18181b] border-[#3f3f46] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Shuffle initial order</span>
          </label>
        </div>

        <button
          type="button"
          disabled={parsed.items.length === 0}
          onClick={handleStart}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            parsed.items.length > 0
              ? 'bg-white hover:bg-neutral-200 text-black shadow-sm'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          }`}
        >
          <span>Start Learning ({parsed.items.length} {parsed.items.length === 1 ? 'word' : 'words'})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Preview table of parsed vocabulary */}
      {parsed.items.length > 0 && (
        <div className="border border-[#27272a] rounded-lg p-5 bg-[#121214] space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold uppercase tracking-wider text-neutral-300">
              Deck Preview
            </span>
            <span className="font-mono tabular-nums">
              Showing first {Math.min(5, parsed.items.length)} of {parsed.items.length}
            </span>
          </div>
          <div className="divide-y divide-[#27272a] text-xs">
            {parsed.items.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 font-mono">
                <span className="text-neutral-500 w-8">{idx + 1}.</span>
                <span className="text-neutral-200 font-medium flex-1 truncate">
                  {reverseDirection ? item.translation : item.original}
                </span>
                <span className="text-neutral-500 text-center px-2">→</span>
                <span className="text-neutral-400 flex-1 truncate text-right">
                  {reverseDirection ? item.original : item.translation}
                </span>
              </div>
            ))}
          </div>
          {parsed.items.length > 5 && (
            <div className="text-[11px] text-neutral-500 text-center pt-2">
              + {parsed.items.length - 5} more words ready to learn
            </div>
          )}
        </div>
      )}
    </div>
  );
};
