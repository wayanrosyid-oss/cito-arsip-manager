// Exact vector drawing helpers matching user uploaded assets (1.png, 2.png, 3.png, 4.png, Desain tanpa judul (1).png)

/**
 * Official vector path for WhatsApp (Matches 1.png exactly).
 * Formatted in 16x16 coordinate space.
 */
const WHATSAPP_SVG_PATH =
  'M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232';

let whatsappPathCache: Path2D | null = null;
function getWhatsAppPath(): Path2D {
  if (!whatsappPathCache && typeof Path2D !== 'undefined') {
    whatsappPathCache = new Path2D(WHATSAPP_SVG_PATH);
  }
  return whatsappPathCache!;
}

/**
 * Official vector path for Instagram (Matches 2.png exactly).
 * Formatted in 16x16 coordinate space.
 */
const INSTAGRAM_SVG_PATH =
  'M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334';

let instagramPathCache: Path2D | null = null;
function getInstagramPath(): Path2D {
  if (!instagramPathCache && typeof Path2D !== 'undefined') {
    instagramPathCache = new Path2D(INSTAGRAM_SVG_PATH);
  }
  return instagramPathCache!;
}

/**
 * 1. WhatsApp Logo (Matches 1.png):
 * Speech bubble with pointer at bottom-left and bold, classic telephone handset inside.
 * Rendered using authentic vector geometry with crisp, razor-sharp outlines at any scale.
 */
export function drawWhatsAppIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#0F172A'
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Normalize 16x16 coordinate space centered at (0, 0)
  const scale = size / 16;
  ctx.scale(scale, scale);
  ctx.translate(-8, -8);

  ctx.fillStyle = color;
  const path = getWhatsAppPath();
  if (path) {
    ctx.fill(path);
  }
  ctx.restore();
}

/**
 * 2. Instagram Logo (Matches 2.png):
 * Official squircle contour, center camera lens ring, and flash dot.
 * Rendered using authentic vector geometry with crisp, razor-sharp outlines at any scale.
 */
export function drawInstagramIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#0F172A'
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Normalize 16x16 coordinate space centered at (0, 0)
  const scale = size / 16;
  ctx.scale(scale, scale);
  ctx.translate(-8, -8);

  ctx.fillStyle = color;
  const path = getInstagramPath();
  if (path) {
    ctx.fill(path);
  }
  ctx.restore();
}

/**
 * 3. Calendar with Clock Icon (Matches 4.png):
 * Used for trip duration (e.g. 2 Hari 1 Malam).
 * Rounded calendar with 2 rings, header divider, day grid, and clock in lower-right corner.
 */
export function drawCalendarDurationIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#FFFFFF'
) {
  ctx.save();
  ctx.translate(cx, cy);

  const scale = size / 28;
  ctx.scale(scale, scale);
  ctx.translate(-14, -14);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Calendar main rounded rectangle
  const r = 3.5;
  ctx.beginPath();
  ctx.moveTo(3 + r, 5);
  ctx.lineTo(23 - r, 5);
  ctx.quadraticCurveTo(23, 5, 23, 5 + r);
  ctx.lineTo(23, 17); // Leaves space for bottom-right clock
  ctx.lineTo(15, 17);
  ctx.lineTo(15, 25);
  ctx.lineTo(3 + r, 25);
  ctx.quadraticCurveTo(3, 25, 3, 25 - r);
  ctx.lineTo(3, 5 + r);
  ctx.quadraticCurveTo(3, 5, 3 + r, 5);
  ctx.closePath();
  ctx.stroke();

  // Top 2 binder rings
  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.lineTo(8, 6.5);
  ctx.moveTo(18, 2);
  ctx.lineTo(18, 6.5);
  ctx.stroke();

  // Horizontal divider
  ctx.beginPath();
  ctx.moveTo(3, 10.5);
  ctx.lineTo(23, 10.5);
  ctx.stroke();

  // Grid squares inside calendar
  const dayPoints = [
    [6.5, 13.5], [10.5, 13.5], [14.5, 13.5], [18.5, 13.5],
    [6.5, 17.5], [10.5, 17.5],
    [6.5, 21.5], [10.5, 21.5]
  ];
  for (const [x, y] of dayPoints) {
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }

  // Clock in bottom-right corner
  const clockX = 20;
  const clockY = 20;
  const clockR = 6.2;

  // Background circle for clock to punch out calendar lines
  ctx.save();
  ctx.fillStyle = '#1e3822'; // Dark tone matching poster shadow
  ctx.beginPath();
  ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Clock outline
  ctx.beginPath();
  ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
  ctx.stroke();

  // Clock hands: 12 (up) and 3 (right)
  ctx.beginPath();
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX, clockY - 3.8); // Up
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX + 3.2, clockY); // Right
  ctx.stroke();

  ctx.restore();
}

