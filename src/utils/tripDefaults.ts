import { TripDefaults, MeetingPoint } from '../types';
import { saveTripDefaultsToCloud } from '../firebase';

export const DEFAULT_CITO_MIN_PESERTA = '7';
export const DEFAULT_CITO_MIN_PESERTA_JAKARTA = '7';
export const DEFAULT_CITO_MAX_PESERTA = '30';

export const DEFAULT_CITO_MEPO: MeetingPoint[] = [
  { lokasi: 'Basecamp', harga: 'IDR 600.000' },
  { lokasi: 'Madiun', harga: 'IDR 700.000' },
  { lokasi: 'Surabaya', harga: 'IDR 850.000' },
  { lokasi: 'Jakarta', harga: '(Menyesuaikan jumlah peserta)' },
  { lokasi: 'Solo', harga: '(Menyesuaikan jumlah peserta)' },
];

export const DEFAULT_CITO_INCLUDE = [
  'Transportasi PP sesuai mepo',
  'Simaksi pendakian',
  'Ojek Basecamp - Portal',
  'Sarapan di basecamp',
  'Tenda kelompok',
  'Guide (bersertifikasi)',
  'Porter Tim',
  'Sweeper',
  'Makan selama pendakian',
  'Alat makan & masak',
  'P3K standard',
  'HT tim (alat komunikasi)',
  'Dokumentasi',
  'Bonus masuk YT Cito Adventure Madiun',
];

export const DEFAULT_CITO_EXCLUDE = [
  'Perlengkapan pribadi',
  'Surat sehat',
  'Obat-obatan pribadi khusus',
  'Logistik (camilan pribadi)',
  'Perlengkapan pendakian yang tidak ada di daftar',
  'Tip crew / guide / porter',
];

export const DEFAULT_CITO_EXTRA_PORTER = 'Jika di perlukan';

export const DEFAULT_CITO_SK = [
  'Peserta Untuk Umum (Sendiri Bisa Join)',
  'Apabila kuota tidak terpenuhi, akan ada biaya tambahan sesuai kesepakatan bersama',
  'DP minimal Rp 200.000',
  'Pelunasan Maksimal H-5',
  'Pembatalan Oleh Peserta: DP Hangus',
  'Trip Sesuai Jadwal (Diluar Jadwal Tersedia Private Trip)',
];

export const DEFAULT_CITO_CATATAN_PENTING =
  'SEBELUM MENDAKI, SANGAT DISARANKAN UNTUK RUTIN BEROLAHRAGA SEPERTI JOGGING, HIKING RINGAN, ATAU LATIHAN KARDIO MINIMAL 1-2 MINGGU SEBELUMNYA. MULAILAH DARI LATIHAN RINGAN, TINGKATKAN INTENSITASNYA, DAN PASTIKAN KONDISI TUBUH BENAR-BENAR SIAP.';

export const DEFAULT_CITO_KONTAK_WA = '+6282230444428';
export const DEFAULT_CITO_KONTAK_WA_JAKARTA = '+6289503689266';
export const DEFAULT_CITO_KONTAK_IG = '@citoadventuremadiun';

export const STANDARD_BASE_DEFAULTS: TripDefaults = {
  min_peserta: DEFAULT_CITO_MIN_PESERTA,
  min_peserta_jakarta: DEFAULT_CITO_MIN_PESERTA_JAKARTA,
  max_peserta: DEFAULT_CITO_MAX_PESERTA,
  harga_mepo: DEFAULT_CITO_MEPO,
  include: DEFAULT_CITO_INCLUDE,
  exclude: DEFAULT_CITO_EXCLUDE,
  extra_porter: DEFAULT_CITO_EXTRA_PORTER,
  sk_berlaku: DEFAULT_CITO_SK,
  catatan_penting: DEFAULT_CITO_CATATAN_PENTING,
  kontak_wa: DEFAULT_CITO_KONTAK_WA,
  kontak_wa_jatim: DEFAULT_CITO_KONTAK_WA,
  kontak_wa_jakarta: DEFAULT_CITO_KONTAK_WA_JAKARTA,
  kontak_ig: DEFAULT_CITO_KONTAK_IG,
};

const STORAGE_KEY = 'cito_trip_defaults_v2';

/**
 * Get the currently active trip defaults (from localStorage or standard base defaults).
 */
export function getStoredTripDefaults(): TripDefaults {
  if (typeof window === 'undefined') return STANDARD_BASE_DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...STANDARD_BASE_DEFAULTS,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Failed to parse trip defaults from localStorage:', err);
  }
  return STANDARD_BASE_DEFAULTS;
}

/**
 * Save updated default fields both locally and sync to Cloud Firestore in background.
 */
export function saveTripDefaults(updates: Partial<TripDefaults>): TripDefaults {
  const current = getStoredTripDefaults();
  const next: TripDefaults = {
    ...current,
    ...updates,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('Failed to save trip defaults to localStorage:', err);
  }

  // Trigger local event so any open modal or view immediately re-renders
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cito_trip_defaults_updated', { detail: next }));
  }

  // Sync to Cloud Firestore in background (0 wait for UI)
  saveTripDefaultsToCloud(next).catch((err) => {
    console.warn('Failed to sync trip defaults to Firestore in background:', err);
  });

  return next;
}

/**
 * Sync defaults received from Cloud Firestore into local storage.
 */
export function syncCloudTripDefaultsToLocal(cloudDefaults: TripDefaults | null): void {
  if (!cloudDefaults || typeof window === 'undefined') return;
  try {
    const current = getStoredTripDefaults();
    const merged: TripDefaults = {
      ...current,
      ...cloudDefaults,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('cito_trip_defaults_updated', { detail: merged }));
  } catch (err) {
    console.warn('Failed to sync cloud trip defaults to local:', err);
  }
}
