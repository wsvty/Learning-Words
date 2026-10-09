# LexiLoop - Minimalist Vocabulary Flashcard & Retention Trainer

A dark-mode vocabulary memorization web app designed to run locally on your laptop or upload directly to GitHub Pages.

## Features
- **Load up to 500+ words**: Supports delimiters such as `-` or `/` (e.g. `der Vater - Father` or `der Vater / Father`).
- **Iterative Learning Stack**:
  1. Displays the word in the center of the screen.
  2. If you click **I Know** (Key `1` or `Enter`), the word moves to your Mastered list.
  3. If you click **Don't Know** (Key `2` or `Space`), the card immediately reveals its translation with the original word, and marks it into your practice stack.
  4. When the round stack ends, LexiLoop repeats the cycle asking **ONLY the unmastered words**.
  5. The cycle repeats until there is no word left that you don't know!
- **95% Retention Exam**:
  - Automatically tests all original words after learning is complete.
  - If your score is less than 95%, it states **"You Failed"** and lists every missed word so you can retrain them with one click.
  - If score $\ge$ 95%, you **Passed**!
- **Minimalist Dark Mode**: Pure obsidian dark theme, fluid typography, high optical contrast, zero clutter.
- **Audio Pronunciation**: Built-in native browser speech pronunciation for your words (Key `P`).
- **Keyboard Shortcuts**:
  - `[1]` / `[K]` / `[→]`: I Know
  - `[2]` / `[D]` / `[←]`: Don't Know / Reveal
  - `[Space]` / `[Enter]`: Next Word / Reveal
  - `[P]`: Audio Pronounce

## Running on your Laptop

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Uploading to GitHub / GitHub Pages

This app is built purely with standard React, Tailwind CSS, and HTML/JS with no server or database requirement.

1. Build static production assets:
   ```bash
   npm run build
   ```
   This generates the pure HTML, CSS, and JS bundle in the `dist` folder.

2. Push this repository to your GitHub account and enable **GitHub Pages** from `dist` (or via GitHub Actions).
