import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import AdmZip from "adm-zip";
import { uploadPhotoToR2, deletePhotoFromR2 } from "./r2";
import { generateQRCode, generateQRCodeBuffer } from "./qr";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const ADMIN_USERNAME = "714752420017";
const ADMIN_PASSWORD = "Ba@606368";

const isAdminAuth = (req: any, res: any, next: any) => {
  if (req.session?.adminAuthenticated) return next();
  return res.status(401).json({ message: "ਲੌਗਇਨ ਲੋੜੀਂਦਾ ਹੈ" });
};

function getBaseUrl(req: any): string {
  const host = req.get("host");
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${protocol}://${host}`;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // ── Admin login/logout ──────────────────────────────────────
  app.post("/api/admin/login", (req: any, res: any) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.adminAuthenticated = true;
      req.session.save((err: any) => {
        if (err) return res.status(500).json({ message: "Session error" });
        return res.json({ success: true });
      });
    } else {
      return res.status(401).json({ message: "ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ" });
    }
  });

  app.post("/api/admin/logout", (req: any, res: any) => {
    req.session.destroy((err: any) => {
      if (err) console.error("Session destroy error:", err);
      res.json({ success: true });
    });
  });

  app.get("/api/admin/check", (req: any, res: any) => {
    res.json({ isAdmin: !!req.session?.adminAuthenticated });
  });

  // ── Public: card verification ───────────────────────────────
  app.get("/api/verify/:cardNumber", async (req, res) => {
    try {
      const reg = await storage.getRegistrationByCardNumber(req.params.cardNumber);
      if (!reg) return res.status(404).json({ valid: false, message: "Card ਨਹੀਂ ਮਿਲਿਆ" });

      const now = new Date();
      const isExpired = reg.validUntil ? now > new Date(reg.validUntil) : false;
      const isActive = reg.validFrom && reg.validUntil
        ? now >= new Date(reg.validFrom) && now <= new Date(reg.validUntil)
        : false;

      res.json({
        valid: isActive,
        expired: isExpired,
        cardNumber: reg.cardNumber,
        name: reg.name,
        designation: reg.designation,
        village: reg.village,
        tehsil: reg.tehsil,
        district: reg.district,
        mobileNumber: reg.mobileNumber || "*",
        aadhaarNumber: reg.aadhaarNumber ? `**** **** ${reg.aadhaarNumber.slice(-4)}` : "*",
        photoUrl: reg.photoUrl,
        validFrom: reg.validFrom,
        validUntil: reg.validUntil,
      });
    } catch (err) {
      console.error("Verify error:", err);
      res.status(500).json({ valid: false, message: "Server error" });
    }
  });

  // ── Public: submit registration ────────────────────────────
  app.post(api.registrations.submit.path, upload.single("photo"), async (req, res) => {
    try {
      const bodySchema = insertRegistrationSchema.extend({
        name: z.string().min(1, "ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ"),
        village: z.string().min(1, "ਪਿੰਡ ਲੋੜੀਂਦਾ ਹੈ"),
        tehsil: z.string().min(1, "ਤਹਿਸੀਲ ਲੋੜੀਂਦੀ ਹੈ"),
        district: z.string().min(1, "ਜ਼ਿਲ੍ਹਾ ਲੋੜੀਂਦਾ ਹੈ"),
      });
      const parsed = bodySchema.parse(req.body);

      let photoUrl: string | undefined;
      let photoData: string | undefined;
      let photoMimeType: string | undefined;

      if (req.file) {
        const ext = req.file.mimetype.split("/")[1] || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        try {
          photoUrl = await uploadPhotoToR2(req.file.buffer, req.file.mimetype, fileName);
        } catch (r2err) {
          console.error("R2 upload failed, falling back to base64:", r2err);
          photoData = req.file.buffer.toString("base64");
          photoMimeType = req.file.mimetype;
        }
      }

      const registration = await storage.createRegistration({
        ...parsed,
        mobileNumber: parsed.mobileNumber || undefined,
        aadhaarNumber: parsed.aadhaarNumber || undefined,
        photoUrl,
        photoData,
        photoMimeType,
      });

      res.status(201).json({
        message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ! ਤੁਹਾਡਾ ਕਾਰਡ ਜਲਦੀ ਹੀ ਤਿਆਰ ਕੀਤਾ ਜਾਵੇਗਾ।",
        id: registration.id,
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      console.error("Registration error:", err);
      res.status(500).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  // ── Admin: list registrations ───────────────────────────────
  app.get(api.registrations.list.path, isAdminAuth, async (req, res) => {
    try {
      res.json(await storage.getRegistrations());
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: update validity & get QR data URL ───────────────
  app.post("/api/admin/registrations/:id/issue-card", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { validFrom, validUntil } = req.body;
      if (!validFrom || !validUntil)
        return res.status(400).json({ message: "validFrom ਅਤੇ validUntil ਲੋੜੀਂਦੇ ਹਨ" });

      const updated = await storage.updateRegistrationCard(id, {
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
      });
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });

      const base = getBaseUrl(req);
      const qrDataUrl = await generateQRCode(updated.cardNumber!, base);
      res.json({ registration: updated, qrDataUrl });
    } catch (err) {
      console.error("Issue card error:", err);
      res.status(500).json({ message: "Card issue ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: download QR PNG ─────────────────────────────────
  app.get("/api/admin/registrations/:id/qr", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const reg = await storage.getRegistration(id);
      if (!reg || !reg.cardNumber) return res.status(404).json({ message: "Card ਨਹੀਂ ਮਿਲਿਆ" });

      const base = getBaseUrl(req);
      const buf = await generateQRCodeBuffer(reg.cardNumber, base);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename=QR-${reg.cardNumber}.png`);
      res.send(buf);
    } catch (err) {
      console.error("QR download error:", err);
      res.status(500).json({ message: "QR ਡਾਊਨਲੋਡ ਫੇਲ੍ਹ" });
    }
  });

  // ── Admin: get single registration ────────────────────────
  app.get("/api/admin/registrations/download", isAdminAuth, async (req, res) => {
    try {
      const allRegs = await storage.getRegistrations();
      const zip = new AdmZip();
      let summary = "ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ - ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸੂਚੀ\n" + "=".repeat(50) + "\n\n";

      for (const reg of allRegs) {
        const last4 = reg.aadhaarNumber ? reg.aadhaarNumber.slice(-4) : "****";
        let details = `Card No: ${reg.cardNumber || "N/A"}\n`;
        details += `ਨਾਮ: ${reg.name}\nਆਹੁਦਾ: ${reg.designation}\n`;
        details += `ਪਿੰਡ: ${reg.village}\nਤਹਿਸੀਲ: ${reg.tehsil}\nਜ਼ਿਲ੍ਹਾ: ${reg.district}\n`;
        details += `ਮੋਬਾਈਲ: ${reg.mobileNumber || "*"}\n`;
        details += `ਆਧਾਰ: ${reg.aadhaarNumber ? `**** **** ${last4}` : "*"}\n`;
        details += `Valid: ${reg.validFrom ? new Date(reg.validFrom).toLocaleDateString("pa-IN") : "N/A"} - ${reg.validUntil ? new Date(reg.validUntil).toLocaleDateString("pa-IN") : "N/A"}\n`;
        const fn = `${reg.id}_${reg.name.replace(/[^a-zA-Z0-9ਅ-ੴ]/g, "_")}_${reg.village}`;
        zip.addFile(`${fn}.txt`, Buffer.from(details, "utf-8"));
        if (reg.photoData && reg.photoMimeType) {
          const ext = reg.photoMimeType.split("/")[1] || "jpg";
          zip.addFile(`${fn}.${ext}`, Buffer.from(reg.photoData, "base64"));
        }
        summary += `${reg.id}. ${reg.name} - ${reg.village}, ${reg.district} [${reg.cardNumber || "N/A"}]\n`;
      }

      zip.addFile("_summary.txt", Buffer.from(summary, "utf-8"));
      const zipBuffer = zip.toBuffer();

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=registrations_${Date.now()}.zip`);
      res.send(zipBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਊਨਲੋਡ ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  app.get("/api/admin/registrations/:id", isAdminAuth, async (req, res) => {
    try {
      const reg = await storage.getRegistration(parseInt(req.params.id));
      if (!reg) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      res.json(reg);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.delete("/api/admin/registrations/:id", isAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reg = await storage.getRegistration(id);
      if (reg?.photoUrl) await deletePhotoFromR2(reg.photoUrl);
      const deleted = await storage.deleteRegistration(id);
      if (!deleted) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      res.json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮਿਟਾਈ ਗਈ" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  return httpServer;
}
