export interface WordItem {
  id: string;
  original: string;
  translation: string;
  notes?: string;
}

export type StudyMode = 'load' | 'learn' | 'round-summary' | 'test' | 'test-result';

export interface LearnState {
  round: number;
  currentQueue: string[]; // word IDs in order for current round
  currentIndex: number;
  knownWordIds: string[]; // IDs mastered so far
  unknownWordIds: string[]; // IDs marked 'Don't know' in this round
  revealed: boolean;
  history: {
    wordId: string;
    round: number;
    knew: boolean;
    timestamp: number;
  }[];
}

export interface TestAnswer {
  wordId: string;
  original: string;
  translation: string;
  userAnswer?: string;
  isCorrect: boolean;
}

export interface TestState {
  testQueue: string[];
  currentIndex: number;
  revealed: boolean;
  answers: TestAnswer[];
  inputMode: 'self' | 'type';
  testStartTime: number;
}