/**
 * 4. 3-Person Silhouette Group Icon (Matches 3.png):
 * Used for min/max kuota peserta (e.g. Min 15 Pax Peserta).
 * Solid silhouettes: Center leader and two flanking companions behind.
 */
export function drawGroupPesertaIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#FFFFFF'
) {
  ctx.save();
  ctx.translate(cx, cy);

  const scale = size / 28;
  ctx.scale(scale, scale);
  ctx.translate(-14, -14);

  ctx.fillStyle = color;

  // Left person (behind)
  ctx.beginPath();
  ctx.arc(6.5, 8.5, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(1.5, 23);
  ctx.quadraticCurveTo(1.5, 15, 9.5, 15);
  ctx.lineTo(10.5, 17.5);
  ctx.lineTo(3.5, 23);
  ctx.closePath();
  ctx.fill();

  // Right person (behind)
  ctx.beginPath();
  ctx.arc(21.5, 8.5, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(26.5, 23);
  ctx.quadraticCurveTo(26.5, 15, 18.5, 15);
  ctx.lineTo(17.5, 17.5);
  ctx.lineTo(24.5, 23);
  ctx.closePath();
  ctx.fill();

  // Center person (front & prominent)
  ctx.beginPath();
  ctx.arc(14, 6.5, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(7, 24);
  ctx.quadraticCurveTo(7, 13.5, 14, 13.5);
  ctx.quadraticCurveTo(21, 13.5, 21, 24);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 5. "Yuk Gasss" Sticker Graphic (Matches Desain tanpa judul (1).png):
 * Angled sticker text "Yuk Gasss" with 3 action radiating lines on left and right,
 * soft diffused shadow, and "Mendaki Offline" script underneath.
 */
export function drawYukGasssGraphic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleFactor: number = 1.0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-14 * Math.PI) / 180); // Tilted -14 degrees matching user asset
  ctx.scale(scaleFactor, scaleFactor);

  // Soft diffused glow / shadow behind
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;

  // Draw 3 radiating speed lines on the Left of "Yuk"
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  // Top ray angled upward-left
  ctx.moveTo(-18, -12);
  ctx.lineTo(-32, -19);
  // Middle ray horizontal-left
  ctx.moveTo(-22, -2);
  ctx.lineTo(-38, -3);
  // Bottom ray angled downward-left
  ctx.moveTo(-18, 9);
  ctx.lineTo(-30, 16);
  ctx.stroke();

  // "Yuk Gasss" text with bold handwriting display font
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 40px "Caveat", "Montserrat", cursive, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Yuk Gasss', 0, 0);

  // Measure text width to position right radiating speed lines
  const textW = ctx.measureText('Yuk Gasss').width;

  // Draw 3 radiating speed lines on the Right of "Gasss"
  ctx.beginPath();
  // Top ray angled upward-right
  ctx.moveTo(textW + 18, -12);
  ctx.lineTo(textW + 32, -19);
  // Middle ray horizontal-right
  ctx.moveTo(textW + 22, -2);
  ctx.lineTo(textW + 38, -3);
  // Bottom ray angled downward-right
  ctx.moveTo(textW + 18, 9);
  ctx.lineTo(textW + 30, 16);
  ctx.stroke();

  // Subtitle "Mendaki Offline" underneath
  ctx.font = '700 36px "Caveat", cursive, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Mendaki Offline', 12, 42);

  ctx.restore();
  ctx.restore();
}
