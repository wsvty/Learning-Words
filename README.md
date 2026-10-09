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

## Running as a Desktop App / .EXE on your PC

### Method 1: Instant 1-Click Desktop App (Easiest & Fastest — No downloads required)
The app is now an installable Progressive Web App (PWA):
1. Open your published GitHub Pages link (or `http://localhost:3000`) in **Google Chrome** or **Microsoft Edge**.
2. Click the **"Install PC App"** button in the top navigation bar (or click the install icon in your browser address bar).
3. Click **Install**.
4. Windows will create a native application shortcut on your **Desktop** and **Start Menu**. It opens in its own window as a real desktop program with full offline capabilities!

---

### Method 2: Download a Standalone `.exe` via GitHub Actions
We configured an automated Windows build workflow (`.github/workflows/build-exe.yml`):
1. In your GitHub repository, click the **Actions** tab at the top.
2. Select **"Build Windows EXE"** on the left menu.
3. Click the **Run workflow** button on the right.
4. When it finishes (~2 minutes), click on the completed run and download **`LexiLoop-Windows-EXE`**.
5. Inside the ZIP file, you will find `LexiLoop Setup.exe` and `LexiLoop.exe` ready to run on any Windows PC!
