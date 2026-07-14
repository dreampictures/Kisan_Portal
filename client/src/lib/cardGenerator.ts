import type { Registration } from "@shared/schema";

// ── Field position types ─────────────────────────────────────
export interface TextFieldPos {
  x: number;
  y: number;
  fontSize: number;
  fontWeight?: 400 | 500 | 700 | 900;
  color: string;
  maxWidth?: number;
  textAlign?: "left" | "right" | "center";
}

export interface CardFieldConfig {
  photoBox:    { x: number; y: number; w: number; h: number };
  stamp?:      { x: number; y: number; w: number; h: number };
  qrCode:      { x: number; y: number; size: number };
  cardNumber:  TextFieldPos;
  name:        TextFieldPos;
  designation: TextFieldPos;
  validUntil:  TextFieldPos;
  address:     TextFieldPos;  // back side: only village now
  mobile:      TextFieldPos;  // back side
  aadhaar:     TextFieldPos;  // back side
}

// ── Defaults ──────────────────────────────────────────────────
// Front (0–1240px): RIGHT-ALIGNED at x=1130
// Back (1240–2480px): LEFT-ALIGNED starting at x=1590 (relative to back half start 1240)
export const DEFAULT_CARD_CONFIG: CardFieldConfig = {
  photoBox:    { x: 220,  y: 304, w: 247, h: 322 },
  stamp:       { x: 339,  y: 530, w: 352, h: 224 },
  qrCode:      { x: 1262, y: 304, size: 247 },
  cardNumber:  { x: 1130, y: 324, fontSize: 38, fontWeight: 700, color: "#1a1a1a", maxWidth: 850, textAlign: "right" },
  name:        { x: 1130, y: 392, fontSize: 42, fontWeight: 700, color: "#1a1a1a", maxWidth: 850, textAlign: "right" },
  designation: { x: 1130, y: 459, fontSize: 36, fontWeight: 500, color: "#1a1a1a", maxWidth: 850, textAlign: "right" },
  validUntil:  { x: 1130, y: 527, fontSize: 36, fontWeight: 500, color: "#1a1a1a", maxWidth: 850, textAlign: "right" },
  address:     { x: 2192, y: 325, fontSize: 34, fontWeight: 500, color: "#1a1a1a", maxWidth: 280, textAlign: "left" },
  mobile:      { x: 2192, y: 372, fontSize: 34, fontWeight: 500, color: "#1a1a1a", maxWidth: 280, textAlign: "left" },
  aadhaar:     { x: 2192, y: 419, fontSize: 34, fontWeight: 400, color: "#1a1a1a", maxWidth: 280, textAlign: "left" },
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
  const weight = f.fontWeight ?? 500;
  ctx.font = `${weight} ${f.fontSize}px 'Noto Sans Gurmukhi', system-ui, sans-serif`;
  ctx.fillStyle = f.color || "#000000";
  ctx.textAlign = f.textAlign || "left";
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
    if (!document.getElementById("card-gen-font")) {
      await new Promise<void>((resolve) => {
        const link = document.createElement("link");
        link.id   = "card-gen-font";
        link.rel  = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700;900&display=swap";
        link.onload  = () => resolve();
        link.onerror = () => resolve();
        document.head.appendChild(link);
      });
    }
    try {
      await Promise.all([
        document.fonts.load("400 40px 'Noto Sans Gurmukhi'", "ਪੰਜਾਬ ਕਿਸਾਨ"),
        document.fonts.load("500 40px 'Noto Sans Gurmukhi'", "ਪੰਜਾਬ ਕਿਸਾਨ"),
        document.fonts.load("700 40px 'Noto Sans Gurmukhi'", "ਪੰਜਾਬ ਕਿਸਾਨ"),
        document.fonts.load("900 40px 'Noto Sans Gurmukhi'", "ਪੰਜਾਬ ਕਿਸਾਨ"),
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
    photoSrc = `/api/admin/registrations/${reg.id}/photo`;
  }
  if (photoSrc) {
    try {
      const photo = await loadImage(photoSrc);
      drawPhotoFit(ctx, photo, config.photoBox);
    } catch (e) { console.warn("Photo skipped:", e); }
  }

  // 3. Stamp overlay (drawn on top of photo)
  if (config.stamp) {
    try {
      const res = await fetch("/api/admin/stamp", { credentials: "include" });
      if (res.ok) {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const img  = await loadImage(url);
        const { x, y, w, h } = config.stamp;
        ctx.drawImage(img, x, y, w, h);
        URL.revokeObjectURL(url);
      }
    } catch (e) { console.warn("Stamp skipped:", e); }
  }

  // 4. QR code
  try {
    const res = await fetch(`/api/admin/registrations/${reg.id}/qr`, { credentials: "include" });
    if (res.ok) {
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const qr   = await loadImage(url);
      const { x, y, size } = config.qrCode;
      const pad = 5;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - pad, y - pad, size + pad * 2, size + pad * 2);
      ctx.drawImage(qr, x, y, size, size);
      URL.revokeObjectURL(url);
    }
  } catch (e) { console.warn("QR skipped:", e); }

  // 5. Front-side text
  if (reg.cardNumber)  drawText(ctx, reg.cardNumber,  config.cardNumber);
  if (reg.name)        drawText(ctx, reg.name,         config.name);
  if (reg.designation) drawText(ctx, reg.designation,  config.designation);
  if (reg.validUntil) {
    const d = new Date(reg.validUntil);
    const ds = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
    drawText(ctx, ds, config.validUntil);
  }

  // 6. Back-side text — address shows only village (ਪਿੰਡ)
  const village = reg.village || "";
  if (village)          drawText(ctx, village,          config.address);
  if (reg.mobileNumber) drawText(ctx, reg.mobileNumber, config.mobile);
  if (reg.aadhaarNumber) {
    const digits = reg.aadhaarNumber.replace(/\D/g, "");
    const masked = "XXXX-XXXX-" + digits.slice(-4);
    drawText(ctx, masked, config.aadhaar);
  }

  return canvas.toDataURL("image/png");
}

// ── Calibration card ──────────────────────────────────────────
export async function downloadCalibrationCard(
  config: CardFieldConfig = DEFAULT_CARD_CONFIG,
  templateUrl = "/api/card-template"
): Promise<void> {
  await ensureFont();

  const canvas = document.createElement("canvas");
  canvas.width  = 2480;
  canvas.height = 926;
  const ctx = canvas.getContext("2d")!;

  try {
    const template = await loadImage(templateUrl);
    ctx.drawImage(template, 0, 0);
  } catch (_) { ctx.fillStyle = "#fffde7"; ctx.fillRect(0, 0, 2480, 926); }

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
  marker("📷 PHOTO",  pb.x, pb.y, "#e91e63", pb.w, pb.h);
  if (config.stamp) marker("💮 STAMP", config.stamp.x, config.stamp.y, "#f06292", config.stamp.w, config.stamp.h);
  marker("QR",        qr.x, qr.y, "#9c27b0", qr.size, qr.size);
  marker("1 CARD NO", config.cardNumber.x,  config.cardNumber.y,  "#f44336");
  marker("2 NAME",    config.name.x,        config.name.y,        "#ff5722");
  marker("3 DESIGN",  config.designation.x, config.designation.y, "#ff9800");
  marker("4 VALID",   config.validUntil.x,  config.validUntil.y,  "#ffc107");
  marker("5 PIND",    config.address.x,      config.address.y,     "#4caf50");
  marker("6 MOBILE",  config.mobile.x,       config.mobile.y,      "#2196f3");
  marker("7 AADHAAR", config.aadhaar.x,      config.aadhaar.y,     "#00bcd4");

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 860, 2480, 66);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("CALIBRATION — circle center = text baseline (x,y). box = area (x,y,w,h). admin panel ਤੋਂ adjust ਕਰੋ।", 20, 893);

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
