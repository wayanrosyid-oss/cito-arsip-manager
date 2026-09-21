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
      className={`group relative rounded-xl p-3.5 sm:p-4 cursor-pointer ${
        isSelectMode
          ? isSelectedForDelete
            ? 'bg-rose-50/90 border border-rose-300 shadow-xs'
            : 'bg-white border border-dashed border-stone-300/80 hover:border-rose-300 field-card-interactive'
          : isSelected
          ? 'field-card-active'
          : 'field-card-interactive'
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
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-stone-300 group-hover:border-rose-400'
              }`}
            >
              {isSelectedForDelete ? (
                <span className="text-xs font-semibold leading-none">✓</span>
              ) : null}
            </div>
          )}

          <h3
            className={`text-sm sm:text-base font-semibold tracking-tight truncate transition-colors leading-snug ${
              isSelectedForDelete
                ? 'text-rose-950'
                : isSelected
                ? 'text-[#183e15]'
                : 'text-stone-900 group-hover:text-[#183e15]'
            }`}
          >
            {formatTitle()}
          </h3>

          {/* Badge Sumber Pembuat: Dari Tim vs Dari Admin */}
          {trip.from_team ? (
            <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/60 shrink-0">
              Tim
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200/50 shrink-0">
              Admin
            </span>
          )}

          {/* Badge Status: Draft vs Final */}
          {trip.is_draft ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              Draft
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Final
            </span>
          )}
        </div>
        <ChevronRight
          className={`w-5 h-5 transition-all shrink-0 ${
            isSelected
              ? 'text-[#183e15] translate-x-0.5'
              : 'text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5'
          }`}
        />
      </div>

      {/* Row 2: Jalur Pill Badge & Tanggal Trip */}
      <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
        <span
          className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded transition-colors shrink-0 ${
            isSelected
              ? 'bg-[#183e15] text-white'
              : 'bg-stone-100 text-stone-700 border border-stone-200/50 group-hover:bg-stone-200/60'
          }`}
        >
          {jalurText}
        </span>

        {formattedDate && (
          <span
            className={`text-xs sm:text-[13px] transition-colors ${
              isSelected ? 'text-[#183e15] font-medium' : 'text-stone-600 group-hover:text-stone-800'
            }`}
          >
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
};
