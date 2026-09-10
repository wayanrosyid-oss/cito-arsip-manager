import React, { useState, useEffect, useRef } from 'react';
import { Plus, Archive, Github, DownloadCloud, Camera, RotateCcw } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { downloadProjectZip } from '../utils/projectZip';
import { getCustomLogo, setCustomLogo, clearCustomLogo } from '../utils/storage';
import { optimizeLogoImage } from '../utils/imageOptimizer';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenGithubGuide: () => void;
  tripCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenGithubGuide,
  tripCount,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateLogo = () => {
      const custom = getCustomLogo();
      if (custom) {
        setLogoSrc(custom);
        setIsCustom(true);
      } else {
        setLogoSrc('/logo.png');
        setIsCustom(false);
      }
    };

    updateLogo();
    window.addEventListener('cito_logo_updated', updateLogo);
    return () => window.removeEventListener('cito_logo_updated', updateLogo);
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar valid (PNG, JPG, WebP)');
      return;
    }

    try {
      const optimized = await optimizeLogoImage(file);
      setCustomLogo(optimized);
    } catch (err) {
      console.error('Failed to process logo', err);
      alert('Gagal memproses gambar logo');
    } finally {
      e.target.value = '';
    }
  };

  const handleResetLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Kembalikan logo ke logo bawaan?')) {
      clearCustomLogo();
    }
  };

  return (
    <header className="bg-[#275d1d] border-b-2 border-[#1e4916] text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Brand with interactive Cito Adventure logo upload */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
            title="Klik untuk ganti logo Cito Adventure"
          >
            <img
              src={logoSrc}
              alt="Logo Cito Adventure Madiun"
              className="w-12 h-12 sm:w-13 sm:h-13 object-contain drop-shadow-md shrink-0 transition-transform group-hover:scale-105"
            />
            {/* Hover Camera Overlay */}
            <div className="absolute inset-0 bg-black/55 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white drop-shadow" />
            </div>

            {/* Custom Logo Badge & Reset */}
            {isCustom && (
              <button
                type="button"
                onClick={handleResetLogo}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[9px] shadow-sm cursor-pointer"
                title="Reset logo ke bawaan"
              >
                ×
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-white/90 uppercase font-['Space_Grotesk']">
                Cito Adventure Madiun
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-medium cursor-pointer transition-colors"
                title="Klik untuk unggah logo resmi"
              >
                {isCustom ? 'Logo Kustom Aktif' : 'Ganti Logo'}
              </button>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] tracking-tight text-white leading-tight">
              Arsip Trip & Generator Konten
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <PWAInstallButton />

          <button
            id="download-zip-btn"
            onClick={downloadProjectZip}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 transition-colors cursor-pointer"
            title="Download seluruh source code aplikasi dalam format .ZIP"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-white" />
            <span>Unduh File ZIP</span>
          </button>

          <button
            id="github-guide-btn"
            onClick={onOpenGithubGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 transition-colors cursor-pointer"
            title="Panduan push ke Repository GitHub"
          >
            <Github className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Repo GitHub</span>
          </button>

          <button
            id="add-trip-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs sm:text-sm font-extrabold bg-white hover:bg-[#f0f0f0] text-[#275d1d] transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#275d1d]" />
            <span>Tambah Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};
