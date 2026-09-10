import React from 'react';
import { Calendar, Clock, Users, MapPin, Edit3, Trash2, FileText, ChevronRight } from 'lucide-react';
import { Trip } from '../types';
import { formatDateRange } from '../utils/formatters';

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onOpenItinerary: (trip: Trip) => void;
  isSelected?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onSelect,
  onEdit,
  onDelete,
  onOpenItinerary,
  isSelected,
}) => {
  const isBuka = trip.status === 'Buka';
  const dateRange = formatDateRange(trip.tanggal_mulai, trip.tanggal_selesai) || 'Jadwal Terbuka';

  return (
    <div
      className={`group relative rounded-xl border-2 p-4 sm:p-5 transition-all cursor-pointer shadow-sm ${
        isSelected
          ? 'bg-white border-[#275d1d] shadow-md ring-2 ring-[#275d1d]'
          : 'bg-white border-[#275d1d]/30 hover:border-[#275d1d] hover:shadow'
      }`}
      onClick={() => onSelect(trip)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pill: Buka / Tutup */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                isBuka
                  ? 'bg-[#275d1d] text-white'
                  : 'bg-[#d1d1d1] text-[#275d1d] border border-[#275d1d]/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isBuka ? 'bg-white' : 'bg-[#275d1d]'}`} />
              {trip.status}
            </span>

            {/* Jalur Tag */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#275d1d] bg-[#d1d1d1] px-2 py-0.5 rounded border border-[#275d1d]/30">
              <MapPin className="w-3 h-3 text-[#275d1d]" />
              {trip.jalur}
            </span>
          </div>

          {/* Mountain Name + MDPL */}
          <h3 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-[#275d1d] truncate">
            {trip.nama_gunung} {trip.ketinggian_mdpl && <span className="text-gray-600 font-normal text-sm sm:text-base">({trip.ketinggian_mdpl})</span>}
          </h3>

          {/* Date & Duration */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-700 flex-wrap pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#275d1d]" />
              <span className="font-semibold text-gray-800">{dateRange}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#275d1d] font-bold">
              <Clock className="w-3.5 h-3.5 text-[#275d1d]" />
              <span>{trip.durasi}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>{trip.min_peserta || '-'}–{trip.max_peserta || '-'} pax</span>
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <div className="flex items-center gap-1 shrink-0">
          <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-[#275d1d] translate-x-1' : 'text-gray-400 group-hover:text-[#275d1d]'}`} />
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-3.5 pt-3 border-t border-[#275d1d]/20 flex items-center justify-between gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenItinerary(trip)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#275d1d] hover:bg-[#1f4a17] text-white transition-colors font-bold cursor-pointer shadow-xs"
          title="Buka & edit itinerary rundown"
        >
          <FileText className="w-3.5 h-3.5 text-white" />
          <span>Itinerary</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(trip)}
            className="p-1.5 text-[#275d1d] hover:bg-[#d1d1d1] rounded transition-colors cursor-pointer"
            title="Edit trip"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip);
            }}
            className="p-1.5 text-gray-600 hover:text-rose-700 hover:bg-rose-100 rounded transition-colors cursor-pointer"
            title="Hapus trip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
