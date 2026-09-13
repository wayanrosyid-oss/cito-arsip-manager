import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Smartphone,
  Laptop,
  Copy,
  Check,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Trip } from '../types';
import { uploadAllTripsToCloud, fetchAllCloudTrips, saveTripToCloud } from '../firebase';
import { getDeletedTripIds, saveStoredTrips } from '../utils/storage';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrips: Trip[];
  onTripsUpdated: (trips: Trip[]) => void;
  cloudStatus: 'synced' | 'syncing' | 'offline';
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentTrips,
  onTripsUpdated,
  cloudStatus,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const adminSyncUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?admin=yuno`
    : '';

  useEffect(() => {
    if (isOpen && adminSyncUrl) {
      QRCode.toDataURL(adminSyncUrl, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#143811',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, adminSyncUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(adminSyncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualUpload = async () => {
    try {
      setIsUploading(true);
      setStatusMessage(null);
      const count = await uploadAllTripsToCloud(currentTrips);
      setStatusMessage(`✓ Berhasil mengunggah ${count} data trip dari perangkat ini ke Cloud Database!`);
    } catch (err) {
      console.error('Upload failed:', err);
      setStatusMessage('⚠️ Gagal mengunggah ke Cloud. Pastikan koneksi internet stabil.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualDownload = async () => {
    try {
      setIsDownloading(true);
      setStatusMessage(null);
      const cloudTrips = await fetchAllCloudTrips();
      if (cloudTrips.length > 0) {
        // Smart Merge: never overwrite local pending trips!
        const deletedIds = getDeletedTripIds();
        const validCloudTrips = cloudTrips.filter((t) => !deletedIds.has(t.id));
        const cloudMap = new Map<string, Trip>(validCloudTrips.map((t) => [t.id, t]));

        const localPendingTrips: Trip[] = [];
        for (const localTrip of currentTrips) {
          if (!deletedIds.has(localTrip.id) && !cloudMap.has(localTrip.id)) {
            localPendingTrips.push(localTrip);
          }
        }

        const merged = [...validCloudTrips, ...localPendingTrips];
        merged.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

        onTripsUpdated(merged);
        saveStoredTrips(merged);

        if (localPendingTrips.length > 0) {
          // Auto-upload local-only trips to cloud
          for (const pending of localPendingTrips) {
            saveTripToCloud(pending).catch(console.warn);
          }
          setStatusMessage(`✓ Berhasil mengambil ${validCloudTrips.length} trip dari Cloud! ${localPendingTrips.length} trip lokal Anda tetap aman & otomatis diunggah.`);
        } else {
          setStatusMessage(`✓ Berhasil menyinkronkan ${validCloudTrips.length} data trip dari Cloud Database!`);
        }
      } else {
        setStatusMessage('ℹ️ Database Cloud masih kosong. Silakan gunakan tombol "Unggah Data Ini ke Cloud" untuk mengisinya.');
      }
    } catch (err) {
      console.error('Download failed:', err);
      setStatusMessage('⚠️ Gagal mengambil data Cloud. Pastikan koneksi internet stabil.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      id="cloud-sync-modal-backdrop"
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="cloud-sync-modal-card"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#143811] to-[#275d1d] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20">
              <Cloud className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Sinkronisasi Cloud (HP & Laptop)</h2>
              <p className="text-[11px] text-emerald-100/90">
                Penyimpanan online real-time Cito Adventure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  {cloudStatus === 'offline' ? 'Mode Offline' : 'Cloud Firestore Aktif'}
                </p>
                <p className="text-[11px] text-emerald-700">
                  {currentTrips.length} trip tersimpan di perangkat ini
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">
              Real-time
            </span>
          </div>

          {/* Feedback Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                statusMessage.startsWith('✓')
                  ? 'bg-green-100 text-green-900 border border-green-300'
                  : statusMessage.startsWith('⚠️')
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Two Manual Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleManualUpload}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#275d1d] hover:bg-[#1f4a17] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4 text-emerald-200" />
              )}
              <span>Unggah Data Ini ke Cloud</span>
            </button>

            <button
              onClick={handleManualDownload}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all border border-gray-300 cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4 text-gray-600" />
              )}
              <span>Tarik Data Terbaru Cloud</span>
            </button>
          </div>

          {/* Practical Explanation for Laptop & HP */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2 text-xs text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Cara Menyamakan Data Laptop & HP:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-amber-900/90 leading-relaxed">
              <li>
                <strong>Di Laptop:</strong> Klik tombol hijau <em>"Unggah Data Ini ke Cloud"</em> di atas agar trip yang sudah Anda buat di laptop tersimpan ke database online.
              </li>
              <li>
                <strong>Di HP:</strong> Buka link yang <u>sama persis</u> dengan di laptop (scan QR Code di bawah).
              </li>
              <li>
                <strong>Selesai:</strong> Begitu halaman di HP terbuka, HP akan otomatis membaca data trip yang sama dari Cloud.
              </li>
            </ol>
          </div>

          {/* QR Code Section to Open on Phone */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-800">
              <Smartphone className="w-4 h-4 text-[#275d1d]" />
              <span>Buka Langsung di HP Anda</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Scan barcode di bawah dengan kamera HP Anda untuk langsung membuka aplikasi:
            </p>

            <div className="flex justify-center">
              {qrCodeDataUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-200 inline-block">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Buka di HP"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 bg-gray-200 animate-pulse rounded-xl mx-auto flex items-center justify-center text-xs text-gray-400">
                  Memuat QR...
                </div>
              )}
            </div>

            {/* URL Copy Box */}
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                readOnly
                value={adminSyncUrl}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-600 font-mono select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 bg-[#275d1d] hover:bg-[#1e4817] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
