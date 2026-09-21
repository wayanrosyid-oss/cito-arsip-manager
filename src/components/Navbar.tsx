import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Github,
  DownloadCloud,
  Camera,
  RefreshCw,
  Link2,
  Bell,
  Users,
  Key,
  Lock,
  MoreHorizontal,
  Smartphone,
} from 'lucide-react';
import { downloadProjectZip } from '../utils/projectZip';
import { getCustomLogo, setCustomLogo, clearCustomLogo, OFFICIAL_LOGO_URL } from '../utils/storage';
import { optimizeLogoImage } from '../utils/imageOptimizer';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenGithubGuide: () => void;
  tripCount: number;
  draftCount?: number;
  onScrollToDrafts?: () => void;
  adminDraftCount?: number;
  onScrollToAdminDrafts?: () => void;
  cloudStatus?: 'synced' | 'syncing' | 'offline';
  onOpenCloudSync?: () => void;
  onCopyTeamLink?: () => void;
  onCopyAdminKeyLink?: () => void;
  onLockToTeamMode?: () => void;
  onOpenTeamMode?: () => void;
  onOpenTeamData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenGithubGuide,
  tripCount,
  draftCount = 0,
  onScrollToDrafts,
  adminDraftCount = 0,
  onScrollToAdminDrafts,
  cloudStatus = 'synced',
  onOpenCloudSync,
  onCopyTeamLink,
  onCopyAdminKeyLink,
  onLockToTeamMode,
  onOpenTeamMode,
  onOpenTeamData,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(getCustomLogo() || OFFICIAL_LOGO_URL);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const updateLogo = () => {
      const custom = getCustomLogo();
      if (custom) {
        setLogoSrc(custom);
        setIsCustom(true);
      } else {
        setLogoSrc(OFFICIAL_LOGO_URL);
        setIsCustom(false);
      }
    };

    updateLogo();
    window.addEventListener('cito_logo_updated', updateLogo);
    return () => window.removeEventListener('cito_logo_updated', updateLogo);
  }, []);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

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

      await fetch('/api/save-permanent-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: optimized }),
      }).catch((err) => {
        console.warn('Could not write permanent logo to server disk:', err);
      });
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
    <header className="bg-[#183e15] border-b border-[#122f10] text-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer shrink-0"
            title="Klik untuk ganti logo resmi Cito Adventure"
          >
            <img
              src={logoSrc}
              alt="Logo Cito Adventure Madiun"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>

            {isCustom && (
              <button
                type="button"
                onClick={handleResetLogo}
                className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs cursor-pointer"
                title="Reset logo ke bawaan"
              >
                ×
              </button>
            )}
          </div>

          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-white/70 block leading-tight font-medium truncate">
              Cito Adventure Madiun
            </span>
            <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-tight whitespace-nowrap">
              Cito Trip Manager
            </h1>
          </div>
        </div>

        {/* Right: Focused Primary Actions & Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cloud Sync Status */}
          <button
            type="button"
            onClick={onOpenCloudSync}
            className={`inline-flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto px-0 sm:px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
              cloudStatus === 'synced'
                ? 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                : cloudStatus === 'syncing'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                : 'bg-stone-800/40 text-stone-300 border-stone-600/30'
            }`}
            title="Status Sinkronisasi Cloud"
          >
            {cloudStatus === 'synced' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Tersinkron</span>
              </>
            )}
            {cloudStatus === 'syncing' && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Sinkron...</span>
              </>
            )}
            {cloudStatus === 'offline' && (
              <>
                <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Offline</span>
              </>
            )}
          </button>

          {/* Draf Tim Notification Pill */}
          {draftCount > 0 && (
            <button
              type="button"
              onClick={onScrollToDrafts}
              className="inline-flex items-center gap-1 h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
              title={`${draftCount} draf trip dari tim menunggu verifikasi`}
            >
              <Bell className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{draftCount} Draf</span>
            </button>
          )}

          {/* Admin Draft Notification Pill */}
          {adminDraftCount > 0 && (
            <button
              type="button"
              onClick={onScrollToAdminDrafts}
              className="inline-flex items-center gap-1 h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
              title={`${adminDraftCount} trip berstatus draf`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <span>{adminDraftCount} Draf</span>
            </button>
          )}

          {/* More Options Dropdown */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors cursor-pointer shrink-0"
              title="Menu Opsi Tambahan"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-stone-800 text-xs font-medium divide-y divide-stone-100">
                <div className="py-1">
                  {onOpenTeamData && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenTeamData();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-stone-700"
                    >
                      <Users className="w-4 h-4 text-stone-500" />
                      <span>Data Anggota Tim</span>
                    </button>
                  )}

                  {onCopyTeamLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onCopyTeamLink();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-stone-700"
                    >
                      <Link2 className="w-4 h-4 text-stone-500" />
                      <span>Salin Link Tim Lapangan</span>
                    </button>
                  )}

                  {onCopyAdminKeyLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onCopyAdminKeyLink();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-stone-700"
                    >
                      <Key className="w-4 h-4 text-stone-500" />
                      <span>Salin Kunci Akses Admin</span>
                    </button>
                  )}

                  {onLockToTeamMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLockToTeamMode();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-stone-700"
                    >
                      <Lock className="w-4 h-4 text-stone-500" />
                      <span>Kunci ke Mode Tim</span>
                    </button>
                  )}
                </div>

                <div className="py-1">
                  {isInstallable && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleInstallPWA();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-emerald-700 font-semibold"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Install Aplikasi (PWA)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-stone-700"
                  >
                    <Camera className="w-4 h-4 text-stone-500" />
                    <span>Ganti Logo Resmi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      downloadProjectZip();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-stone-700"
                  >
                    <DownloadCloud className="w-4 h-4 text-stone-500" />
                    <span>Download Backup ZIP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenGithubGuide();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2.5 text-stone-700"
                  >
                    <Github className="w-4 h-4 text-stone-500" />
                    <span>Panduan GitHub</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button: Tambah Trip */}
          <button
            id="add-trip-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1 h-8 px-2.5 sm:px-3.5 rounded-lg text-xs sm:text-sm font-semibold bg-white text-[#183e15] hover:bg-stone-100 transition-colors shadow-xs cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#183e15] shrink-0" />
            <span className="hidden sm:inline">Tambah Trip</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>
    </header>
  );
};

