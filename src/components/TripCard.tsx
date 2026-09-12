import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
  onEdit?: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
  onOpenItinerary?: (trip: Trip) => void;
  isSelected?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onSelect,
  isSelected,
}) => {
  // Format title like: "Gunung Argopuro 3088 Mdpl"
  const formatTitle = () => {
    const name = trip.nama_gunung || '';
    const rawHeight = (trip.ketinggian_mdpl || '').replace(/[().]/g, '').trim();
    if (!rawHeight) return name;
    if (name.toLowerCase().includes(rawHeight.toLowerCase())) return name;

    const cleanHeight = rawHeight.replace(/mdpl/i, 'Mdpl');
    return `${name} ${cleanHeight}`;
  };

  const jalurText = trip.jalur?.startsWith('Via ') ? trip.jalur : `Via ${trip.jalur || 'Jalur Terbuka'}`;

  return (
    <div
      onClick={() => onSelect(trip)}
      className={`group relative rounded-2xl border-2 p-3 sm:p-3.5 transition-all cursor-pointer shadow-xs hover:shadow-md ${
        isSelected
          ? 'bg-white border-[#275d1d] ring-2 ring-[#275d1d]/40 shadow-sm'
          : 'bg-white border-[#275d1d] hover:bg-emerald-50/20'
      }`}
    >
      {/* Row 1: Mountain Name & Height + Chevron Icon */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm sm:text-base font-bold font-['Space_Grotesk'] text-[#275d1d] truncate">
          {formatTitle()}
        </h3>
        <ChevronRight
          className={`w-5 h-5 transition-all shrink-0 ${
            isSelected
              ? 'text-[#275d1d] translate-x-0.5'
              : 'text-gray-300 group-hover:text-[#275d1d] group-hover:translate-x-0.5'
          }`}
        />
      </div>

      {/* Row 2: Jalur Pill Badge */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-[#275d1d] text-white">
          {jalurText}
        </span>

        {trip.is_draft && (
          <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
            Draf Tim
          </span>
        )}
      </div>
    </div>
  );
};
