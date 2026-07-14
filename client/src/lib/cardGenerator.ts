import type { Registration } from "@shared/schema";

// ── Field position types ─────────────────────────────────────
export interface TextFieldPos {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  maxWidth?: number;
}

export interface CardFieldConfig {
  photoBox:    { x: number; y: number; w: number; h: number };
  qrCode:      { x: number; y: number; size: number };
  cardNumber:  TextFieldPos;
  name:        TextFieldPos;
  designation: TextFieldPos;
  validUntil:  TextFieldPos;
  address:     TextFieldPos;  // back side: village, tehsil, district
  mobile:      TextFieldPos;  // back side
  aadhaar:     TextFieldPos;  // back side
}

// ── Defaults measured from the 2480×926 dual-sided template ──
// Front (0–1240px): photo box top-left, card-no/name/designation/validUntil to the right
// Back (1240–2480px): QR top-left of back, address/mobile/aadhaar to the right
export const DEFAULT_CARD_CONFIG: CardFieldConfig = {
  photoBox:    { x: 38,   y: 224, w: 219, h: 308 },
  qrCode:      { x: 1205, y: 224, size: 224 },
  cardNumber:  { x: 450,  y: 213, fontSize: 38, color: "#1a1a1a", maxWidth: 660 },
  name:        { x: 351,  y: 319, fontSize: 40, color: "#1a1a1a", maxWidth: 790 },
  designation: { x: 376,  y: 405, fontSize: 36, color: "#1a1a1a", maxWidth: 680 },
  validUntil:  { x: 358,  y: 491, fontSize: 36, color: "#1a1a1a", maxWidth: 680 },
  address:     { x: 1532, y: 201, fontSize: 32, color: "#1a1a1a", maxWidth: 910 },
  mobile:      { x: 1403, y: 305, fontSize: 36, color: "#1a1a1a", maxWidth: 960 },
  aadhaar:     { x: 1403, y: 379, fontSize: 36, color: "#1a1a1a", maxWidth: 960 },
};

// ── Helpers ───────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  f: TextFieldPos
) {
  ctx.font = `500 ${f.fontSize}px 'Noto Sans Gurmukhi', system-ui, sans-serif`;
  ctx.fillStyle = f.color || "#000000";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (f.maxWidth) ctx.fillText(text, f.x, f.y, f.maxWidth);
  else ctx.fillText(text, f.x, f.y);
}

function drawPhotoFit(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number }
) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const pa = photo.naturalWidth / photo.naturalHeight;
  const ba = w / h;
  let dw: number, dh: number, dx: number, dy: number;
  if (pa > ba) { dh = h; dw = h * pa; dx = x - (dw - w) / 2; dy = y; }
  else         { dw = w; dh = w / pa; dx = x; dy = y - (dh - h) / 2; }
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.restore();
}

// Cache a single promise so concurrent calls all wait on the same load
let fontPromise: Promise<void> | null = null;

async function ensureFont(): Promise<void> {
  if (fontPromise) return fontPromise;
  fontPromise = (async () => {
    // Step 1: inject stylesheet and wait until it is actually fetched
    if (!document.getElementById("card-gen-font")) {
      await new Promise<void>((resolve) => {
        const link = document.createElement("link");
        link.id   = "card-gen-font";
        link.rel  = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap";
        link.onload  = () => resolve();
        link.onerror = () => resolve(); // continue even if Google Fonts is unavailable
        document.head.appendChild(link);
      });
    }
    // Step 2: wait for the browser to fetch and parse the actual woff2 file
    try {
      await Promise.all([
        document.fonts.load("400 40px 'Noto Sans Gurmukhi'", "ਪੰਜਾਬ ਕਿਸਾਨ"),
        document.fonts.load("500 40px 'Noto Sans Gurmukhi'", "ਪੰਜਾਬ ਕਿਸਾਨ"),
        document.fonts.load("700 40px 'Noto Sans Gurmukhi'", "ਪੰਜਾਬ ਕਿਸਾਨ"),
      ]);
    } catch (_) { /* fall back to system fonts silently */ }
  })();
  return fontPromise;
}

