import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Download,
  Image,
  FileText,
  Edit3,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Sliders,
  Layers,
  Trash2,
  Share2,
  Instagram,
  Zap,
} from 'lucide-react';
import { Trip } from '../types';
import {
  formatDateRange,
  generateInstagramFeedCaption,
  generateWhatsAppBroadcastCaption,
  generateStoryQuickCaption,
} from '../utils/formatters';
import { exportTripPamphletPNG, exportItineraryPosterPNG, SlideType } from '../utils/canvasExport';
import { exportTripPDF, exportTripTXT } from '../utils/pdfExport';
import { PamphletStudioModal } from './PamphletStudioModal';
import { CaptionStudioModal } from './CaptionStudioModal';
import { getTripMediaKitUrl } from '../utils/slug';

interface TripDetailProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onOpenItinerary: (trip: Trip) => void;
  onShowToast: (msg: string) => void;
  onSaveTrip?: (updatedTrip: Trip) => void;
  onOpenMediaKit?: (trip: Trip) => void;
  onCopyMediaKitLink?: (trip: Trip) => void;
}

export const TripDetail: React.FC<TripDetailProps> = ({
  trip,
  onEdit,
  onDelete,
  onOpenItinerary,
  onShowToast,
  onSaveTrip,
  onOpenMediaKit,
  onCopyMediaKitLink,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialSlide, setStudioInitialSlide] = useState<SlideType>('cover');
  const [isCaptionStudioOpen, setIsCaptionStudioOpen] = useState(false);
  const [activeCaptionTab, setActiveCaptionTab] = useState<'instagram' | 'whatsapp' | 'story'>('instagram');

  const previewCaptionText = useMemo(() => {
    if (activeCaptionTab === 'instagram') {
      return generateInstagramFeedCaption(trip);
    } else if (activeCaptionTab === 'whatsapp') {
      return generateWhatsAppBroadcastCaption(trip);
    } else {
      return generateStoryQuickCaption(trip);
    }
  }, [trip, activeCaptionTab]);

  const isBuka = trip.status === 'Buka';
  const dateRange = formatDateRange(trip.tanggal_mulai, trip.tanggal_selesai) || 'Jadwal Terbuka';

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(previewCaptionText);
      setCopiedCaption(true);
      onShowToast(
        activeCaptionTab === 'instagram'
          ? 'Caption Instagram berhasil disalin!'
          : activeCaptionTab === 'whatsapp'
          ? 'Pesan WhatsApp Broadcast berhasil disalin!'
          : 'Format Story singkat berhasil disalin!'
      );
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      onShowToast('Gagal menyalin teks');
    }
  };

  const handleOpenWhatsApp = () => {
    const waNumber = (trip.kontak_wa || '+6282230444428').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(previewCaptionText);
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  const handleExportPamphlet = async (ratio: '4:5' | '9:16') => {
    setIsExporting(`pamflet-${ratio}`);
    onShowToast(`Membuat pamflet trip (${ratio})...`);
    try {
      await exportTripPamphletPNG(trip, ratio);
      onShowToast(`Pamflet Trip (${ratio}) berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal membuat pamflet trip');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportItineraryPoster = async (ratio: '4:5' | '9:16') => {
    setIsExporting(`itin-${ratio}`);
    onShowToast(`Membuat poster itinerary (${ratio})...`);
    try {
      await exportItineraryPosterPNG(trip, ratio);
      onShowToast(`Poster Itinerary (${ratio}) berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal membuat poster itinerary');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    try {
      exportTripPDF(trip);
      onShowToast('Arsip PDF berhasil diunduh');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal mengekspor PDF');
    }
  };

  const handleExportTXT = () => {
    try {
      exportTripTXT(trip);
      onShowToast('Arsip TXT berhasil diunduh');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal mengekspor TXT');
    }
  };

  return (
    <motion.div
      key={trip.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-5"
    >
      {/* Top Banner & Heading */}
      <div className="field-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge Kesiapan: Draft vs Final */}
              {trip.is_draft ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  Draft
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Final
                </span>
              )}

              {/* Badge Sumber Pembuat: Tim vs Admin */}
              {trip.from_team ? (
                <span className="inline-flex items-center text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
                  Tim {trip.draf_oleh ? `(${trip.draf_oleh})` : ''}
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-medium text-stone-700 bg-stone-100 border border-stone-200/50 px-2 py-0.5 rounded">
                  Admin
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200/50">
                <span className={`w-1.5 h-1.5 rounded-full ${isBuka ? 'bg-emerald-600' : 'bg-stone-500'}`} />
                Status: {trip.status}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/50">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                {trip.jalur}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 leading-tight">
                {trip.nama_gunung} {trip.ketinggian_mdpl ? trip.ketinggian_mdpl : ''}
              </h2>
              <p className="text-sm text-stone-600 mt-1 leading-normal">
                Jalur Pendakian: <span className="font-medium text-stone-800">{trip.jalur}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            {trip.is_draft ? (
              <button
                onClick={() => {
                  const approved = {
                    ...trip,
                    is_draft: false,
                    from_team: trip.from_team === true,
                    updated_at: Date.now(),
                  };
                  onSaveTrip?.(approved);
                  const authorLabel = trip.from_team ? 'Draf Tim' : 'Draf Admin';
                  onShowToast(`${authorLabel} ${trip.nama_gunung} resmi diterbitkan ke FINAL (Siap Promosi)!`);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#183e15] hover:bg-[#122f10] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-98 transition-colors cursor-pointer"
                title="Klik untuk mengubah status trip menjadi Final (Siap Upload)"
              >
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Terbitkan Final</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  const toDraft = {
                    ...trip,
                    is_draft: true,
                    from_team: trip.from_team === true,
                    updated_at: Date.now(),
                  };
                  onSaveTrip?.(toDraft);
                  onShowToast(`Trip ${trip.nama_gunung} dikembalikan ke DRAFT.`);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-medium transition-colors cursor-pointer"
                title="Klik jika ingin membatalkan status final dan mengedit ulang data ini sebagai Draf"
              >
                <span>Ubah ke Draft</span>
              </button>
            )}
            <button
              onClick={() => {
                if (onOpenMediaKit) {
                  onOpenMediaKit(trip);
                } else {
                  window.open(getTripMediaKitUrl(trip), '_blank');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-amber-300 text-xs sm:text-sm font-medium shadow-xs active:scale-98 transition-colors cursor-pointer"
              title="Pratinjau Media Kit sebelum kirim link ke tim"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Media Kit</span>
            </button>
            <button
              onClick={() => {
                if (onCopyMediaKitLink) {
                  onCopyMediaKitLink(trip);
                } else {
                  const url = getTripMediaKitUrl(trip);
                  navigator.clipboard.writeText(url).then(() => {
                    onShowToast('Link Media Kit berhasil disalin ke clipboard.');
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="Salin Link Media Kit untuk tim"
            >
              <Share2 className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Salin Link</span>
            </button>
            <button
              onClick={() => onEdit(trip)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#183e15] hover:bg-[#122f10] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-98 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-white" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(trip)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="Hapus trip ini"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        {/* Draft Notice Banner */}
        {trip.is_draft && (
          <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-amber-900">
              <span className="font-semibold">Catatan Tim:</span> Diinput oleh {trip.draf_oleh || 'Tim Cito'}.
              {trip.draf_catatan && <span className="block text-amber-800 mt-0.5 italic">"{trip.draf_catatan}"</span>}
            </div>
            <button
              onClick={() => {
                const approved = { ...trip, is_draft: false, from_team: true, updated_at: Date.now() };
                onSaveTrip?.(approved);
                onShowToast(`Trip ${trip.nama_gunung} resmi disetujui.`);
              }}
              className="px-3 py-1.5 bg-[#183e15] hover:bg-[#122f10] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Setujui Sekarang
            </button>
          </div>
        )}

        {/* Flattened Quick Meta Grid (No cards inside cards) */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 border-t border-stone-200 pt-4">
          <div className={`py-2 sm:py-0 sm:px-3 first:pl-0 ${trip.jadwal_tambahan && trip.jadwal_tambahan.length > 0 ? 'sm:col-span-2' : ''}`}>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Jadwal Pelaksanaan
            </span>

            {trip.jadwal_tambahan && trip.jadwal_tambahan.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-800">
                  <span className="text-[#183e15]">•</span>
                  <span>{dateRange}</span>
                </div>
                {trip.jadwal_tambahan.map((sch, i) => (
                  <div key={sch.id || i} className="flex items-center gap-2 text-xs font-medium text-stone-800">
                    <span className="text-[#183e15]">•</span>
                    <span>{formatDateRange(sch.tanggal_mulai, sch.tanggal_selesai)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-stone-900 mt-1">
                {dateRange}
              </p>
            )}
          </div>

          {(!trip.jadwal_tambahan || trip.jadwal_tambahan.length === 0) && (
            <div className="py-2 sm:py-0 sm:px-3">
              <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> Durasi
              </span>
              <p className="text-sm font-semibold text-stone-900 mt-1">
                {trip.durasi}
              </p>
            </div>
          )}

          <div className="py-2 sm:py-0 sm:px-3 last:pr-0">
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-400" /> Target Kuota Peserta
            </span>
            <p className="text-sm font-semibold text-stone-900 mt-1">
              {trip.min_peserta || '7'} / {trip.max_peserta || '20'} Pax
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
              Min Madiun: {trip.min_peserta || '7'} | Min Jakarta: {trip.min_peserta_jakarta || trip.min_peserta || '7'} | Maks: {trip.max_peserta || '20'} Pax
            </p>
          </div>
        </div>
      </div>

      {/* Export Action Section (Flat layout, clean typography) */}
      <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-stone-600" />
              Pusat Ekspor Media & Dokumen
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              Unduh pamflet resmi Cito Adventure atau arsip dokumen teks dan PDF.
            </p>
          </div>

          <button
            onClick={() => {
              setStudioInitialSlide('cover');
              setIsStudioOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-[#183e15] hover:bg-[#122f10] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs active:scale-98 transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Studio Desain Pamflet</span>
          </button>
        </div>

        {/* Flat 3-column export tools without nested inset cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Export Pamflet Cover */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-stone-500" />
                Pamflet Cover & Slide Utama
              </span>
              <p className="text-xs text-stone-600 leading-relaxed">
                Poster promosi dengan logo resmi, judul gunung, harga meeting point, dan kontak.
              </p>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPamphlet('4:5')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300/80 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                >
                  <span>4:5 Feed</span>
                </button>
                <button
                  onClick={() => handleExportPamphlet('9:16')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-[#183e15] hover:bg-[#122f10] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                >
                  <span>9:16 Story</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setStudioInitialSlide('cover');
                  setIsStudioOpen(true);
                }}
                className="w-full py-1 text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" /> Ganti Background & Preview
              </button>
            </div>
          </div>

          {/* Export Itinerary Poster */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-stone-500" />
                Poster Rundown Itinerary
              </span>
              <p className="text-xs text-stone-600 leading-relaxed">
                Poster rundown kegiatan per hari dan jam timeline dalam format visual.
              </p>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportItineraryPoster('4:5')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300/80 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                >
                  <span>4:5 Feed</span>
                </button>
                <button
                  onClick={() => handleExportItineraryPoster('9:16')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-[#183e15] hover:bg-[#122f10] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                >
                  <span>9:16 Story</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setStudioInitialSlide('itinerary');
                  setIsStudioOpen(true);
                }}
                className="w-full py-1 text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center justify-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" /> Buka di Studio Pamflet
              </button>
            </div>
          </div>

          {/* Export Dokumen PDF & TXT */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-stone-500" />
                Dokumen Arsip Cetak
              </span>
              <p className="text-xs text-stone-600 leading-relaxed">
                Simpan ringkasan lengkap data trip ke berkas PDF atau teks murni (.TXT).
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportPDF}
                className="flex-1 py-1.5 px-2 bg-[#183e15] hover:bg-[#122f10] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
              >
                <span>Unduh PDF</span>
              </button>
              <button
                onClick={handleExportTXT}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300/80 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
              >
                <span>Unduh TXT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Caption & Broadcast Marketing Generator Box */}
      <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-stone-600" />
              Generator Caption & Broadcast Promosi
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              Format teks promosi siap pakai untuk Instagram, pesan siaran WhatsApp, atau Story.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsCaptionStudioOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Buka Generator Lengkap</span>
            </button>

            <button
              onClick={handleCopyCaption}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#183e15] hover:bg-[#122f10] text-white text-xs font-semibold transition-colors cursor-pointer active:scale-98"
            >
              {copiedCaption ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
              <span>{copiedCaption ? 'Tersalin' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer active:scale-98"
              title="Buka WhatsApp langsung dengan teks ini"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white" />
              <span>Buka WA</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200 overflow-x-auto">
          <button
            onClick={() => setActiveCaptionTab('instagram')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCaptionTab === 'instagram'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-rose-600" />
            <span>Feed & Reels</span>
          </button>

          <button
            onClick={() => setActiveCaptionTab('whatsapp')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCaptionTab === 'whatsapp'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Broadcast</span>
          </button>

          <button
            onClick={() => setActiveCaptionTab('story')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCaptionTab === 'story'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Story Singkat</span>
          </button>
        </div>

        {/* Text Preview Box */}
        <div className="rounded-xl p-4 border border-stone-200 bg-stone-50/60 font-mono text-xs text-stone-800 font-medium leading-relaxed whitespace-pre-wrap select-all max-h-64 overflow-y-auto">
          {previewCaptionText}
        </div>
      </div>

      {/* Meeting Point & Pricing */}
      <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-stone-900">
          Tarif per Meeting Point (MEPO)
        </h3>
        {trip.harga_mepo && trip.harga_mepo.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {trip.harga_mepo.map((m, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-stone-200 bg-stone-50/40 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-800">{m.lokasi || 'Meeting Point'}</span>
                <span className="text-xs sm:text-sm font-semibold text-[#183e15]">
                  {m.harga || '-'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 leading-relaxed">Belum ada data tarif meeting point.</p>
        )}
      </div>

      {/* Include & Exclude Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Include */}
        <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#183e15]" />
            Fasilitas Termasuk (Include)
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-800">
            {(trip.include || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[#183e15] font-semibold mt-0.5">✓</span>
                <span className="text-stone-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclude */}
        <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            Tidak Termasuk (Exclude)
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-800">
            {(trip.exclude || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-rose-600 font-semibold mt-0.5">✕</span>
                <span className="text-stone-700">{item}</span>
              </li>
            ))}
          </ul>
          {trip.extra_porter && (
            <div className="pt-2.5 border-t border-stone-200 text-xs text-stone-700 font-medium leading-relaxed">
              Extra Porter: {trip.extra_porter}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary Preview & Action */}
      <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-stone-600" />
            Rundown & Itinerary Kegiatan
          </h3>
          <button
            onClick={() => onOpenItinerary(trip)}
            className="text-xs font-semibold text-[#183e15] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Editor & Poster</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#183e15]" />
          </button>
        </div>

        <div className="rounded-xl p-4 border border-stone-200 bg-stone-50/50 font-mono text-xs text-stone-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
          {trip.itinerary || 'Belum ada rundown itinerary.'}
        </div>
      </div>

      {/* S&K & Catatan Penting */}
      <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
        {trip.sk_berlaku && trip.sk_berlaku.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-stone-900">
              Syarat & Ketentuan (S&K)
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700">
              {trip.sk_berlaku.map((sk, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#183e15] font-semibold mt-0.5">•</span>
                  <span>{sk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {trip.catatan_penting && (
          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/60 text-xs text-stone-700 leading-relaxed">
            <strong className="block text-stone-900 mb-1 font-semibold text-xs sm:text-sm">Catatan Penting:</strong>
            {trip.catatan_penting}
          </div>
        )}
      </div>

      {/* Contact & Social Settings */}
      <div className="field-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-stone-600" />
              Nomor Kontak Admin
            </h4>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              Nomor WhatsApp dan Instagram tercetak otomatis pada pamflet dan materi promosi.
            </p>
          </div>
          <button
            onClick={() => onEdit(trip)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            title="Ubah nomor kontak WhatsApp atau akun Instagram untuk trip ini"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Kontak
          </button>
        </div>

        {/* Flattened Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/40">
            <span className="block text-xs font-medium text-stone-500">
              Admin Jatim & Jateng
            </span>
            <span className="text-sm sm:text-base font-semibold text-stone-900 mt-1 block">
              {trip.kontak_wa_jatim || '+6282230444428'}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">Tercetak di Pamflet & Caption</span>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/40">
            <span className="block text-xs font-medium text-stone-500">
              Admin Jakarta & Sekitarnya
            </span>
            <span className="text-sm sm:text-base font-semibold text-stone-900 mt-1 block">
              {trip.kontak_wa_jakarta || '+6289503689266'}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">Tercetak di Pamflet & Caption</span>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/40">
            <span className="block text-xs font-medium text-stone-500">
              Akun Instagram Resmi
            </span>
            <span className="text-sm sm:text-base font-semibold text-stone-900 mt-1 block">
              {trip.kontak_ig || '@citoadventuremadiun'}
            </span>
            <span className="text-[11px] text-stone-400 mt-0.5 block">Tercetak di Bar Booking Pamflet</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-stone-500">
          <span>Perubahan kontak akan langsung diterapkan ke generator pamflet dan caption.</span>
          <span>Terakhir diperbarui: {new Date(trip.updated_at).toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      {/* Studio Pamflet & Carousel Modal */}
      <PamphletStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        trip={trip}
        onSaveTrip={onSaveTrip}
        onShowToast={onShowToast}
        initialSlide={studioInitialSlide}
      />

      {/* Caption & Broadcast Marketing Studio Modal */}
      {isCaptionStudioOpen && (
        <CaptionStudioModal
          isOpen={isCaptionStudioOpen}
          onClose={() => setIsCaptionStudioOpen(false)}
          trip={trip}
          onShowToast={onShowToast}
          initialMode={activeCaptionTab}
        />
      )}
    </motion.div>
  );
};
