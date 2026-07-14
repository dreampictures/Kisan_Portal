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

// ── Defaults tuned for the 2480×926 template ─────────────────
export const DEFAULT_CARD_CONFIG: CardFieldConfig = {
  photoBox:    { x: 45,   y: 215, w: 248, h: 295 },
  qrCode:      { x: 1255, y: 215, size: 238 },
  cardNumber:  { x: 490,  y: 295, fontSize: 40, color: "#1a1a1a", maxWidth: 670 },
  name:        { x: 385,  y: 368, fontSize: 42, color: "#1a1a1a", maxWidth: 790 },
  designation: { x: 500,  y: 438, fontSize: 38, color: "#1a1a1a", maxWidth: 680 },
  validUntil:  { x: 450,  y: 506, fontSize: 38, color: "#1a1a1a", maxWidth: 720 },
  address:     { x: 1535, y: 295, fontSize: 34, color: "#1a1a1a", maxWidth: 920 },
  mobile:      { x: 1535, y: 365, fontSize: 38, color: "#1a1a1a", maxWidth: 920 },
  aadhaar:     { x: 1535, y: 435, fontSize: 38, color: "#1a1a1a", maxWidth: 920 },
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

let fontInjected = false;

async function ensureFont() {
  if (fontInjected) return;
  fontInjected = true;
  if (!document.getElementById("card-gen-font")) {
    const link = document.createElement("link");
    link.id = "card-gen-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }
  try { await document.fonts.ready; } catch (_) { /* ignore */ }
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
