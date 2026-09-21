import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / Edge / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-xs md:text-sm font-semibold text-[#275d1d] border border-stone-200/80 shadow-xs hover:bg-[#f0f0f0] active:scale-98 transition-all cursor-pointer"
        title="Install Aplikasi Cito Adventure ke HP / Desktop"
      >
        <Download className="w-4 h-4 text-[#275d1d]" />
        <span>Install PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-white" />
          <span>Install di iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-white border border-stone-200 p-6 shadow-xl text-stone-900">
              <div className="flex items-center justify-between mb-3 border-b pb-2 border-stone-200">
                <h3 className="text-base font-semibold tracking-tight text-stone-900">Install di iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed space-y-2">
                1. Buka website ini di <strong>Safari</strong>.<br />
                2. Ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah browser.<br />
                3. Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#275d1d] py-2 text-xs font-semibold text-white border border-[#1f4a17] shadow-xs hover:bg-[#1f4a17] active:scale-98 transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
