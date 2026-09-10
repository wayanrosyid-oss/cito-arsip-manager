import { Trip } from '../types';

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatDateID(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0])) return dateStr;
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];
  return `${day} ${MONTH_NAMES_ID[month] || ''} ${year}`;
}

export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr && !endDateStr) return '';
  if (startDateStr && !endDateStr) return formatDateID(startDateStr);
  if (!startDateStr && endDateStr) return formatDateID(endDateStr);
  if (startDateStr === endDateStr) return formatDateID(startDateStr);

  const startParts = startDateStr.split('-').map(Number);
  const endParts = endDateStr.split('-').map(Number);

  const sYear = startParts[0];
  const sMonth = startParts[1] - 1;
  const sDay = startParts[2];

  const eYear = endParts[0];
  const eMonth = endParts[1] - 1;
  const eDay = endParts[2];

  // Same month & year: "10 – 11 September 2026"
  if (sYear === eYear && sMonth === eMonth) {
    return `${sDay} – ${eDay} ${MONTH_NAMES_ID[sMonth]} ${sYear}`;
  }

  // Same year, different month: "30 September – 2 Oktober 2026"
  if (sYear === eYear) {
    return `${sDay} ${MONTH_NAMES_ID[sMonth]} – ${eDay} ${MONTH_NAMES_ID[eMonth]} ${sYear}`;
  }

  // Different year
  return `${sDay} ${MONTH_NAMES_ID[sMonth]} ${sYear} – ${eDay} ${MONTH_NAMES_ID[eMonth]} ${eYear}`;
}

export function calculateDuration(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '2 Hari 1 Malam';

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Tanggal tidak valid';
  if (diffDays === 0) return '1 Hari (Tektok)';
  
  const totalDays = diffDays + 1;
  const totalNights = diffDays;
  return `${totalDays} Hari ${totalNights} Malam`;
}

export function generateDefaultItinerary(
  mountainName: string,
  jalur: string,
  startDateStr: string,
  endDateStr: string
): string {
  const cleanMtn = mountainName || 'Gunung';
  const cleanJalur = jalur || 'Basecamp';
  
  const sDate = startDateStr ? new Date(startDateStr) : new Date();
  const eDate = endDateStr ? new Date(endDateStr) : new Date(sDate.getTime() + 86400000);

  // H-1 (Day 0)
  const hMinus1 = new Date(sDate);
  hMinus1.setDate(hMinus1.getDate() - 1);
  const hMinus1Str = formatDateID(hMinus1.toISOString().split('T')[0]);
  const day1Str = formatDateID(sDate.toISOString().split('T')[0]);
  const day2Str = formatDateID(eDate.toISOString().split('T')[0]);

  return `🗓️ ITINERARY PENDAKIAN ${cleanMtn.toUpperCase()} ${cleanJalur.toUpperCase()}

Hari 0 (H-1) - ${hMinus1Str}:
• 19.00 - 21.00 : Kumpul di meeting point (penjemputan peserta)
• 21.00 - selesai : Perjalanan malam menuju basecamp

Hari 1 - ${day1Str}:
• 07.00 - 09.00 : Tiba di basecamp, istirahat, sarapan & briefing
• 09.30 - 15.30 : Mulai pendakian menuju area camp
• 16.00 - 18.00 : Pasang tenda & nikmati sunset
• 19.00 - 21.00 : Makan malam hangat bersama & istirahat

Hari 2 - ${day2Str}:
• 03.00 - 06.00 : Summit attack berburu sunrise
• 06.00 - 08.00 : Puncak ${cleanMtn}, selebrasi & sesi foto dokumentasi
• 08.30 - 10.30 : Turun kembali ke camp area & sarapan
• 11.30 - 15.00 : Perjalanan turun ke basecamp
• 15.30 - 17.00 : Bersih-bersih & persiapan pulang
• 17.00 - selesai : Perjalanan kembali ke meeting point masing-masing`;
}

export function generateMountainHashtags(mountainName: string, height: string): string[] {
  // Convert "Gunung Sindoro" -> "gunungsindoro"
  const mtnSlug = mountainName.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Height digits only: "3.153 MDPL" -> "3153mdpl"
  const heightDigits = height.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const tags: string[] = [];
  if (mtnSlug) {
    tags.push(`#${mtnSlug}`);
    if (heightDigits) {
      tags.push(`#${mtnSlug}${heightDigits}`);
    }
  }
  return tags;
}

export function generateInstagramCaption(trip: Trip): string {
  const mtnUpper = (trip.nama_gunung || 'GUNUNG').toUpperCase();
  const heightUpper = (trip.ketinggian_mdpl || '').toUpperCase();
  const jalurUpper = (trip.jalur || 'VIA BASECAMP').toUpperCase();
  const statusStr = trip.status || 'Buka';

  const titleLine = heightUpper ? `🏔 ${mtnUpper} ${heightUpper}` : `🏔 ${mtnUpper}`;
  const jalurLine = `📌 ${jalurUpper}`;
  const statusLine = `📍 Status: ${statusStr}`;

  const dateRangeStr = formatDateRange(trip.tanggal_mulai, trip.tanggal_selesai);
  const durasiStr = trip.durasi || '2 Hari 1 Malam';
  const pesertaStr = trip.min_peserta && trip.max_peserta
    ? `${trip.min_peserta} – ${trip.max_peserta} pax`
    : (trip.min_peserta ? `Min ${trip.min_peserta} pax` : (trip.max_peserta ? `Maks ${trip.max_peserta} pax` : 'Sesuai kuota'));

  const mepoList = (trip.harga_mepo || [])
    .filter(m => m.lokasi || m.harga)
    .map(m => `- ${m.lokasi || 'Meeting Point'}: ${m.harga || 'Hubungi Admin'}`)
    .join('\n');

  const mtnTags = generateMountainHashtags(trip.nama_gunung, trip.ketinggian_mdpl);
  const mtnTagString = mtnTags.length > 0 ? ` ${mtnTags.join(' ')}` : '';
  const allHashtags = `#opentrip #opentripcito${mtnTagString} #citoadventuremadiun #citoadventuretrip`;

  return `${titleLine}
${jalurLine}
${statusLine}

📅 Tanggal: ${dateRangeStr}
🕒 Durasi: ${durasiStr}
👥 Kuota: ${pesertaStr}
(Catatan: Jika peserta kurang akan ada penyesuaian harga)

💰 HARGA PER MEETING POINT:
${mepoList || '- Hubungi admin untuk tarif meeting point'}

📄 Detail Include, Exclude, Itinerary & S&K lengkap silakan cek di pamflet postingan ya!

📲 Informasi & Booking:
WhatsApp: ${trip.kontak_wa || '+6282230444428'}
Instagram: ${trip.kontak_ig || 'Cito Adventure Madiun'}

${allHashtags}`;
}
