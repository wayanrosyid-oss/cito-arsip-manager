import React, { useState } from 'react';
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
} from 'lucide-react';
import { Trip } from '../types';
import { formatDateRange, generateInstagramCaption } from '../utils/formatters';
import { exportTripPamphletPNG, exportItineraryPosterPNG, SlideType } from '../utils/canvasExport';
import { exportTripPDF, exportTripTXT } from '../utils/pdfExport';
import { PamphletStudioModal } from './PamphletStudioModal';

interface TripDetailProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onOpenItinerary: (trip: Trip) => void;
  onShowToast: (msg: string) => void;
  onSaveTrip?: (updatedTrip: Trip) => void;
}

export const TripDetail: React.FC<TripDetailProps> = ({
  trip,
  onEdit,
  onOpenItinerary,
  onShowToast,
  onSaveTrip,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialSlide, setStudioInitialSlide] = useState<SlideType>('cover');

  const captionText = generateInstagramCaption(trip);
  const isBuka = trip.status === 'Buka';
  const dateRange = formatDateRange(trip.tanggal_mulai, trip.tanggal_selesai) || 'Jadwal Terbuka';

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      onShowToast('Caption Instagram berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      onShowToast('Gagal menyalin caption');
    }
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Heading */}
      <div className="bg-white border-2 border-[#275d1d] rounded-xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                  isBuka
                    ? 'bg-[#275d1d] text-white'
                    : 'bg-[#d1d1d1] text-[#275d1d] border border-[#275d1d]/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isBuka ? 'bg-white' : 'bg-[#275d1d]'}`} />
                Status: {trip.status}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#275d1d] bg-[#d1d1d1] px-2.5 py-1 rounded border border-[#275d1d]/30">
                <MapPin className="w-3.5 h-3.5 text-[#275d1d]" />
                {trip.jalur}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-[#275d1d]">
              🏔 {trip.nama_gunung.toUpperCase()} {trip.ketinggian_mdpl ? trip.ketinggian_mdpl.toUpperCase() : ''}
            </h2>
            <p className="text-sm font-bold text-[#275d1d] font-['Space_Grotesk']">
              📌 {trip.jalur.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onEdit(trip)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#275d1d] hover:bg-[#1f4a17] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span>Edit Trip</span>
            </button>
          </div>
        </div>

        {/* Quick Meta Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#275d1d]/20">
          <div className="bg-[#f4f4f4] p-3 rounded-lg border border-[#275d1d]/30">
            <span className="text-[11px] font-bold text-[#275d1d] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#275d1d]" /> Tanggal Pelaksanaan
            </span>
            <p className="text-sm sm:text-base font-extrabold text-gray-900 font-['Space_Grotesk'] mt-1">
              {dateRange}
            </p>
          </div>

          <div className="bg-[#f4f4f4] p-3 rounded-lg border border-[#275d1d]/30">
            <span className="text-[11px] font-bold text-[#275d1d] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#275d1d]" /> Durasi Pendakian
            </span>
            <p className="text-sm sm:text-base font-extrabold text-[#275d1d] font-['Space_Grotesk'] mt-1">
              {trip.durasi}
            </p>
          </div>

          <div className="bg-[#f4f4f4] p-3 rounded-lg border border-[#275d1d]/30">
            <span className="text-[11px] font-bold text-[#275d1d] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#275d1d]" /> Target Kuota Peserta
            </span>
            <p className="text-sm sm:text-base font-extrabold text-gray-900 font-['Space_Grotesk'] mt-1">
              {trip.min_peserta || '-'} – {trip.max_peserta || '-'} Pax
            </p>
            <p className="text-[11px] text-[#275d1d] font-semibold italic mt-0.5">
              *(Jika peserta kurang, ada penyesuaian harga)
            </p>
          </div>
        </div>
      </div>

      {/* Export Action Bar (PNG 4:5 & 9:16, PDF, TXT) */}
      <div className="bg-white border-2 border-[#275d1d] rounded-xl p-4 sm:p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#275d1d]/20 pb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-[#275d1d] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#275d1d]" />
              Pusat Export Media & Arsip Trip
            </h3>
            <p className="text-xs text-gray-700 mt-0.5">
              Desain pamflet resmi Cito Adventure (Cover, Fasilitas, Rundown, Catatan Penting, & Kontak).
            </p>
          </div>

          <button
            onClick={() => {
              setStudioInitialSlide('cover');
              setIsStudioOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#275d1d] hover:bg-[#1f4a17] text-white rounded-lg text-xs sm:text-sm font-bold shadow transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Studio Desain & Edit Background</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card Export Pamflet Feed & Story */}
          <div className="bg-[#f4f4f4] border border-[#275d1d]/30 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#275d1d] flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#275d1d]" />
                Pamflet Cover & Slide Utama
              </span>
              <p className="text-[11px] text-gray-700 leading-snug">
                Desain resmi dengan logo Cito Adventure, judul gunung, harga start, dan floating booking bar.
              </p>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPamphlet('4:5')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-[#e4e4e4] text-[#275d1d] border-2 border-[#275d1d] rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>4:5 (Feed)</span>
                </button>
                <button
                  onClick={() => handleExportPamphlet('9:16')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-[#275d1d] hover:bg-[#1f4a17] text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow"
                >
                  <span>9:16 (Story)</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setStudioInitialSlide('cover');
                  setIsStudioOpen(true);
                }}
                className="w-full py-1 px-2 text-[11px] font-bold text-[#275d1d] hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" /> Ganti Background / Preview
              </button>
            </div>
          </div>

          {/* Card Export Itinerary Poster */}
          <div className="bg-[#f4f4f4] border border-[#275d1d]/30 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#275d1d] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#275d1d]" />
                Export Rundown Itinerary (Poster)
              </span>
              <p className="text-[11px] text-gray-700 leading-snug">
                Menyesuaikan desain resmi Cito Adventure: kartu transparan, rundown per hari & jam timeline.
              </p>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportItineraryPoster('4:5')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-[#e4e4e4] text-[#275d1d] border-2 border-[#275d1d] rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>4:5 (Feed)</span>
                </button>
                <button
                  onClick={() => handleExportItineraryPoster('9:16')}
                  disabled={isExporting !== null}
                  className="flex-1 py-1.5 px-2 bg-[#275d1d] hover:bg-[#1f4a17] text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow"
                >
                  <span>9:16 (Story)</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setStudioInitialSlide('itinerary');
                  setIsStudioOpen(true);
                }}
                className="w-full py-1 px-2 text-[11px] font-bold text-[#275d1d] hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" /> Buka di Studio Pamflet
              </button>
            </div>
          </div>

          {/* Card Export Dokumen PDF & TXT */}
          <div className="bg-[#f4f4f4] border border-[#275d1d]/30 rounded-lg p-3.5 space-y-2 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#275d1d] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#275d1d]" />
                Dokumen Arsip Cetak
              </span>
              <p className="text-[11px] text-gray-700 leading-snug">
                Simpan seluruh data ke dokumen PDF resmi atau file teks (.TXT).
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportPDF}
                className="flex-1 py-1.5 px-2 bg-[#275d1d] hover:bg-[#1f4a17] text-white border border-[#275d1d] rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Unduh PDF</span>
              </button>
              <button
                onClick={handleExportTXT}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-[#e4e4e4] text-[#275d1d] border-2 border-[#275d1d] rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Unduh TXT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Caption Instagram Generator Box */}
      <div className="bg-white border-2 border-[#275d1d] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#275d1d] font-['Space_Grotesk'] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#275d1d]" />
              Caption Instagram Otomatis
            </h3>
            <p className="text-xs text-gray-700 mt-0.5">
              Include, Exclude, Itinerary, S&K, dan Catatan <strong>tidak diikutkan</strong> karena sudah masuk di pamflet postingan.
            </p>
          </div>
          <button
            onClick={handleCopyCaption}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#275d1d] hover:bg-[#1f4a17] text-white text-xs font-bold transition-all cursor-pointer shadow active:scale-95"
          >
            {copiedCaption ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copiedCaption ? 'Caption Tersalin!' : 'Salin Caption'}</span>
          </button>
        </div>

        <div className="bg-[#f4f4f4] border-2 border-[#275d1d]/30 rounded-lg p-4 relative font-mono text-xs sm:text-sm text-[#193a14] font-semibold leading-relaxed whitespace-pre-wrap select-all">
          {captionText}
        </div>
      </div>

      {/* Meeting Point & Pricing */}
      <div className="bg-white border-2 border-[#275d1d] rounded-xl p-5 shadow-md space-y-3">
        <h3 className="text-xs font-extrabold text-[#275d1d] uppercase tracking-wider font-['Space_Grotesk']">
          Tarif per Meeting Point (MEPO)
        </h3>
        {trip.harga_mepo && trip.harga_mepo.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {trip.harga_mepo.map((m, idx) => (
              <div key={idx} className="bg-[#f4f4f4] border border-[#275d1d]/30 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">{m.lokasi || 'Meeting Point'}</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#275d1d] font-['Space_Grotesk']">
                  {m.harga || '-'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600">Belum ada data tarif meeting point.</p>
        )}
      </div>

      {/* Include & Exclude Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Include */}
        <div className="bg-white border-2 border-[#275d1d] rounded-xl p-5 shadow-md space-y-3">
          <h3 className="text-xs font-extrabold text-[#275d1d] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#275d1d]" />
            Fasilitas Include
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-800">
            {(trip.include || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#275d1d] font-bold mt-0.5">✓</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclude */}
        <div className="bg-white border-2 border-[#275d1d] rounded-xl p-5 shadow-md space-y-3">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-700" />
            Exclude (Tidak Termasuk)
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-800">
            {(trip.exclude || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-700 font-bold mt-0.5">✕</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
          {trip.extra_porter && (
            <div className="pt-2 border-t border-[#275d1d]/20 text-xs text-[#275d1d] font-bold">
              🎒 Extra Porter: {trip.extra_porter}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary Preview & Action */}
      <div className="bg-white border-2 border-[#275d1d] rounded-xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-extrabold text-[#275d1d] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#275d1d]" />
            Rundown & Itinerary Kegiatan
          </h3>
          <button
            onClick={() => onOpenItinerary(trip)}
            className="text-xs font-bold text-[#275d1d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Editor & Export Poster Itinerary</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#275d1d]" />
          </button>
        </div>

        <div className="bg-[#f4f4f4] border border-[#275d1d]/30 rounded-lg p-4 font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
          {trip.itinerary || 'Belum ada rundown itinerary.'}
        </div>
      </div>

      {/* S&K & Catatan Penting */}
      <div className="bg-white border-2 border-[#275d1d] rounded-xl p-5 shadow-md space-y-4">
        {trip.sk_berlaku && trip.sk_berlaku.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase font-['Space_Grotesk']">
              Syarat & Ketentuan (S&K):
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-800">
              {trip.sk_berlaku.map((sk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#275d1d] font-bold">•</span>
                  <span>{sk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {trip.catatan_penting && (
          <div className="p-3.5 rounded-lg bg-[#275d1d]/10 border-2 border-[#275d1d]/30 text-xs text-[#1a3814]">
            <strong className="block text-[#275d1d] mb-1 font-['Space_Grotesk'] text-sm">Catatan Penting:</strong>
            {trip.catatan_penting}
          </div>
        )}
      </div>

      {/* Contact & Social Footer */}
      <div className="bg-white border-2 border-[#275d1d] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
        <div className="text-gray-700 font-medium">
          Booking & Informasi Resmi: <strong className="text-[#275d1d]">WA {trip.kontak_wa || '+6282230444428'}</strong> · <strong className="text-[#275d1d]">IG {trip.kontak_ig || '@citoadventure'}</strong>
        </div>
        <div className="text-[11px] text-gray-500 font-medium">
          Diperbarui: {new Date(trip.updated_at).toLocaleDateString('id-ID')}
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
    </div>
  );
};