// ── Main generator ────────────────────────────────────────────
export async function generateCardDataUrl(
  reg: Registration,
  config: CardFieldConfig = DEFAULT_CARD_CONFIG,
  templateUrl = "/card-template.png"
): Promise<string> {
  await ensureFont();

  const canvas = document.createElement("canvas");
  canvas.width  = 2480;
  canvas.height = 926;
  const ctx = canvas.getContext("2d")!;

  // 1. Template background
  const template = await loadImage(templateUrl);
  ctx.drawImage(template, 0, 0);

  // 2. Member photo
  let photoSrc: string | null = null;
  if (reg.photoData && reg.photoMimeType) {
    photoSrc = `data:${reg.photoMimeType};base64,${reg.photoData}`;
  } else if (reg.photoUrl) {
    // Proxied through server (avoids R2 CORS issues)
    photoSrc = `/api/admin/registrations/${reg.id}/photo`;
  }
  if (photoSrc) {
    try {
      const photo = await loadImage(photoSrc);
      drawPhotoFit(ctx, photo, config.photoBox);
    } catch (e) { console.warn("Photo skipped:", e); }
  }

  // 3. QR code (served as PNG from server)
  try {
    const res = await fetch(`/api/admin/registrations/${reg.id}/qr`, { credentials: "include" });
    if (res.ok) {
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const qr   = await loadImage(url);
      const { x, y, size } = config.qrCode;
      ctx.drawImage(qr, x, y, size, size);
      URL.revokeObjectURL(url);
    }
  } catch (e) { console.warn("QR skipped:", e); }

  // 4. Front-side text
  if (reg.cardNumber)  drawText(ctx, reg.cardNumber,  config.cardNumber);
  if (reg.name)        drawText(ctx, reg.name,         config.name);
  if (reg.designation) drawText(ctx, reg.designation,  config.designation);
  if (reg.validUntil) {
    const d = new Date(reg.validUntil);
    const ds = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
    drawText(ctx, ds, config.validUntil);
  }

  // 5. Back-side text
  const addr = [reg.village, reg.tehsil, reg.district].filter(Boolean).join(", ");
  if (addr)               drawText(ctx, addr,               config.address);
  if (reg.mobileNumber)   drawText(ctx, reg.mobileNumber,   config.mobile);
  if (reg.aadhaarNumber)  drawText(ctx, reg.aadhaarNumber,  config.aadhaar);

  return canvas.toDataURL("image/png");
}

// ── Calibration card (shows colored markers at each field position) ──
export async function downloadCalibrationCard(
  config: CardFieldConfig = DEFAULT_CARD_CONFIG,
  templateUrl = "/api/card-template"
): Promise<void> {
  await ensureFont();

  const canvas = document.createElement("canvas");
  canvas.width  = 2480;
  canvas.height = 926;
  const ctx = canvas.getContext("2d")!;

  // Template background
  try {
    const template = await loadImage(templateUrl);
    ctx.drawImage(template, 0, 0);
  } catch (_) { ctx.fillStyle = "#fffde7"; ctx.fillRect(0, 0, 2480, 926); }

  // Semi-transparent overlay so markers stand out
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, 2480, 926);

  function marker(label: string, x: number, y: number, color: string, w = 0, h = 0) {
    ctx.save();
    if (w && h) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = color + "44";
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px monospace";
    ctx.textAlign = w ? "left" : "center";
    ctx.textBaseline = w ? "top" : "middle";
    ctx.fillText(label, w ? x + 10 : x, w ? y + 10 : y);
    ctx.restore();
  }

  const { photoBox: pb, qrCode: qr } = config;
  marker("📷 PHOTO",      pb.x, pb.y, "#e91e63", pb.w, pb.h);
  marker("QR",            qr.x, qr.y, "#9c27b0", qr.size, qr.size);
  marker("1 CARD NO",     config.cardNumber.x,  config.cardNumber.y,  "#f44336");
  marker("2 NAME",        config.name.x,        config.name.y,        "#ff5722");
  marker("3 DESIGN",      config.designation.x, config.designation.y, "#ff9800");
  marker("4 VALID",       config.validUntil.x,  config.validUntil.y,  "#ffc107");
  marker("5 ADDRESS",     config.address.x,      config.address.y,     "#4caf50");
  marker("6 MOBILE",      config.mobile.x,       config.mobile.y,      "#2196f3");
  marker("7 AADHAAR",     config.aadhaar.x,      config.aadhaar.y,     "#00bcd4");

  // Legend
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 860, 2480, 66);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("CALIBRATION — ਹਰ circle ਦਾ center = text baseline (x,y). box = photo/QR box (x,y,w,h). admin ਪੈਨਲ ਤੋਂ adjust ਕਰੋ।", 20, 893);

  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.download = "card-calibration.png";
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadCard(
  reg: Registration,
  config?: CardFieldConfig,
  templateUrl?: string
): Promise<void> {
  const dataUrl = await generateCardDataUrl(reg, config, templateUrl);
  const a = document.createElement("a");
  a.download = `kisan-card-${reg.cardNumber || reg.id}.png`;
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
