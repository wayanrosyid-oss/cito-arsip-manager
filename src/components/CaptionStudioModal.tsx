import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Instagram,
  Zap,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { Trip } from '../types';
import {
  generateInstagramFeedCaption,
  generateWhatsAppBroadcastCaption,
  generateStoryQuickCaption,
  HOOK_OPTIONS,
  HookStyle,
  CaptionCustomOptions,
} from '../utils/formatters';

interface CaptionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onShowToast: (msg: string) => void;
  initialMode?: 'instagram' | 'whatsapp' | 'story';
}

export const CaptionStudioModal: React.FC<CaptionStudioModalProps> = ({
  isOpen,
  onClose,
  trip,
  onShowToast,
  initialMode = 'instagram',
}) => {
  const [activeTab, setActiveTab] = useState<'instagram' | 'whatsapp' | 'story'>(initialMode);
  const [hookStyle, setHookStyle] = useState<HookStyle>('yuk_gasss');
  const [includeMepo, setIncludeMepo] = useState(true);
  const [includeFacilities, setIncludeFacilities] = useState(true);
  const [includeSK, setIncludeSK] = useState(true);
  const [includeItinerary, setIncludeItinerary] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Custom text override if user types in the textarea
  const [customText, setCustomText] = useState<string | null>(null);

  // Re-generate text when options change
  const generatedCaption = useMemo(() => {
    const opts: CaptionCustomOptions = {
      hookStyle,
      includeMepo,
      includeFacilities,
      includeSK,
      includeItinerary,
    };

    if (activeTab === 'instagram') {
      return generateInstagramFeedCaption(trip, opts);
    } else if (activeTab === 'whatsapp') {
      return generateWhatsAppBroadcastCaption(trip, opts);
    } else {
      return generateStoryQuickCaption(trip);
    }
  }, [trip, activeTab, hookStyle, includeMepo, includeFacilities, includeSK, includeItinerary]);

  const activeText = customText !== null ? customText : generatedCaption;

  if (!isOpen) return null;

  const handleTabChange = (tab: 'instagram' | 'whatsapp' | 'story') => {
    setActiveTab(tab);
    setCustomText(null); // reset custom edit when switching tabs
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);
      setIsCopied(true);
      onShowToast(
        activeTab === 'instagram'
          ? 'Caption Instagram berhasil disalin!'
          : activeTab === 'whatsapp'
          ? 'Pesan WhatsApp Broadcast berhasil disalin!'
          : 'Format Story singkat berhasil disalin!'
      );
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      onShowToast('Gagal menyalin teks ke clipboard');
    }
  };

  const handleOpenWhatsAppDirect = () => {
    const waNumber = (trip.kontak_wa || '+6282230444428').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(activeText);
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  const handleResetToAuto = () => {
    setCustomText(null);
    onShowToast('Teks dikembalikan ke template otomatis');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#f0f0f0] border-2 border-[#275d1d] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#275d1d] text-white px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-white/15 rounded-lg">
              <Share2 className="w-5 h-5 text-amber-300" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold font-['Space_Grotesk'] truncate">
                Generator Caption & Broadcast Promosi
              </h2>
              <p className="text-[11px] sm:text-xs text-[#d1d1d1] truncate">
                Promosi Instan 1-Klik: 🏔️ {trip.nama_gunung.toUpperCase()} {trip.ketinggian_mdpl || ''} · 📌 {trip.jalur.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-white border-b border-[#275d1d]/20 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('instagram')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeTab === 'instagram'
                ? 'bg-[#275d1d] text-white'
                : 'bg-[#e8e8e8] text-[#275d1d] hover:bg-[#dedede]'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Feed & Reels Instagram</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('whatsapp')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeTab === 'whatsapp'
                ? 'bg-[#275d1d] text-white'
                : 'bg-[#e8e8e8] text-[#275d1d] hover:bg-[#dedede]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Broadcast WhatsApp Grup</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('story')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeTab === 'story'
                ? 'bg-[#275d1d] text-white'
                : 'bg-[#e8e8e8] text-[#275d1d] hover:bg-[#dedede]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Story & Status Singkat</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Customization Controls */}
          <div className="lg:col-span-5 space-y-4">
            {activeTab !== 'story' ? (
              <>
                {/* Hook Selection (Instagram only) */}
                {activeTab === 'instagram' && (
                  <div className="bg-white border-2 border-[#275d1d] rounded-xl p-4 shadow-xs space-y-2.5">
                    <label className="text-xs font-extrabold font-['Space_Grotesk'] text-[#275d1d] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Gaya Hook Pembuka:
                    </label>
                    <div className="space-y-1.5">
                      {HOOK_OPTIONS.map((hook) => (
                        <button
                          key={hook.id}
                          type="button"
                          onClick={() => {
                            setHookStyle(hook.id);
                            setCustomText(null);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            hookStyle === hook.id
                              ? 'bg-[#275d1d]/10 border-[#275d1d] text-[#275d1d]'
                              : 'bg-[#f7f7f7] border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {hook.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Toggles */}
                <div className="bg-white border-2 border-[#275d1d] rounded-xl p-4 shadow-xs space-y-3">
                  <span className="text-xs font-extrabold font-['Space_Grotesk'] text-[#275d1d] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Komponen Informasi:
                  </span>

                  <div className="space-y-2 text-xs font-semibold text-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeMepo}
                        onChange={(e) => {
                          setIncludeMepo(e.target.checked);
                          setCustomText(null);
                        }}
                        className="w-4 h-4 accent-[#275d1d] rounded"
                      />
                      <span>Sertakan Tarif Meeting Point</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeFacilities}
                        onChange={(e) => {
                          setIncludeFacilities(e.target.checked);
                          setCustomText(null);
                        }}
                        className="w-4 h-4 accent-[#275d1d] rounded"
                      />
                      <span>Sertakan Fasilitas Include</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeSK}
                        onChange={(e) => {
                          setIncludeSK(e.target.checked);
                          setCustomText(null);
                        }}
                        className="w-4 h-4 accent-[#275d1d] rounded"
                      />
                      <span>Sertakan Catatan DP & S&K</span>
                    </label>

                    {activeTab === 'instagram' && (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={includeItinerary}
                          onChange={(e) => {
                            setIncludeItinerary(e.target.checked);
                            setCustomText(null);
                          }}
                          className="w-4 h-4 accent-[#275d1d] rounded"
                        />
                        <span>Sertakan Rundown Kegiatan</span>
                      </label>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border-2 border-[#275d1d] rounded-xl p-4 shadow-xs space-y-2 text-xs text-gray-700">
                <span className="font-extrabold text-[#275d1d] block">
                  💡 Format Story & Status Singkat
                </span>
                <p>
                  Didesain padat dan ringkas agar pas dibaca cepat dalam 5-10 detik di Instagram Story atau Status WhatsApp.
                </p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-[#275d1d]/10 border border-[#275d1d]/30 rounded-xl p-3.5 text-[11px] text-[#1a3814] space-y-1">
              <strong className="block font-bold">Tips Promosi Cito Adventure:</strong>
              <p>
                Setelah download pamflet dari Studio Desain, salin caption ini dan langsung paste di Instagram atau sebarkan ke grup alumni pendaki Anda!
              </p>
            </div>
          </div>

          {/* Right Column: Live Caption Preview & Editor */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
            <div className="bg-white border-2 border-[#275d1d] rounded-xl p-4 shadow-xs flex-1 flex flex-col min-h-[360px]">
              <div className="flex items-center justify-between gap-2 border-b border-[#275d1d]/20 pb-2 mb-2">
                <span className="text-xs font-bold text-gray-600">
                  {customText !== null ? '✏️ Mode Edit Manual' : '✨ Template Otomatis Sinkron'}
                </span>

                {customText !== null && (
                  <button
                    type="button"
                    onClick={handleResetToAuto}
                    className="text-[11px] font-bold text-[#275d1d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset ke Otomatis</span>
                  </button>
                )}
              </div>

              {/* Editable Textarea */}
              <textarea
                value={activeText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full flex-1 p-2 font-mono text-xs sm:text-[13px] text-gray-800 leading-relaxed border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#275d1d] resize-none bg-[#fafafa]"
                rows={14}
                placeholder="Teks caption..."
              />

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 font-mono">
                <span>{activeText.length} karakter</span>
                <span>{activeText.split(/\s+/).filter(Boolean).length} kata</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-4 bg-[#275d1d] hover:bg-[#1f4a17] text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Teks Caption'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppDirect}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                title="Buka WhatsApp dengan pesan ini"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Kirim ke WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
