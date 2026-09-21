import React, { useState } from 'react';
import { X, Image, Download } from 'lucide-react';
import { Trip } from '../types';
import { exportItineraryPosterPNG } from '../utils/canvasExport';
import { ItineraryEditor } from './ItineraryEditor';

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onUpdateTripItinerary: (newItinerary: string) => void;
  onShowToast: (msg: string) => void;
}

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTripItinerary,
  onShowToast,
}) => {
  if (!isOpen || !trip) return null;

  const [itineraryText, setItineraryText] = useState(trip.itinerary || '');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleSave = () => {
    onUpdateTripItinerary(itineraryText);
    onShowToast('Itinerary berhasil diperbarui');
    onClose();
  };

  const handleExportPNG = async (ratio: '4:5' | '9:16') => {
    setIsExporting(ratio);
    onShowToast(`Membuat pamflet itinerary (${ratio})...`);
    try {
      // Create a shallow copy with current updated itinerary text
      const tripCopy: Trip = { ...trip, itinerary: itineraryText };
      await exportItineraryPosterPNG(tripCopy, ratio);
      onShowToast(`Poster Itinerary (${ratio}) berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal membuat poster itinerary');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-stone-200 text-stone-900 w-full max-w-4xl rounded-xl shadow-xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#183e15] px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-200">
              Rundown & Arsip Media Sosial
            </span>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
              Itinerary {trip.nama_gunung} ({trip.jalur})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <ItineraryEditor
            value={itineraryText}
            onChange={setItineraryText}
            namaGunung={trip.nama_gunung}
            jalur={trip.jalur}
            tanggalMulai={trip.tanggal_mulai}
            tanggalSelesai={trip.tanggal_selesai}
            onShowToast={onShowToast}
          />

          {/* Export Action Bar specifically for Itinerary */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5 tracking-tight">
                <Image className="w-4 h-4 text-stone-600" />
                Export Poster Pamflet Itinerary
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Pilih format rasio postingan untuk Instagram Feed atau Instagram Story
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleExportPNG('4:5')}
                disabled={isExporting !== null}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG (4:5 Feed)</span>
              </button>

              <button
                onClick={() => handleExportPNG('9:16')}
                disabled={isExporting !== null}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1c4318] hover:bg-[#142f11] text-white border border-[#142f11] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG (9:16 Story)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 sm:px-6 py-3.5 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 bg-stone-200 hover:bg-stone-300 rounded-lg border border-stone-300/80 shadow-xs active:scale-98 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1c4318] hover:bg-[#142f11] rounded-lg border border-[#142f11] shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
