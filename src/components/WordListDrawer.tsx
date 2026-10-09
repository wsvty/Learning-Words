import React, { useState } from 'react';
import { WordItem } from '../types.ts';
import { exportToText } from '../utils/parser.ts';
import { X, Search, Download, Trash2, Plus, Volume2 } from 'lucide-react';
import { speakText } from '../utils/speech.ts';

interface WordListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordItem[];
  knownIds: string[];
  onUpdateWords: (newWords: WordItem[]) => void;
}

export const WordListDrawer: React.FC<WordListDrawerProps> = ({
  isOpen,
  onClose,
  words,
  knownIds,
  onUpdateWords,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'known' | 'learning'>('all');
  const [newOriginal, setNewOriginal] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const knownSet = new Set(knownIds);

  const filteredWords = words.filter((item) => {
    const matchesSearch =
      item.original.toLowerCase().includes(search.toLowerCase()) ||
      item.translation.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'known') return knownSet.has(item.id);
    if (filter === 'learning') return !knownSet.has(item.id);
    return true;
  });

  const handleDownload = () => {
    const text = exportToText(words, ' - ');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lexiloop_vocabulary_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    onUpdateWords(words.filter((w) => w.id !== id));
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOriginal.trim() || !newTranslation.trim()) return;

    const newItem: WordItem = {
      id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      original: newOriginal.trim(),
      translation: newTranslation.trim(),
    };

    onUpdateWords([newItem, ...words]);
    setNewOriginal('');
    setNewTranslation('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-lg bg-[#0e0e11] border-l border-[#27272a] h-full flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Active Vocabulary Deck</h2>
            <div className="text-xs text-neutral-400 font-mono">
              {words.length} Total · {knownIds.length} Mastered · {words.length - knownIds.length} In Progress
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-[#1f1f23] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Filter & Quick Actions */}
        <div className="p-4 border-b border-[#27272a] space-y-3 bg-[#121215]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words or translations..."
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-md border border-[#27272a] text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({words.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('known')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filter === 'known' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mastered ({knownIds.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('learning')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filter === 'learning' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Practice ({words.length - knownIds.length})
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                title="Add Word"
                className="p-1.5 bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                title="Export .txt"
                className="p-1.5 bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Add Form */}
          {isAdding && (
            <form onSubmit={handleAddWord} className="pt-2 border-t border-[#27272a] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Word (e.g. der Tisch)"
                  value={newOriginal}
                  onChange={(e) => setNewOriginal(e.target.value)}
                  className="bg-[#18181b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Translation (Table)"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  className="bg-[#18181b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newOriginal.trim() || !newTranslation.trim()}
                  className="px-3 py-1 bg-white disabled:bg-neutral-800 text-black text-xs font-semibold rounded cursor-pointer"
                >
                  Save Word
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Words List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#27272a] text-xs font-mono">
          {filteredWords.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No words match the selected filter.
            </div>
          ) : (
            filteredWords.map((item, idx) => {
              const isKnown = knownSet.has(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#141418] transition-colors group"
                >
                  <span className="text-neutral-600 w-8 tabular-nums">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-200 font-semibold truncate flex items-center gap-2">
                      <span>{item.original}</span>
                      <button
                        type="button"
                        onClick={() => speakText(item.original)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white transition-opacity cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-neutral-400 text-[11px] truncate mt-0.5">
                      {item.translation}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        isKnown ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      {isKnown ? 'Mastered' : 'Practice'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-rose-400 transition-opacity p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
