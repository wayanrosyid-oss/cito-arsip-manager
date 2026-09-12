import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock, Check } from 'lucide-react';

export const STANDARD_TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  for (const m of [0, 15, 30, 45]) {
    const mm = m.toString().padStart(2, '0');
    STANDARD_TIME_OPTIONS.push(`${hh}.${mm}`);
  }
}

interface TimeDropdownProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isEndTime?: boolean;
  className?: string;
}

export const TimeDropdown: React.FC<TimeDropdownProps> = ({
  value,
  onChange,
  placeholder = '00.00',
  isEndTime = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto scroll into selected view when opened
  useEffect(() => {
    if (isOpen && selectedItemRef.current && listRef.current) {
      const topPos = selectedItemRef.current.offsetTop;
      listRef.current.scrollTop = Math.max(0, topPos - 70);
    }
  }, [isOpen]);

  const handleSelect = (time: string) => {
    onChange(time);
    setIsOpen(false);
  };

  const options = isEndTime ? ['selesai', ...STANDARD_TIME_OPTIONS] : STANDARD_TIME_OPTIONS;

  // Check if current custom value exists in options
  const isCustomValue = value && !options.includes(value);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Box matching Screenshot 00.00 styling */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1e231d] hover:bg-[#283027] text-white border border-[#275d1d]/60 focus:border-[#4ade80] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold flex items-center justify-between shadow-xs transition-colors cursor-pointer"
        title="Pilih jam kegiatan"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="w-3 h-3 text-[#4ade80] shrink-0" />
          <span className="tracking-wider">{value || placeholder}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#4ade80]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu matching Screenshot: Dark theme with 15-min options */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-40 max-w-[200px] z-50 bg-[#212121] border border-[#3a3a3a] rounded-xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Custom / direct type bar if needed */}
          <div className="p-1.5 border-b border-[#333] bg-[#1a1a1a]">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ketik manual..."
              className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 text-[11px] font-mono px-2 py-1 rounded border border-[#444] focus:outline-none focus:border-[#4ade80]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Scrollable List */}
          <div
            ref={listRef}
            className="max-h-48 overflow-y-auto py-1 divide-y divide-[#2a2a2a] scrollbar-thin scrollbar-thumb-gray-600"
          >
            {isCustomValue && (
              <button
                type="button"
                onClick={() => handleSelect(value)}
                className="w-full text-left px-3 py-1.5 text-xs font-mono text-amber-400 bg-[#2d281e] flex items-center justify-between hover:bg-[#383838] transition-colors cursor-pointer"
              >
                <span>{value} (Kustom)</span>
                <Check className="w-3 h-3" />
              </button>
            )}

            {options.map((time) => {
              const isSelected = value === time;
              return (
                <button
                  key={time}
                  type="button"
                  ref={isSelected ? selectedItemRef : null}
                  onClick={() => handleSelect(time)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#383838] text-[#4ade80] font-bold'
                      : 'text-gray-200 hover:bg-[#2e2e2e] hover:text-white'
                  }`}
                >
                  <span>{time}</span>
                  {isSelected && <Check className="w-3 h-3 text-[#4ade80]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
