import { Trip } from '../types';
import { generateDefaultItinerary } from './formatters';
import { idbGet, idbSet, idbDelete } from './indexedDb';

const STORAGE_KEY = 'cito_adventure_trips_v3';
export const CUSTOM_LOGO_KEY = 'cito_custom_logo_v1';

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'sindoro-watu-lunyu',
    nama_gunung: 'Gunung Sindoro',
    ketinggian_mdpl: '3.153 MDPL',
    jalur: 'Via Watu Lunyu',
    status: 'Buka',
    tanggal_mulai: '2026-09-10',
    tanggal_selesai: '2026-09-11',
    durasi: '2 Hari 1 Malam',
    min_peserta: '15',
    max_peserta: '30',
    harga_mepo: [
      { lokasi: 'Jakarta', harga: 'IDR 950.000' },
      { lokasi: 'Solo', harga: 'IDR 750.000' },
      { lokasi: 'Madiun', harga: 'IDR 700.000' },
      { lokasi: 'Basecamp', harga: 'IDR 600.000' },
    ],
    include: [
      'Transportasi PP sesuai mepo',
      'Simaksi pendakian',
      'Sarapan di basecamp',
      'Ojek Basecamp - Pos 1',
      'Tenda kelompok',
      'Tim Guide (pemandu bersertifikasi, porter & sweeper)',
      'Makan selama pendakian',
      'Alat makan & masak',
      'P3K standard',
      'HT tim (alat komunikasi)',
      'Dokumentasi',
      'Bonus masuk YT Cito Adventure Madiun',
    ],
    exclude: [
      'Obat-Obatan pribadi',
      'Logistik pribadi',
      'Surat sehat',
      'Perlengkapan pendakian yang tidak ada di daftar',
    ],
    extra_porter: 'Jika di perlukan',
    sk_berlaku: [
      'Peserta Untuk Umum (Sendiri Bisa Join)',
      'Minimal Peserta : 15 Orang (apabila kuota tidak terpenuhi, akan ada penyesuaian biaya)',
      'DP minimal Rp 200.000',
      'Pelunasan Maksimal H-5',
      'Pembatalan Oleh Peserta: DP Hangus',
      'Trip Sesuai Jadwal (Diluar Jadwal Tersedia Private Trip)',
    ],
    catatan_penting:
      'SEBELUM MENDAKI, SANGAT DISARANKAN UNTUK RUTIN BEROLAHRAGA SEPERTI JOGGING, HIKING RINGAN, ATAU LATIHAN KARDIO MINIMAL 1-2 MINGGU SEBELUMNYA. MULAILAH DARI LATIHAN RINGAN, TINGKATKAN INTENSITASNYA, DAN PASTIKAN KONDISI TUBUH BENAR-BENAR SIAP.',
    itinerary: `🗓️ H-1 : Keberangkatan Meeting Point
• 19.00 - 20.30 : Kumpul peserta mepo Jakarta (Cawang) & briefing
• 21.00 - 04.00 : Perjalanan via tol menuju meeting point Solo & Madiun

🗓️ Hari 1 : Basecamp & Pendakian
• 06.00 - 07.30 : Tiba di Basecamp Watu Lunyu, registrasi & sarapan pagi
• 07.30 - 08.00 : Naik ojek Basecamp menuju Pos 1 & doa bersama
• 08.00 - 12.30 : Trekking santai Pos 1 - Pos 2 - Pos 3
• 12.30 - 13.30 : Makan siang & istirahat di area Pos 3
• 13.30 - 16.00 : Melanjutkan perjalanan ke camp area Pos 4 (Alang-Alang)
• 16.00 - 18.00 : Pasang tenda, coffee break & menikmati sunset
• 18.30 - 20.00 : Makan malam hangat bersama crew & istirahat tidur

🗓️ Hari 2 : Summit Attack & Kembali
• 02.30 - 03.00 : Bangun pagi, santap snack ringan & teh hangat
• 03.00 - 05.30 : Summit Attack menuju Puncak Sindoro 3.153 MDPL
• 05.30 - 07.30 : Menikmati golden sunrise, foto dokumentasi & kawah Sindoro
• 07.30 - 09.30 : Perjalanan turun kembali ke camp area Pos 4
• 09.30 - 11.00 : Sarapan pagi, packing perlengkapan & operasi semut sampah
• 11.00 - 14.00 : Turun ke Basecamp via Pos 1
• 14.00 - 16.00 : Bersih-bersih, istirahat & persiapan pulang
• 16.00 - selesai : Perjalanan pulang kembali ke meeting point masing-masing`,
    kontak_wa: '+6282230444428',
    kontak_ig: 'Cito Adventure Madiun',
    background_url: '/default-bg.jpg',
    background_overlay_dim: 0.15,
    created_at: Date.now() - 50000,
    updated_at: Date.now() - 50000,
  },
  {
    id: 'sumbing-butuh',
    nama_gunung: 'Gunung Sumbing',
    ketinggian_mdpl: '3.371 MDPL',
    jalur: 'Via Butuh (Nepal Van Java)',
    status: 'Buka',
    tanggal_mulai: '2026-09-17',
    tanggal_selesai: '2026-09-19',
    durasi: '3 Hari 2 Malam',
    min_peserta: '12',
    max_peserta: '25',
    harga_mepo: [
      { lokasi: 'Basecamp Butuh', harga: 'IDR 650.000' },
      { lokasi: 'Terminal Magelang', harga: 'IDR 750.000' },
      { lokasi: 'Stasiun Tugu Solo / Jogja', harga: 'IDR 850.000' },
      { lokasi: 'Madiun', harga: 'IDR 800.000' }
    ],
    include: [
      'Transportasi PP lokal sesuai mepo',
      'Tiket Simaksi resmi Taman Nasional',
      'Tenda & Matras camping',
      'Makan 5x selama pendakian di gunung',
      'Peralatan masak & gas',
      'Porter tenda & logistik bersama',
      'Guide ramah & berlisensi Cito Adventure',
      'P3K darurat & dokumentasi'
    ],
    exclude: [
      'Ojek Nepal van Java ke batas ladang (opsional)',
      'Sleeping bag & pakaian hangat pribadi',
      'Pengeluaran pribadi'
    ],
    extra_porter: 'Rp 350.000 / hari jika butuh porter beban pribadi',
    sk_berlaku: [
      'Peserta dinyatakan fix setelah membayar DP 50%',
      'Sehat jasmani dan rohani',
      'Patuhi kode etik pencinta alam dan arahan guide'
    ],
    catatan_penting: 'Jalur Butuh terkenal dengan keindahan pedesaan Nepal Van Java. Harap siapkan jas hujan dan pakaian ganti kedap air dalam plastik.',
    itinerary: generateDefaultItinerary('Gunung Sumbing', 'Via Butuh', '2026-09-17', '2026-09-19'),
    kontak_wa: '+6282230444428',
    kontak_ig: 'Cito Adventure Madiun',
    created_at: Date.now() - 200000,
    updated_at: Date.now() - 200000,
  },
  {
    id: 'merbabu-suwanting',
    nama_gunung: 'Gunung Merbabu',
    ketinggian_mdpl: '3.145 MDPL',
    jalur: 'Via Suwanting',
    status: 'Tutup',
    tanggal_mulai: '2026-08-20',
    tanggal_selesai: '2026-08-21',
    durasi: '2 Hari 1 Malam',
    min_peserta: '15',
    max_peserta: '25',
    harga_mepo: [
      { lokasi: 'Basecamp Suwanting', harga: 'IDR 550.000' },
      { lokasi: 'Stasiun Solo Balapan', harga: 'IDR 700.000' },
      { lokasi: 'Terminal Madiun', harga: 'IDR 650.000' }
    ],
    include: [
      'Simaksi & booking online Merbabu',
      'Transportasi PP mepo',
      'Tenda dome + matras',
      'Makan 3x',
      'Guide & Porter kelompok',
      'Dokumentasi'
    ],
    exclude: [
      'Sleeping bag & carrier',
      'Logistik snack pribadi'
    ],
    extra_porter: 'Rp 300.000 / hari',
    sk_berlaku: [
      'Pendaftaran ditutup H-7 atau jika kuota simaksi habis',
      'Wajib membawa identitas KTP/SIM asli'
    ],
    catatan_penting: 'Jalur Suwanting memiliki trek menanjak yang konstan dengan pemandangan sabana yang luar biasa.',
    itinerary: generateDefaultItinerary('Gunung Merbabu', 'Via Suwanting', '2026-08-20', '2026-08-21'),
    kontak_wa: '+6282230444428',
    kontak_ig: 'Cito Adventure Madiun',
    created_at: Date.now() - 300000,
    updated_at: Date.now() - 300000,
  }
];

