import { Trip } from '../types';
import { formatDateRange } from './formatters';
import { getCustomLogo } from './storage';
import {
  drawWhatsAppIcon,
  drawInstagramIcon,
  drawCalendarDurationIcon,
  drawGroupPesertaIcon,
  drawYukGasssGraphic,
} from './canvasIcons';
import JSZip from 'jszip';

export type SlideType = 'cover' | 'facilities' | 'itinerary' | 'notes' | 'contact';

export interface SlideOption {
  id: SlideType;
  title: string;
  subtitle: string;
}

export const SLIDES_LIST: SlideOption[] = [
  { id: 'cover', title: 'Slide 1: Cover Trip', subtitle: 'Judul, jalur, harga mulai, mepo & booking bar' },
  { id: 'facilities', title: 'Slide 2: Fasilitas & S&K', subtitle: 'Include, Exclude, Porter, dan Syarat Ketentuan' },
  { id: 'itinerary', title: 'Slide 3: Itinerary Rundown', subtitle: 'Jadwal kegiatan terstruktur per hari' },
  { id: 'notes', title: 'Slide 4: Catatan Penting', subtitle: 'Persiapan fisik dan peringatan olahraga' },
  { id: 'contact', title: 'Slide 5: Info Lanjut', subtitle: 'Penutup & ajakan cek caption Instagram' },
];

export const PRESET_BACKGROUNDS = [
  {
    id: 'sindoro',
    name: 'Sindoro Meadow (Default)',
    url: '/default-bg.jpg',
  },
  {
    id: 'nature_green',
    name: 'Gunung & Awan Biru',
    url: '/default-bg.jpg',
  },
];

// Helper to safely load images
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: try without crossOrigin or reject
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = (e) => reject(e);
      fallback.src = src;
    };
    img.src = src;
  });
}

// Draw image covering the entire canvas (CSS object-fit: cover)
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let renderW = w;
  let renderH = h;
  let offsetX = x;
  let offsetY = y;

  if (imgRatio > canvasRatio) {
    renderW = h * imgRatio;
    offsetX = x - (renderW - w) / 2;
  } else {
    renderH = w / imgRatio;
    offsetY = y - (renderH - h) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: 'left' | 'center' = 'left'
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (align === 'center') {
        ctx.textAlign = 'center';
        ctx.fillText(line.trim(), x, currentY);
        ctx.textAlign = 'left';
      } else {
        ctx.fillText(line.trim(), x, currentY);
      }
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (align === 'center') {
    ctx.textAlign = 'center';
    ctx.fillText(line.trim(), x, currentY);
    ctx.textAlign = 'left';
  } else {
    ctx.fillText(line.trim(), x, currentY);
  }
  return currentY + lineHeight;
}

// Draw Floating Bottom Booking Bar exactly matching the user screenshot
function drawBottomBookingBar(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  trip: Trip
) {
  const barW = Math.min(canvasW - 120, 920);
  const barH = 82;
  const barX = (canvasW - barW) / 2;
  const barY = canvasH - barH - 52;
  const radius = barH / 2;

  ctx.save();
  // Pill shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;

  // White pill background
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, barX, barY, barW, barH, radius, true, false);
  ctx.restore();

  // Left Yellow Arrow Circle
  const circleRadius = 31;
  const circleX = barX + 41;
  const circleY = barY + barH / 2;

  ctx.save();
  ctx.fillStyle = '#F59E0B'; // Vibrant amber yellow
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw arrow ➔
  ctx.fillStyle = '#000000';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('➔', circleX + 1, circleY);
  ctx.restore();

  // Label "BOOKING NOW"
  let textX = circleX + circleRadius + 22;
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 21px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('BOOKING NOW', textX, barY + barH / 2);

  // Divider or WhatsApp Section
  const waNumber = trip.kontak_wa || '+6282230444428';
  const igHandle = trip.kontak_ig || 'CITO ADVENTURE MADIUN';

  // WhatsApp Pill/Icon (Matches 1.png) - Bold, sharp, clearly visible
  const waX = barX + barW * 0.42;
  drawWhatsAppIcon(ctx, waX, barY + barH / 2, 34, '#0F172A');

  // WA text
  ctx.save();
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 18px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(waNumber, waX + 24, barY + barH / 2);

  // Instagram section (Matches 2.png) - Official squircle and lens
  const igX = barX + barW * 0.72;
  drawInstagramIcon(ctx, igX, barY + barH / 2, 32, '#0F172A');

  // IG text
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 16px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const cleanIg = igHandle.replace(/^@/, '').toUpperCase();
  ctx.fillText(cleanIg, igX + 22, barY + barH / 2);
  ctx.restore();
}

