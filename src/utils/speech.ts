export function speakText(text: string, langHint: string = 'de-DE'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for language learners
    utterance.pitch = 1.0;

    // Detect language or hint
    if (langHint) {
      utterance.lang = langHint;
    }

    // Try finding a matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && langHint) {
      const match = voices.find((v) => v.lang.startsWith(langHint.slice(0, 2)));
      if (match) {
        utterance.voice = match;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
