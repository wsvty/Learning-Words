import { WordItem } from '../types.ts';

export interface ParseResult {
  items: WordItem[];
  errors: { line: number; text: string; reason: string }[];
  totalLines: number;
}

export function parseWordList(rawText: string): ParseResult {
  const lines = rawText.split(/\r?\n/);
  const items: WordItem[] = [];
  const errors: { line: number; text: string; reason: string }[] = [];

  const delimiters = [
    ' / ',
    '/',
    ' - ',
    ' – ',
    ' — ',
    '-',
    '–',
    '—',
    '\t',
    ' | ',
    '|',
    ' : ',
  ];

  let validCounter = 0;

  lines.forEach((rawLine, index) => {
    const lineNum = index + 1;
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      return; // Skip empty lines or comment lines
    }

    let original = '';
    let translation = '';
    let matched = false;

    // Try slash first as requested, then hyphen and others
    for (const delim of delimiters) {
      const idx = trimmed.indexOf(delim);
      if (idx !== -1) {
        const left = trimmed.slice(0, idx).trim();
        const right = trimmed.slice(idx + delim.length).trim();

        if (left.length > 0 && right.length > 0) {
          original = left;
          translation = right;
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      validCounter++;
      items.push({
        id: `word_${validCounter}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        original,
        translation,
      });
    } else {
      errors.push({
        line: lineNum,
        text: trimmed,
        reason: 'Missing separator (e.g. "-" or "/") between word and translation.',
      });
    }
  });

  return {
    items,
    errors,
    totalLines: lines.length,
  };
}

export function exportToText(items: WordItem[], delimiter: string = ' - '): string {
  return items.map((item) => `${item.original}${delimiter}${item.translation}`).join('\n');
}
