import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { MonitorDown, Download, Check, X, HelpCircle, Laptop } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running as standalone desktop app, show a small badge or hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Install as desktop application on your PC"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-[#18181b] hover:bg-[#202024] border border-[#27272a] hover:border-neutral-700 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0"
      >
        <MonitorDown className="w-3.5 h-3.5 text-emerald-400" />
        <span>Install PC App</span>
      </button>

      {/* Guide Modal for Desktop / EXE installation */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-[#121214] border border-[#27272a] p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Run as Windows Desktop App</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed font-sans">
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-lg space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">Option 1:</span> Instant 1-Click Desktop App (Zero downloads)
                </div>
                <p className="text-neutral-400">
                  In Google Chrome or Microsoft Edge on your PC:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-300 font-mono text-[11px] pl-1">
                  <li>Look at your browser address bar on the right side.</li>
                  <li>Click the <strong>Install icon</strong> (computer with down arrow) or click the 3 dots menu.</li>
                  <li>Select <strong>"Install LexiLoop"</strong> (or "Apps" → "Install this site as an app").</li>
                  <li>Windows will immediately create an executable app shortcut on your Desktop and Start menu that runs completely standalone without any browser bars!</li>
                </ol>
              </div>

              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-lg space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">Option 2:</span> Standalone .EXE via Electron
                </div>
                <p className="text-neutral-400">
                  This repository has an automated GitHub Actions builder that compiles a standalone <code>LexiLoop-Setup.exe</code> file directly from your GitHub repository releases!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