// In-memory cache for ultra-fast synchronous access
let memoryCustomLogo: string | null = null;
let memoryTrips: Trip[] | null = null;

// Initialize memory cache from localStorage immediately
try {
  memoryCustomLogo = localStorage.getItem(CUSTOM_LOGO_KEY);
} catch {
  // localStorage may be unavailable/restricted
}

// Asynchronously load from IndexedDB (handles larger capacity without quota limits)
if (typeof window !== 'undefined') {
  idbGet<string>(CUSTOM_LOGO_KEY).then((idbLogo) => {
    if (idbLogo) {
      const changed = idbLogo !== memoryCustomLogo;
      memoryCustomLogo = idbLogo;
      if (changed) {
        window.dispatchEvent(new Event('cito_logo_updated'));
      }
    }
  });

  idbGet<Trip[]>(STORAGE_KEY).then((idbTrips) => {
    if (Array.isArray(idbTrips) && idbTrips.length > 0) {
      memoryTrips = idbTrips;
    }
  });
}

export function getStoredTrips(): Trip[] {
  if (memoryTrips && memoryTrips.length > 0) {
    return memoryTrips;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRIPS));
      } catch {
        // ignore quota
      }
      memoryTrips = INITIAL_TRIPS;
      idbSet(STORAGE_KEY, INITIAL_TRIPS);
      return INITIAL_TRIPS;
    }
    const parsed = JSON.parse(raw);
    const result = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TRIPS;
    memoryTrips = result;
    return result;
  } catch {
    memoryTrips = INITIAL_TRIPS;
    return INITIAL_TRIPS;
  }
}