// Base Canvas Renderer with Background and Dimming Overlay
async function prepareBaseCanvas(
  width: number,
  height: number,
  bgUrl?: string,
  dimRatio: number = 0.2
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Load Background Image
  const targetBg = bgUrl || '/default-bg.jpg';
  try {
    const bgImg = await loadImage(targetBg);
    drawImageCover(ctx, bgImg, 0, 0, width, height);
  } catch (err) {
    console.warn('Failed to load custom bg image, rendering fallback gradient', err);
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#194220');
    grad.addColorStop(0.5, '#275D1D');
    grad.addColorStop(1, '#0F260C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Dark Dimming Overlay for contrast
  const effectiveDim = Math.max(0, Math.min(0.8, dimRatio));
  if (effectiveDim > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${effectiveDim})`;
    ctx.fillRect(0, 0, width, height);
  }

  return { canvas, ctx };
}

// ==========================================
// SLIDE 1: COVER (Exactly matching 1.png)
// ==========================================
async function renderCoverSlide(
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.15
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = ratio === '4:5' ? 1350 : 1920;
  const { canvas, ctx } = await prepareBaseCanvas(width, height, bgUrl, dimRatio);

  // 1. Top Left: Stylized "Yuk Gasss Mendaki Offline" sticker graphic matching Desain tanpa judul (1).png
  drawYukGasssGraphic(ctx, 115, 100, 1.05);

  // 2. Top Right: Cito Adventure Logo + Text (Supports user uploaded custom logo)
  try {
    const activeLogoUrl = trip.logo_url || getCustomLogo() || '/logo.png';
    const logoImg = await loadImage(activeLogoUrl);
    const logoW = 110;
    const logoH = 102;
    const logoX = width - logoW - 70;
    const logoY = 50;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 13px "Montserrat", "Space Grotesk", sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.textAlign = 'center';
    ctx.fillText('CITO ADVENTURE TRIP', logoX + logoW / 2, logoY + logoH + 18);
    ctx.restore();
  } catch (e) {
    console.warn('Could not load logo for cover slide', e);
  }

  // 3. Mountain Title & Jalur (Center)
  const isRatio916 = ratio === '9:16';
  const titleY = isRatio916 ? 440 : 320;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;

  const mtnName = (trip.nama_gunung || 'GUNUNG SINDORO').toUpperCase();
  const mtnFullName = mtnName.startsWith('GUNUNG') ? mtnName : `GUNUNG ${mtnName}`;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 66px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(mtnFullName, width / 2, titleY);

  const jalurText = (trip.jalur || 'VIA BASECAMP').toUpperCase();
  const fullJalur = jalurText.startsWith('VIA') ? jalurText : `VIA ${jalurText}`;
  ctx.font = '800 38px "Montserrat", "Space Grotesk", sans-serif';
  ctx.fillText(fullJalur, width / 2, titleY + 68);
  ctx.restore();

  // 4. Lower Pricing & Meeting Points Section
  const priceY = isRatio916 ? 1240 : 800;

  // "Start from" label
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 24px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Start from', width / 2, priceY);

  // Price Pill: "IDR 600.000"
  const startPrice = trip.harga_mepo && trip.harga_mepo.length > 0 && trip.harga_mepo[0].harga
    ? trip.harga_mepo[0].harga
    : 'IDR 600.000';
  const formattedPrice = startPrice.toLowerCase().includes('idr') || startPrice.toLowerCase().includes('rp')
    ? startPrice.toUpperCase()
    : `IDR ${startPrice}`;

  const pricePillW = 420;
  const pricePillH = 92;
  const pricePillX = (width - pricePillW) / 2;
  const pricePillY = priceY + 22;

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  roundRect(ctx, pricePillX, pricePillY, pricePillW, pricePillH, pricePillH / 2, true, true);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 44px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(formattedPrice, width / 2, pricePillY + pricePillH / 2);
  ctx.restore();

  // Meeting Points Pill: "Jakarta - Solo - Madiun - Basecamp"
  const mepoList = trip.harga_mepo && trip.harga_mepo.length > 0
    ? trip.harga_mepo.map((m) => m.lokasi || 'Basecamp').join(' - ')
    : 'Jakarta - Solo - Madiun - Basecamp';

  const mepoPillW = Math.min(width - 160, 720);
  const mepoPillH = 60;
  const mepoPillX = (width - mepoPillW) / 2;
  const mepoPillY = pricePillY + pricePillH + 24;

  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  roundRect(ctx, mepoPillX, mepoPillY, mepoPillW, mepoPillH, mepoPillH / 2, true, true);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mepoList, width / 2, mepoPillY + mepoPillH / 2);
  ctx.restore();

  // 5. Metadata line: Clock + Duration, User + Min Pax
  const metaY = mepoPillY + mepoPillH + 42;
  const durasiText = trip.durasi || '2 Hari 1 Malam';
  const kuotaText = `Min ${trip.min_peserta || 15} Pax Peserta`;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';

  // Duration: Calendar with clock icon (Matches 4.png)
  const durX = width / 2 - 186;
  drawCalendarDurationIcon(ctx, durX - 18, metaY, 26, '#FFFFFF');
  ctx.font = '800 19px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(durasiText, durX, metaY);

  // Kuota: 3-Person Group silhouette icon (Matches 3.png)
  const paxX = width / 2 + 46;
  drawGroupPesertaIcon(ctx, paxX - 18, metaY, 26, '#FFFFFF');
  ctx.font = '800 19px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(kuotaText, paxX, metaY);
  ctx.restore();

  // 6. Floating Bottom Booking Bar
  drawBottomBookingBar(ctx, width, height, trip);

  return canvas;
}

// =======================================================
// SLIDE 2: FASILITAS INCLUDE, EXCLUDE, S&K (Matches 2.png)
// =======================================================
async function renderFacilitiesSlide(
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.25
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = ratio === '4:5' ? 1350 : 1920;
  const { canvas, ctx } = await prepareBaseCanvas(width, height, bgUrl, dimRatio);

  const padX = 70;
  const cardY = 90;
  const isRatio916 = ratio === '9:16';
  const cardH = isRatio916 ? 1640 : 1100;
  const cardW = width - padX * 2;

  // Frosted Translucent Card
  ctx.save();
  ctx.fillStyle = 'rgba(12, 28, 18, 0.58)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  roundRect(ctx, padX, cardY, cardW, cardH, 28, true, true);
  ctx.restore();

  // Left Column (INCLUDE) & Right Column (EXCLUDE)
  const colLeftX = padX + 46;
  const colRightX = padX + cardW * 0.55;
  let curY = cardY + 58;

  // Header INCLUDE
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 30px "Montserrat", "Space Grotesk", sans-serif';
  ctx.fillText('INCLUDE', colLeftX, curY);

  // Header EXCLUDE
  ctx.fillText('EXCLUDE', colRightX, curY);
  curY += 46;

  // Include List (with icons)
  const defaultIncludes = [
    { icon: '🚌', text: 'Transportasi PP sesuai mepo' },
    { icon: '📝', text: 'Simaksi pendakian' },
    { icon: '🔆', text: 'Sarapan di basecamp' },
    { icon: '🛵', text: 'Ojek Basecamp - Pos 1' },
    { icon: '⛺', text: 'Tenda kelompok' },
    { icon: '👥', text: 'Tim Guide (pemandu bersertifikasi, porter & sweeper)' },
    { icon: '🍲', text: 'Makan selama pendakian' },
    { icon: '🍽️', text: 'Alat makan & masak' },
    { icon: '➕', text: 'P3K standard' },
    { icon: '📻', text: 'HT tim (alat komunikasi)' },
    { icon: '📷', text: 'Dokumentasi' },
    { icon: '▶️', text: 'Bonus masuk YT Cito Adventure Madiun' },
  ];

  const incList = trip.include && trip.include.length > 0
    ? trip.include.map((t, idx) => ({ icon: defaultIncludes[idx % defaultIncludes.length]?.icon || '✓', text: t }))
    : defaultIncludes;

  let incY = curY;
  const maxInc = isRatio916 ? 12 : 9;
  for (const item of incList.slice(0, maxInc)) {
    ctx.font = '700 20px sans-serif';
    ctx.fillText(item.icon, colLeftX, incY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 17px "Montserrat", "Plus Jakarta Sans", sans-serif';
    wrapText(ctx, item.text, colLeftX + 38, incY - 4, cardW * 0.48 - 45, 24);
    incY += isRatio916 ? 48 : 38;
  }

  // Exclude List (with X circle)
  const defaultExcludes = [
    'Obat-Obatan pribadi',
    'Logistik pribadi',
    'Surat sehat',
    'Perlengkapan pendakian yang tidak ada di daftar',
  ];
  const excList = trip.exclude && trip.exclude.length > 0 ? trip.exclude : defaultExcludes;

  let excY = curY;
  for (const item of excList.slice(0, 5)) {
    ctx.fillStyle = '#F87171';
    ctx.font = '700 18px sans-serif';
    ctx.fillText('🚫', colRightX, excY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 17px "Montserrat", "Plus Jakarta Sans", sans-serif';
    wrapText(ctx, item, colRightX + 34, excY - 4, cardW * 0.4 - 30, 24);
    excY += 46;
  }

  // EXTRA PORTER PRIBADI section
  excY += 20;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 21px "Montserrat", "Space Grotesk", sans-serif';
  ctx.fillText('EXTRA PORTER PRIBADI', colRightX, excY);
  excY += 30;

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(trip.extra_porter || 'Jika di perlukan', colRightX, excY);

  // S&K BERLAKU section
  const skYStart = Math.max(incY, excY) + (isRatio916 ? 34 : 20);
  let skY = skYStart;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px "Montserrat", "Space Grotesk", sans-serif';
  ctx.fillText('S&K BERLAKU', colLeftX, skY);
  skY += 38;

  const defaultSK = [
    'Peserta Untuk Umum (Sendiri Bisa Join)',
    `Minimal Peserta : ${trip.min_peserta || 15} Orang (apabila kuota tidak terpenuhi, akan ada penyesuaian biaya)`,
    'DP minimal Rp 200.000',
    'Pelunasan Maksimal H-5',
    'Pembatalan Oleh Peserta: DP Hangus',
    'Trip Sesuai Jadwal (Diluar Jadwal Tersedia Private Trip)',
  ];
  const skList = trip.sk_berlaku && trip.sk_berlaku.length > 0 ? trip.sk_berlaku : defaultSK;

  for (const sk of skList.slice(0, 6)) {
    ctx.fillStyle = '#34D399';
    ctx.font = '800 19px sans-serif';
    ctx.fillText('✓', colLeftX, skY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    wrapText(ctx, sk, colLeftX + 28, skY - 3, cardW - 60, 24);
    skY += isRatio916 ? 36 : 28;
  }

  // Floating Bottom Booking Bar
  drawBottomBookingBar(ctx, width, height, trip);

  return canvas;
}

// =======================================================
// SLIDE 3: ITINERARY RUNDOWN ("untuk itinerary menyesuaikan")
// =======================================================
async function renderItinerarySlide(
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.25
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = ratio === '4:5' ? 1350 : 1920;
  const { canvas, ctx } = await prepareBaseCanvas(width, height, bgUrl, dimRatio);

  const padX = 70;
  const isRatio916 = ratio === '9:16';
  const cardY = isRatio916 ? 120 : 80;
  const cardH = isRatio916 ? 1600 : 1120;
  const cardW = width - padX * 2;

  // Frosted Translucent Card
  ctx.save();
  ctx.fillStyle = 'rgba(12, 28, 18, 0.62)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  roundRect(ctx, padX, cardY, cardW, cardH, 28, true, true);
  ctx.restore();

  let curY = cardY + 54;

  // Header Title
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ITINERARY & RUNDOWN TRIP', width / 2, curY);

  curY += 44;
  const mtnName = (trip.nama_gunung || 'GUNUNG').toUpperCase();
  const jalurText = (trip.jalur || 'VIA BASECAMP').toUpperCase();
  ctx.font = '800 24px "Montserrat", "Space Grotesk", sans-serif';
  ctx.fillStyle = '#F59E0B'; // Amber accent
  ctx.fillText(`🏔️ ${mtnName} · 📌 ${jalurText}`, width / 2, curY);

  curY += 34;
  const dateRange = formatDateRange(trip.tanggal_mulai, trip.tanggal_selesai);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`📅 ${dateRange}   |   ⏱️ ${trip.durasi || '2 Hari 1 Malam'}`, width / 2, curY);
  ctx.restore();

  curY += 28;

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX + 40, curY);
  ctx.lineTo(width - padX - 40, curY);
  ctx.stroke();

  curY += 36;

  // Parse Itinerary Lines
  const rawItin = trip.itinerary || '';
  const lines = rawItin.split('\n').map((l) => l.trim()).filter(Boolean);
  const maxContentY = cardY + cardH - 120;

  for (const line of lines) {
    if (curY > maxContentY) break;

    const isDayHeader = line.toLowerCase().startsWith('hari ') || line.startsWith('🗓️') || line.toLowerCase().startsWith('h-');

    if (isDayHeader) {
      curY += 12;
      ctx.save();
      // Day Header Pill
      ctx.fillStyle = '#F59E0B';
      roundRect(ctx, padX + 36, curY - 24, cardW - 72, 38, 8, true, false);

      ctx.fillStyle = '#0F172A';
      ctx.font = '900 18px "Montserrat", "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(line.replace(/^[•\-\*\s]+/, ''), padX + 52, curY + 2);
      ctx.restore();
      curY += 36;
    } else {
      // Timeline item: check time pattern e.g. "07.00 - 08.00 : Activity"
      const match = line.match(/^([•\-\*]?\s*)?(\d{2}[.:]\d{2}(?:\s*-\s*(?:\d{2}[.:]\d{2}|selesai))?)\s*[:\-]?\s*(.*)$/i);
      if (match) {
        const timePart = match[2];
        const descPart = match[3];

        // Yellow Time Tag
        ctx.fillStyle = '#FBBF24';
        ctx.font = '800 16px "Montserrat", "Space Grotesk", sans-serif';
        ctx.fillText(timePart, padX + 46, curY);

        // White Description
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
        wrapText(ctx, descPart, padX + 210, curY, cardW - 250, 24);
        curY += 28;
      } else {
        ctx.fillStyle = '#F1F5F9';
        ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
        curY = wrapText(ctx, line, padX + 46, curY, cardW - 92, 24) + 4;
      }
    }
  }

  // Floating Bottom Booking Bar
  drawBottomBookingBar(ctx, width, height, trip);

  return canvas;
}

// =======================================================
// SLIDE 4: CATATAN PENTING (Matches 3.png)
// =======================================================
async function renderNotesSlide(
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.2
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = ratio === '4:5' ? 1350 : 1920;
  const { canvas, ctx } = await prepareBaseCanvas(width, height, bgUrl, dimRatio);

  const isRatio916 = ratio === '9:16';
  const headerY = isRatio916 ? 320 : 220;

  // 1. Warning Icon (Triangle with !)
  ctx.save();
  const iconX = width / 2;
  const iconY = headerY;

  // Yellow rounded triangle
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(iconX, iconY - 50);
  ctx.lineTo(iconX + 54, iconY + 36);
  ctx.lineTo(iconX - 54, iconY + 36);
  ctx.closePath();
  ctx.fill();

  // Black exclamation mark
  ctx.fillStyle = '#000000';
  ctx.font = '900 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', iconX, iconY + 6);
  ctx.restore();

  // 2. Title "CATATAN PENTING"
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = '#F59E0B';
  ctx.font = '900 56px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CATATAN', width / 2, headerY + 110);
  ctx.fillText('PENTING', width / 2, headerY + 172);
  ctx.restore();

  // 3. Frosted Translucent Card with advice
  const cardW = width - 160;
  const cardH = isRatio916 ? 480 : 380;
  const cardX = (width - cardW) / 2;
  const cardY = headerY + 230;

  ctx.save();
  ctx.fillStyle = 'rgba(12, 28, 18, 0.62)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28, true, true);
  ctx.restore();

  // Card Content Top
  const defaultNote1 =
    'SEBELUM MENDAKI, SANGAT DISARANKAN UNTUK RUTIN BEROLAHRAGA SEPERTI JOGGING, HIKING RINGAN, ATAU LATIHAN KARDIO MINIMAL 1-2 MINGGU SEBELUMNYA.';
  const defaultNote2 =
    'MULAILAH DARI LATIHAN RINGAN, TINGKATKAN INTENSITASNYA, DAN PASTIKAN KONDISI TUBUH BENAR-BENAR SIAP';

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';

  const noteTopY = cardY + 70;
  wrapText(ctx, trip.catatan_penting || defaultNote1, width / 2, noteTopY, cardW - 80, 36, 'center');

  // Divider line inside card
  const divY = cardY + cardH * 0.58;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 60, divY);
  ctx.lineTo(cardX + cardW - 60, divY);
  ctx.stroke();

  // Card Content Bottom
  const noteBottomY = divY + 44;
  ctx.font = '800 20px "Montserrat", "Space Grotesk", sans-serif';
  wrapText(ctx, defaultNote2, width / 2, noteBottomY, cardW - 80, 32, 'center');
  ctx.restore();

  // Floating Bottom Booking Bar
  drawBottomBookingBar(ctx, width, height, trip);

  return canvas;
}

// =======================================================
// SLIDE 5: INFORMASI LEBIH LANJUT / CLOSING (Matches 4.png)
// =======================================================
async function renderContactSlide(
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.2
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = ratio === '4:5' ? 1350 : 1920;
  const { canvas, ctx } = await prepareBaseCanvas(width, height, bgUrl, dimRatio);

  const isRatio916 = ratio === '9:16';
  const cardW = width - 180;
  const cardH = isRatio916 ? 480 : 380;
  const cardX = (width - cardW) / 2;
  const cardY = isRatio916 ? 680 : 420;

  // Draw Cito Adventure Logo above card (Supports user uploaded custom logo)
  try {
    const activeLogoUrl = trip.logo_url || getCustomLogo() || '/logo.png';
    const logoImg = await loadImage(activeLogoUrl);
    const logoSize = isRatio916 ? 160 : 130;
    const logoX = (width - logoSize) / 2;
    const logoY = cardY - logoSize - (isRatio916 ? 30 : 20);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 16;
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();
  } catch (e) {
    console.warn('Could not load logo for contact slide', e);
  }

  // Frosted Translucent Card
  ctx.save();
  ctx.fillStyle = 'rgba(12, 28, 18, 0.65)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28, true, true);
  ctx.restore();

  // Pill Outline: "Informasi Lebih Lanjut"
  const pillW = 460;
  const pillH = 74;
  const pillX = (width - pillW) / 2;
  const pillY = cardY + 50;

  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, true, true);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Informasi Lebih Lanjut', width / 2, pillY + pillH / 2);
  ctx.restore();

  // Contact items: WhatsApp (1.png) & Instagram (2.png)
  const contactY = pillY + pillH + 60;
  const waNumber = trip.kontak_wa || '+6282230444428';
  const igHandle = (trip.kontak_ig || 'CITO ADVENTURE MADIUN').replace(/^@/, '').toUpperCase();

  ctx.save();
  // WhatsApp
  const waLeftX = cardX + 55;
  drawWhatsAppIcon(ctx, waLeftX + 22, contactY + 8, 44, '#FFFFFF');

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Chat Whatsapp', waLeftX + 60, contactY - 8);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px "Montserrat", "Space Grotesk", sans-serif';
  ctx.fillText(waNumber, waLeftX + 60, contactY + 22);

  // Instagram
  const igLeftX = cardX + cardW * 0.53;
  drawInstagramIcon(ctx, igLeftX + 22, contactY + 8, 44, '#FFFFFF');

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DM Instagram', igLeftX + 60, contactY - 8);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 20px "Montserrat", "Space Grotesk", sans-serif';
  ctx.fillText(igHandle, igLeftX + 60, contactY + 22);
  ctx.restore();

  // "Detail trip cek di caption"
  const captionMsgY = contactY + 88;
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Montserrat", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('"Detail trip cek di caption"', width / 2, captionMsgY);

  // Down Arrow ⬇
  ctx.font = '900 38px sans-serif';
  ctx.fillText('⬇', width / 2, captionMsgY + 54);
  ctx.restore();

  // Floating Bottom Booking Bar
  drawBottomBookingBar(ctx, width, height, trip);

  return canvas;
}

// Master Slide Renderer Dispatcher
export async function renderSlideCanvas(
  slideType: SlideType,
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.2
): Promise<HTMLCanvasElement> {
  switch (slideType) {
    case 'cover':
      return renderCoverSlide(trip, ratio, bgUrl, dimRatio);
    case 'facilities':
      return renderFacilitiesSlide(trip, ratio, bgUrl, dimRatio);
    case 'itinerary':
      return renderItinerarySlide(trip, ratio, bgUrl, dimRatio);
    case 'notes':
      return renderNotesSlide(trip, ratio, bgUrl, dimRatio);
    case 'contact':
      return renderContactSlide(trip, ratio, bgUrl, dimRatio);
    default:
      return renderCoverSlide(trip, ratio, bgUrl, dimRatio);
  }
}

// Download a single slide as PNG
export async function exportSlidePNG(
  slideType: SlideType,
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.2
): Promise<void> {
  const canvas = await renderSlideCanvas(slideType, trip, ratio, bgUrl, dimRatio);
  const cleanMtn = trip.nama_gunung.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanRatio = ratio.replace(':', 'x');
  const filename = `${slideType}-${cleanMtn}-${cleanRatio}.png`;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, 'image/png');
  });
}

// Download ALL 5 Carousel Slides as a convenient ZIP package!
export async function exportAllSlidesZip(
  trip: Trip,
  ratio: '4:5' | '9:16',
  bgUrl?: string,
  dimRatio: number = 0.2
): Promise<void> {
  const zip = new JSZip();
  const cleanMtn = trip.nama_gunung.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanRatio = ratio.replace(':', 'x');

  for (let idx = 0; idx < SLIDES_LIST.length; idx++) {
    const slide = SLIDES_LIST[idx];
    const canvas = await renderSlideCanvas(slide.id, trip, ratio, bgUrl, dimRatio);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      zip.file(`slide-${idx + 1}-${slide.id}-${cleanMtn}-${cleanRatio}.png`, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carousel-${cleanMtn}-${cleanRatio}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Backward Compatibility Wrappers
export async function exportTripPamphletPNG(trip: Trip, ratio: '4:5' | '9:16'): Promise<void> {
  return exportSlidePNG('cover', trip, ratio, trip.background_url, trip.background_overlay_dim ?? 0.2);
}

export async function exportItineraryPosterPNG(trip: Trip, ratio: '4:5' | '9:16'): Promise<void> {
  return exportSlidePNG('itinerary', trip, ratio, trip.background_url, trip.background_overlay_dim ?? 0.2);
}
