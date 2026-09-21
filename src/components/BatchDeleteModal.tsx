import React from 'react';
import { Trash2, AlertTriangle, X, CheckSquare, Layers } from 'lucide-react';
import { Trip } from '../types';

interface BatchDeleteModalProps {
  isOpen: boolean;
  selectedTrips: Trip[];
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const BatchDeleteModal: React.FC<BatchDeleteModalProps> = ({
  isOpen,
  selectedTrips,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || selectedTrips.length === 0) return null;

  const count = selectedTrips.length;
  const draftCount = selectedTrips.filter((t) => t.is_draft).length;
  const teamCount = selectedTrips.filter((t) => t.from_team).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 text-stone-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-700 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5 font-semibold text-base tracking-tight">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-none">Konfirmasi Hapus Banyak Trip</h3>
              <p className="text-xs text-rose-100 font-normal mt-0.5">
                {count} trip dipilih untuk dihapus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 hover:bg-rose-800 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-950">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">
                Apakah Anda yakin ingin menghapus {count} trip terpilih?
              </p>
              <p className="text-red-800 leading-relaxed">
                Trip yang dihapus akan dibersihkan dari penyimpanan laptop dan disinkronkan ke Cloud Firestore.
              </p>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Total: {count} Trip
            </span>
            {draftCount > 0 && (
              <span className="bg-red-100 border border-red-300 text-red-800 px-2.5 py-1 rounded-lg font-bold">
                🔴 {draftCount} Draf
              </span>
            )}
            {teamCount > 0 && (
              <span className="bg-amber-100 border border-amber-300 text-amber-800 px-2.5 py-1 rounded-lg font-bold">
                👥 {teamCount} Dari Tim
              </span>
            )}
          </div>

          {/* List preview of mountains */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700">Daftar gunung yang akan dihapus:</p>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 p-1 bg-slate-50/50">
              {selectedTrips.map((t) => (
                <div
                  key={t.id}
                  className="px-3 py-2 flex items-center justify-between text-xs hover:bg-white rounded-lg transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">
                      🏔️ {t.nama_gunung} {t.ketinggian_mdpl ? `(${t.ketinggian_mdpl})` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {t.jalur} • {t.durasi || '2H1M'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      t.is_draft
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {t.is_draft ? 'Draft' : 'Final'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white border border-red-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Sedang Menghapus...' : `Ya, Hapus ${count} Trip`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