export function saveStoredTrips(trips: Trip[]): void {
  memoryTrips = trips;
  // Always persist to IndexedDB (virtually unlimited quota for rich trip data)
  idbSet(STORAGE_KEY, trips);

  // Also try to persist to localStorage for compatibility, handling quota safely
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.warn('localStorage quota reached for trips; securely saved in IndexedDB and memory instead.', err);
  }
}

export function getCustomLogo(): string | null {
  if (memoryCustomLogo) {
    return memoryCustomLogo;
  }
  try {
    const local = localStorage.getItem(CUSTOM_LOGO_KEY);
    if (local) {
      memoryCustomLogo = local;
      return local;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setCustomLogo(dataUrl: string): void {
  memoryCustomLogo = dataUrl;

  // Always save to IndexedDB (no 5MB quota constraint)
  idbSet(CUSTOM_LOGO_KEY, dataUrl);

  // Try to save to localStorage as a fallback, gracefully catching QuotaExceededError
  try {
    localStorage.setItem(CUSTOM_LOGO_KEY, dataUrl);
  } catch (err) {
    console.warn('localStorage quota reached for custom logo; securely stored in IndexedDB and memory instead.', err);
    // Remove stale/corrupted key to avoid repeated quota errors
    try {
      localStorage.removeItem(CUSTOM_LOGO_KEY);
    } catch {
      // ignore
    }
  }

  // Notify components and pamphlets immediately
  window.dispatchEvent(new Event('cito_logo_updated'));
}

export function clearCustomLogo(): void {
  memoryCustomLogo = null;
  idbDelete(CUSTOM_LOGO_KEY);
  try {
    localStorage.removeItem(CUSTOM_LOGO_KEY);
  } catch (err) {
    console.warn('Failed to clear custom logo from localStorage', err);
  }
  window.dispatchEvent(new Event('cito_logo_updated'));
}
