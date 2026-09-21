import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Trip } from '../types';
import { formatDateRange } from '../utils/formatters';

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
  onEdit?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
  onOpenItinerary?: (trip: Trip) => void;
  isSelected?: boolean;
  isSelectMode?: boolean;
  isSelectedForDelete?: boolean;
  onToggleSelect?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onSelect,
  isSelected,
  isSelectMode = false,
  isSelectedForDelete = false,
  onToggleSelect,
}) => {
  // Format title like: "Gunung Sumbing 3371 Mdpl"
  const formatTitle = () => {
    const name = trip.nama_gunung || '';
    const rawHeight = (trip.ketinggian_mdpl || '').replace(/[().]/g, '').trim();
    if (!rawHeight) return name;
    if (name.toLowerCase().includes(rawHeight.toLowerCase())) return name;

    const cleanHeight = rawHeight.replace(/mdpl/i, 'Mdpl');
    return `${name} ${cleanHeight}`;
  };

  const jalurText = trip.jalur?.startsWith('Via ') ? trip.jalur : `Via ${trip.jalur || 'Jalur Terbuka'}`;
  const formattedDate = formatDateRange(trip.tanggal_mulai, trip.tanggal_selesai) || '';

  const handleClick = () => {
    if (isSelectMode && onToggleSelect) {
      onToggleSelect(trip.id);
    } else {
      onSelect(trip);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer ${
        isSelectMode
          ? isSelectedForDelete
            ? 'bg-red-50/90 border-2 border-red-500 shadow-md ring-2 ring-red-400/50'
            : 'bg-white/90 border-2 border-dashed border-slate-300 hover:border-red-400 hover:bg-white shadow-2xs'
          : isSelected
          ? 'bg-white border-2 border-[#275d1d] shadow-md ring-1 ring-[#275d1d]/30 scale-[1.01]'
          : 'bg-white/95 border border-slate-300 hover:border-slate-400 hover:bg-white shadow-2xs hover:shadow-xs opacity-70 hover:opacity-100'
      }`}
    >
      {/* Row 1: Checkbox (if in select mode) + Mountain Name & Height + Dari Tim Badge + Draft/Final Badge + Chevron/Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap flex-1">
          {/* Checkbox in select mode */}
          {isSelectMode && (
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                isSelectedForDelete
                  ? 'bg-red-600 text-white border-2 border-red-700 shadow-xs'
                  : 'bg-white border-2 border-slate-400 group-hover:border-red-500'
              }`}
            >
              {isSelectedForDelete ? (
                <span className="text-xs font-black leading-none">✓</span>
              ) : null}
            </div>
          )}

          <h3
            className={`text-sm sm:text-base font-['Montserrat'] truncate transition-colors ${
              isSelectedForDelete
                ? 'text-red-950 font-extrabold tracking-tight'
                : isSelected
                ? 'text-[#1f4a17] font-extrabold tracking-tight'
                : 'text-slate-500 font-semibold group-hover:text-slate-700'
            }`}
          >
            {formatTitle()}
          </h3>

          {/* Badge Sumber Pembuat: Dari Tim vs Dari Admin */}
          {trip.from_team ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs shrink-0">
              👥 Dari Tim
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#275d1d] text-white shadow-2xs shrink-0">
              👑 Dari Admin
            </span>
          )}

          {/* Badge Status: Draft (Merah Tegas) vs Final (Hijau) */}
          {trip.is_draft ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-500 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              🔴 Draft
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              🟢 Final
            </span>
          )}
        </div>
        <ChevronRight
          className={`w-5 h-5 transition-all shrink-0 ${
            isSelected
              ? 'text-[#275d1d] translate-x-1 font-bold'
              : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'
          }`}
        />
      </div>

      {/* Row 2: Jalur Pill Badge & Tanggal Trip */}
      <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
        <span
          className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full transition-colors shrink-0 ${
            isSelected
              ? 'bg-[#1f4a17] text-white shadow-xs'
              : 'bg-slate-300/80 text-slate-600 group-hover:bg-slate-300 group-hover:text-slate-700'
          }`}
        >
          {jalurText}
        </span>

        {formattedDate && (
          <span
            className={`text-xs sm:text-[13px] font-medium font-['Montserrat'] transition-colors ${
              isSelected ? 'text-[#1f4a17] font-bold' : 'text-slate-600 group-hover:text-slate-800'
            }`}
          >
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
};
