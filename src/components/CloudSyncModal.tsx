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
  Trash2,
} from 'lucide-react';
import { Trip } from '../types';
import { uploadAllTripsToCloud, fetchAllCloudTrips, saveTripToCloud } from '../firebase';
import {
  getDeletedTripIds,
  saveStoredTrips,
  sortTripsByDepartureDate,
  clearAllDeletedTripIds,
} from '../utils/storage';

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

  const adminUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?admin=yuno`
    : '';

  useEffect(() => {
    if (isOpen && adminUrl) {
      QRCode.toDataURL(adminUrl, {
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
  }, [isOpen, adminUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(adminUrl);
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

        const merged = sortTripsByDepartureDate([...validCloudTrips, ...localPendingTrips]);

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

  const handleResetAndFetchPureCloud = async () => {
    if (
      !confirm(
        'Bersihkan cache lokal perangkat ini dan samakan persis dengan Cloud (Laptop)?\n\nSemua trip contoh bawaan di HP akan dibersihkan, dan daftar trip akan 100% identik dengan Cloud Firestore.'
      )
    ) {
      return;
    }

    try {
      setIsDownloading(true);
      setStatusMessage('Sedang membersihkan cache lokal & menyamakan dengan Cloud...');
      clearAllDeletedTripIds();

      const cloudTrips = await fetchAllCloudTrips();
      if (cloudTrips.length > 0) {
        const sorted = sortTripsByDepartureDate(cloudTrips);
        onTripsUpdated(sorted);
        saveStoredTrips(sorted);
        setStatusMessage(`✓ Berhasil! Cache lokal dibersihkan. Sekarang perangkat ini 100% sinkron (${sorted.length} trip dari Cloud).`);
      } else {
        setStatusMessage('ℹ️ Database Cloud kosong. Unggah trip dari Laptop terlebih dahulu.');
      }
    } catch (err) {
      console.error('Reset & cloud sync error:', err);
      setStatusMessage('⚠️ Gagal mengambil data Cloud. Periksa koneksi internet.');
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
        className="bg-white rounded-xl max-w-lg w-full shadow-lg overflow-hidden flex flex-col my-auto border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#183e15] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Cloud className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">Sinkronisasi Cloud</h2>
              <p className="text-xs text-white/70">
                Penyimpanan real-time HP & Laptop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {cloudStatus === 'offline' ? 'Mode Offline' : 'Cloud Firestore Aktif'}
                </p>
                <p className="text-[11px] text-stone-500">
                  {currentTrips.length} trip tersimpan di perangkat ini
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">
              Online
            </span>
          </div>

          {/* Feedback Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                statusMessage.startsWith('✓')
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : statusMessage.startsWith('⚠️')
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : 'bg-stone-100 text-stone-900 border border-stone-300'
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleManualUpload}
              disabled={isUploading || isDownloading}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#1c4318] hover:bg-[#142f11] text-white text-xs font-semibold border border-[#142f11] transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4 text-emerald-200" />
              )}
              <span>Unggah Data ke Cloud</span>
            </button>

            <button
              onClick={handleManualDownload}
              disabled={isDownloading || isUploading}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all border border-stone-300 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4 text-stone-600" />
              )}
              <span>Tarik Data Cloud</span>
            </button>
          </div>

          {/* Quick Fix Button */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
            <div>
              <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                <span>Samakan Persis dengan Laptop / Cloud</span>
              </p>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Jika di HP muncul trip dummy/sampel berlebih, klik tombol ini untuk membersihkan cache HP dan mengambil murni data trip asli dari Cloud.
              </p>
            </div>
            <button
              onClick={handleResetAndFetchPureCloud}
              disabled={isDownloading || isUploading}
              className="w-full py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold border border-stone-900 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin' : ''}`} />
              <span>Bersihkan Cache & Sinkron Ulang</span>
            </button>
          </div>

          {/* Practical Explanation for Laptop & HP */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <span>Cara Sinkronisasi Laptop & HP:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600 leading-relaxed">
              <li>
                <strong>Di Laptop:</strong> Klik tombol <em>"Unggah Data ke Cloud"</em> agar trip di laptop tersimpan ke online.
              </li>
              <li>
                <strong>Di HP:</strong> Scan QR Code di bawah untuk membuka aplikasi di HP.
              </li>
              <li>
                <strong>Selesai:</strong> Data trip langsung otomatis tampil di HP.
              </li>
            </ol>
          </div>

          {/* QR Code Section to Open on Phone */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-900">
              <Smartphone className="w-4 h-4 text-[#1c4318]" />
              <span>Buka di HP (Akses Admin Mas Yuno)</span>
            </div>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto leading-relaxed">
              Scan barcode di bawah dengan kamera HP pribadi Mas Yuno untuk langsung login sebagai admin penuh:
            </p>

            <div className="flex justify-center">
              {qrCodeDataUrl ? (
                <div className="p-2 bg-white rounded-lg shadow-xs border border-stone-200 inline-block">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Buka di HP Mas Yuno"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 bg-stone-100 animate-pulse rounded-lg mx-auto flex items-center justify-center text-xs text-stone-400">
                  Memuat QR...
                </div>
              )}
            </div>

            {/* URL Copy Box */}
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                readOnly
                value={adminUrl}
                className="flex-1 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-[10px] text-stone-600 font-mono select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 bg-[#1c4318] hover:bg-[#142f11] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#142f11] shadow-xs active:scale-98 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-3 sm:p-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold border border-stone-300/80 shadow-xs active:scale-98 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
