import type { Express, Request, Response, NextFunction } from "express";
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
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_PIN = process.env.ADMIN_PIN || "1103";

// ── Rate Limiters ────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "ਬਹੁਤ ਜ਼ਿਆਦਾ ਕੋਸ਼ਿਸ਼ਾਂ। 15 ਮਿੰਟ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" },
  standardHeaders: true,
  legacyHeaders: false,
});

const pinLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: "ਬਹੁਤ ਜ਼ਿਆਦਾ ਗਲਤ PIN। 10 ਮਿੰਟ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: "ਬਹੁਤ ਜ਼ਿਆਦਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਕੋਸ਼ਿਸ਼ਾਂ। 1 ਘੰਟੇ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" },
  standardHeaders: true,
  legacyHeaders: false,
});

const trackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { message: "ਬਹੁਤ ਜ਼ਿਆਦਾ ਕੋਸ਼ਿਸ਼ਾਂ। ਕੁਝ ਮਿੰਟ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Auth Middleware ─────────────────────────────────────────
function isFullyAuthenticated(req: any): boolean {
  const role = req.session?.staffRole;
  if (!req.session?.adminAuthenticated) return false;
  if (role === "admin") return !!req.session?.pinVerified;
  return true;
}

const isAdminAuth = (req: any, res: any, next: any) => {
  if (req.session?.adminAuthenticated && req.session?.pinVerified) return next();
  return res.status(401).json({ message: "ਲੌਗਇਨ ਲੋੜੀਂਦਾ ਹੈ" });
};

const isStaffAuth = (req: any, res: any, next: any) => {
  if (isFullyAuthenticated(req)) return next();
  return res.status(401).json({ message: "ਲੌਗਇਨ ਲੋੜੀਂਦਾ ਹੈ" });
};

const isMeetPresidentOrAbove = (req: any, res: any, next: any) => {
  if (!isFullyAuthenticated(req)) return res.status(401).json({ message: "ਲੌਗਇਨ ਲੋੜੀਂਦਾ ਹੈ" });
  const role = req.session?.staffRole;
  if (["state_meet_president", "state_president", "admin"].includes(role)) return next();
  return res.status(403).json({ message: "ਇਜਾਜ਼ਤ ਨਹੀਂ" });
};

const isStatePresidentOrAbove = (req: any, res: any, next: any) => {
  if (!isFullyAuthenticated(req)) return res.status(401).json({ message: "ਲੌਗਇਨ ਲੋੜੀਂਦਾ ਹੈ" });
  const role = req.session?.staffRole;
  if (["state_president", "admin"].includes(role)) return next();
  return res.status(403).json({ message: "ਇਜਾਜ਼ਤ ਨਹੀਂ" });
};

const isPasswordAuth = (req: any, res: any, next: any) => {
  if (req.session?.adminAuthenticated) return next();
  return res.status(401).json({ message: "ਲੌਗਇਨ ਲੋੜੀਂਦਾ ਹੈ" });
};

function getBaseUrl(req: any): string {
  const host = req.get("host");
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${protocol}://${host}`;
}

function getPerformedBy(req: any): string {
  return req.session?.staffUsername || req.session?.staffDisplayName || "admin";
}

function getPerformedByRole(req: any): string {
  return req.session?.staffRole || "admin";
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // ── Client-side page view tracking ───────────────────────
  app.post("/api/track-view", async (req: any, res: any) => {
    try {
      const page = String(req.body?.page || "/").split("?")[0] || "/";
      await storage.recordPageView(page);
    } catch {}
    res.json({ ok: true });
  });

  // ── Admin login ──────────────────────────────────────────
  app.post("/api/admin/login", loginLimiter, async (req: any, res: any) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username ਅਤੇ Password ਲੋੜੀਂਦੇ ਹਨ" });

    // Check staff_users table first
    const staffUser = await storage.getStaffUserByUsername(username).catch(() => undefined);
    const passwordMatch = staffUser ? await bcrypt.compare(password, staffUser.password).catch(() => staffUser.password === password) : false;
    if (staffUser && passwordMatch) {
      req.session.adminAuthenticated = true;
      req.session.staffUserId = staffUser.id;
      req.session.staffRole = staffUser.role;
      req.session.staffUsername = staffUser.username;
      req.session.staffDisplayName = staffUser.displayName;

      if (staffUser.role === "admin") {
        req.session.pinVerified = false;
        return req.session.save((err: any) => {
          if (err) return res.status(500).json({ message: "Session error" });
          return res.json({ success: true, needsPin: true, role: staffUser.role });
        });
      } else {
        req.session.pinVerified = true;
        return req.session.save((err: any) => {
          if (err) return res.status(500).json({ message: "Session error" });
          return res.json({ success: true, needsPin: false, role: staffUser.role });
        });
      }
    }

    // Fallback to env vars for default admin
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.adminAuthenticated = true;
      req.session.pinVerified = false;
      req.session.staffRole = "admin";
      req.session.staffUsername = ADMIN_USERNAME;
      req.session.staffDisplayName = "Admin";
      return req.session.save((err: any) => {
        if (err) return res.status(500).json({ message: "Session error" });
        return res.json({ success: true, needsPin: true, role: "admin" });
      });
    }

    return res.status(401).json({ message: "ਗਲਤ ਯੂਜ਼ਰਨੇਮ ਜਾਂ ਪਾਸਵਰਡ" });
  });

  app.post("/api/admin/verify-pin", pinLimiter, isPasswordAuth, (req: any, res: any) => {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: "PIN ਲੋੜੀਂਦਾ ਹੈ" });
    if (pin === ADMIN_PIN) {
      req.session.pinVerified = true;
      return req.session.save((err: any) => {
        if (err) return res.status(500).json({ message: "Session error" });
        return res.json({ success: true });
      });
    }
    return res.status(401).json({ message: "ਗਲਤ PIN" });
  });

  app.post("/api/admin/logout", (req: any, res: any) => {
    req.session.destroy((err: any) => {
      if (err) console.error("Session destroy error:", err);
      res.json({ success: true });
    });
  });

  app.get("/api/admin/check", (req: any, res: any) => {
    const authenticated = !!req.session?.adminAuthenticated;
    const pinVerified = !!req.session?.pinVerified;
    const role = req.session?.staffRole || "admin";
    const isAdmin = authenticated && (role !== "admin" ? true : pinVerified);
    res.json({
      isAdmin,
      needsPin: authenticated && role === "admin" && !pinVerified,
      role: authenticated ? role : null,
      username: authenticated ? (req.session?.staffUsername || null) : null,
      displayName: authenticated ? (req.session?.staffDisplayName || null) : null,
    });
  });

  // ── Public: card verification ────────────────────────────
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

  // ── Public: tracking ─────────────────────────────────────
  app.get("/api/track", trackLimiter, async (req: any, res: any) => {
    try {
      const { trackingId, mobile } = req.query;
      if (!trackingId && !mobile) return res.status(400).json({ message: "trackingId ਜਾਂ mobile ਲੋੜੀਂਦਾ ਹੈ" });

      let regs: any[] = [];
      if (trackingId) {
        const r = await storage.getRegistrationByTrackingId(String(trackingId));
        if (r) regs = [r];
      } else if (mobile) {
        regs = await storage.getRegistrationsByMobile(String(mobile));
      }

      if (!regs.length) return res.status(404).json({ message: "ਕੋਈ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });

      const result = regs.map(r => {
        // Determine the true current stage:
        // If validFrom & validUntil are set, card is issued regardless of what currentStage says
        let trueStage = r.currentStage || "submitted";
        if (r.validFrom && r.validUntil && trueStage !== "rejected") {
          trueStage = "card_issued";
        } else if (r.status === "approved" && r.cardNumber && !r.validFrom && trueStage !== "rejected") {
          trueStage = "approved";
        }

        return {
          id: r.id,
          trackingId: r.trackingId,
          name: r.name,
          village: r.village,
          district: r.district,
          currentStage: trueStage,
          status: r.status,
          submittedAt: r.submittedAt || r.createdAt,
          meetPresidentStatus: r.meetPresidentStatus,
          meetPresidentAt: r.meetPresidentAt,
          statePresidentStatus: r.statePresidentStatus,
          statePresidentAt: r.statePresidentAt,
          adminStatus: r.adminStatus,
          adminAt: r.adminAt,
          rejectedBy: r.rejectedBy,
          rejectedReason: r.rejectedReason,
          rejectedAt: r.rejectedAt,
          // Only show card number when card is actually issued
          cardNumber: (r.validFrom && r.validUntil) ? r.cardNumber : null,
          validFrom: r.validFrom,
          validUntil: r.validUntil,
        };
      });

      res.json(result);
    } catch (err) {
      console.error("Track error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Public: submit registration ──────────────────────────
  app.post(api.registrations.submit.path, registrationLimiter, upload.single("photo"), async (req, res) => {
    try {
      const bodySchema = insertRegistrationSchema.extend({
        name: z.string().min(1, "ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ"),
        village: z.string().min(1, "ਪਿੰਡ/ਸ਼ਹਿਰ ਲੋੜੀਂਦਾ ਹੈ"),
        tehsil: z.string().min(1, "ਤਹਿਸੀਲ ਲੋੜੀਂਦੀ ਹੈ"),
        district: z.string().min(1, "ਜ਼ਿਲ੍ਹਾ ਲੋੜੀਂਦਾ ਹੈ"),
      });
      const parsed = bodySchema.parse(req.body);

      let photoUrl: string | undefined;
      let photoData: string | undefined;
      let photoMimeType: string | undefined;
      let photoSize: number | undefined;

      if (req.file) {
        photoSize = req.file.buffer.length;
        const ext = req.file.mimetype.split("/")[1] || "jpg";
        const fileName = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
        designation: parsed.designation || undefined,
        mobileNumber: parsed.mobileNumber || undefined,
        aadhaarNumber: parsed.aadhaarNumber || undefined,
        areaType: parsed.areaType || "rural",
        wardNumber: parsed.wardNumber || undefined,
        mohalla: parsed.mohalla || undefined,
        photoUrl,
        photoData,
        photoMimeType,
        photoSize,
        status: "pending",
      });

      await storage.logActivity({ memberId: registration.id, action: "Application Submitted", performedBy: parsed.name, role: "public", remarks: `Tracking: ${registration.trackingId}` });

      res.status(201).json({
        message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ!",
        id: registration.id,
        trackingId: registration.trackingId,
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      console.error("Registration error:", err);
      res.status(500).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  // ── Admin: list all registrations ───────────────────────
  app.get(api.registrations.list.path, isStaffAuth, async (req, res) => {
    try {
      res.json(await storage.getRegistrations());
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: pending registrations ────────────────────────
  app.get("/api/admin/registrations/pending", isStaffAuth, async (req, res) => {
    try {
      res.json(await storage.getPendingRegistrations());
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: dashboard stats ───────────────────────────────
  app.get("/api/admin/dashboard-stats", isStaffAuth, async (req: any, res: any) => {
    try {
      res.json(await storage.getDashboardStats());
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Stats ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Meet President: approve ──────────────────────────────
  app.post("/api/admin/registrations/:id/meet-president-approve", isMeetPresidentOrAbove, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const by = getPerformedBy(req);
      const updated = await storage.meetPresidentApprove(id, by);
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      await storage.logActivity({ memberId: id, action: "Meet President Approved", performedBy: by, role: getPerformedByRole(req) });
      res.json({ message: "Meet President ਅਪ੍ਰੂਵ ਕੀਤਾ", registration: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਅਪ੍ਰੂਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Meet President: reject ───────────────────────────────
  app.post("/api/admin/registrations/:id/meet-president-reject", isMeetPresidentOrAbove, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ message: "ਕਾਰਨ ਲੋੜੀਂਦਾ ਹੈ" });
      const by = getPerformedBy(req);
      const reg = await storage.getRegistration(id);
      const updated = await storage.meetPresidentReject(id, reason, by);
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      if (reg?.photoUrl) await deletePhotoFromR2(reg.photoUrl).catch(console.error);
      await storage.logActivity({ memberId: id, action: "Meet President Rejected", performedBy: by, role: getPerformedByRole(req), remarks: reason });
      res.json({ message: "Reject ਕੀਤਾ", registration: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Reject ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── State President: approve ─────────────────────────────
  app.post("/api/admin/registrations/:id/state-president-approve", isStatePresidentOrAbove, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const by = getPerformedBy(req);
      const updated = await storage.statePresidentApprove(id, by);
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      await storage.logActivity({ memberId: id, action: "State President Approved", performedBy: by, role: getPerformedByRole(req) });
      res.json({ message: "State President ਅਪ੍ਰੂਵ ਕੀਤਾ", registration: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਅਪ੍ਰੂਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── State President: reject ──────────────────────────────
  app.post("/api/admin/registrations/:id/state-president-reject", isStatePresidentOrAbove, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ message: "ਕਾਰਨ ਲੋੜੀਂਦਾ ਹੈ" });
      const by = getPerformedBy(req);
      const reg = await storage.getRegistration(id);
      const updated = await storage.statePresidentReject(id, reason, by);
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      if (reg?.photoUrl) await deletePhotoFromR2(reg.photoUrl).catch(console.error);
      await storage.logActivity({ memberId: id, action: "State President Rejected", performedBy: by, role: getPerformedByRole(req), remarks: reason });
      res.json({ message: "Reject ਕੀਤਾ", registration: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Reject ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: approve registration (issues card with manual or auto 1-year validity) ──
  app.post("/api/admin/registrations/:id/approve", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const by = getPerformedBy(req);
      const validFrom = req.body?.validFrom ? new Date(req.body.validFrom) : new Date();
      const validUntil = req.body?.validUntil ? new Date(req.body.validUntil) : (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })();
      // Approve + immediately issue card in one step so currentStage = card_issued
      const updated = await storage.updateRegistrationCard(id, { validFrom, validUntil, performedBy: by });
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      await storage.logActivity({ memberId: id, action: "Admin Approved & Card Issued", performedBy: by, role: "admin" });
      res.json({ message: "ਅਪ੍ਰੂਵ ਅਤੇ ਕਾਰਡ ਜਾਰੀ ਕੀਤਾ", registration: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਅਪ੍ਰੂਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: reject registration (mark as rejected) ────────
  app.post("/api/admin/registrations/:id/reject", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const by = getPerformedBy(req);
      const reg = await storage.getRegistration(id);
      if (!reg) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      const updated = await storage.rejectRegistration(id, reason || "Admin rejected", by, "admin");
      if (reg?.photoUrl) await deletePhotoFromR2(reg.photoUrl).catch(console.error);
      await storage.logActivity({ memberId: id, action: "Admin Rejected", performedBy: by, role: "admin", remarks: reason });
      res.json({ message: "Reject ਕੀਤਾ" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Reject ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Direct entry (presidents create approved members) ────
  app.post("/api/admin/registrations/direct", isStaffAuth, upload.single("photo"), async (req: any, res: any) => {
    try {
      const bodySchema = insertRegistrationSchema.extend({
        name: z.string().min(1, "ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ"),
        village: z.string().min(1, "ਪਿੰਡ/ਸ਼ਹਿਰ ਲੋੜੀਂਦਾ ਹੈ"),
        tehsil: z.string().min(1, "ਤਹਿਸੀਲ ਲੋੜੀਂਦੀ ਹੈ"),
        district: z.string().min(1, "ਜ਼ਿਲ੍ਹਾ ਲੋੜੀਂਦਾ ਹੈ"),
      });
      const parsed = bodySchema.parse(req.body);
      const role = getPerformedByRole(req);
      const by = getPerformedBy(req);

      let photoUrl: string | undefined;
      let photoData: string | undefined;
      let photoMimeType: string | undefined;

      if (req.file) {
        const ext = req.file.mimetype.split("/")[1] || "jpg";
        const fileName = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        try {
          photoUrl = await uploadPhotoToR2(req.file.buffer, req.file.mimetype, fileName);
        } catch {
          photoData = req.file.buffer.toString("base64");
          photoMimeType = req.file.mimetype;
        }
      }

      // Presidents create members that go to admin_review, only admin creates directly approved
      const isAdmin = role === "admin";
      const registration = await storage.createRegistration({
        ...parsed,
        designation: parsed.designation || undefined,
        mobileNumber: parsed.mobileNumber || undefined,
        aadhaarNumber: parsed.aadhaarNumber || undefined,
        areaType: parsed.areaType || "rural",
        wardNumber: parsed.wardNumber || undefined,
        mohalla: parsed.mohalla || undefined,
        photoUrl,
        photoData,
        photoMimeType,
        status: isAdmin ? "approved" : "pending",
        createdBy: by,
        createdByRole: role,
      });

      if (!isAdmin) {
        // For presidents: fast-track to admin_review stage
        await storage.statePresidentApprove(registration.id, by);
      }

      await storage.logActivity({ memberId: registration.id, action: "Direct Entry Created", performedBy: by, role });
      res.status(201).json({ message: "ਐਂਟਰੀ ਸਫਲ!", registration });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      console.error("Direct entry error:", err);
      res.status(500).json({ message: "ਐਂਟਰੀ ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  // ── Admin: edit registration ─────────────────────────────
  app.patch("/api/admin/registrations/:id", isStaffAuth, upload.single("photo"), async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const editSchema = z.object({
        name: z.string().min(1).optional(),
        designation: z.string().optional(),
        village: z.string().min(1).optional(),
        tehsil: z.string().min(1).optional(),
        district: z.string().min(1).optional(),
        areaType: z.enum(["rural", "urban"]).optional(),
        wardNumber: z.string().optional(),
        mohalla: z.string().optional(),
        mobileNumber: z.string().optional(),
        aadhaarNumber: z.string().optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
      });
      const parsed = editSchema.parse(req.body);

      let photoUrl: string | undefined;
      let photoData: string | undefined;
      let photoMimeType: string | undefined;
      let photoSize: number | undefined;

      if (req.file) {
        photoSize = req.file.buffer.length;
        const ext = req.file.mimetype.split("/")[1] || "jpg";
        const fileName = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        try {
          const oldReg = await storage.getRegistration(id);
          if (oldReg?.photoUrl) await deletePhotoFromR2(oldReg.photoUrl).catch(() => {});
          photoUrl = await uploadPhotoToR2(req.file.buffer, req.file.mimetype, fileName);
        } catch {
          photoData = req.file.buffer.toString("base64");
          photoMimeType = req.file.mimetype;
        }
      }

      const { validFrom: vf, validUntil: vu, ...rest } = parsed;
      const updateData: any = { ...rest };
      if (vf) updateData.validFrom = new Date(vf);
      if (vu) updateData.validUntil = new Date(vu);
      if (req.file) {
        if (photoUrl) { updateData.photoUrl = photoUrl; updateData.photoData = null; updateData.photoMimeType = null; updateData.photoSize = photoSize; }
        else { updateData.photoData = photoData; updateData.photoMimeType = photoMimeType; updateData.photoUrl = null; updateData.photoSize = photoSize; }
      }

      const updated = await storage.updateRegistration(id, updateData);
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      res.json({ message: "ਅੱਪਡੇਟ ਹੋ ਗਿਆ", registration: updated });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      console.error("Edit error:", err);
      res.status(500).json({ message: "ਅੱਪਡੇਟ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: issue card / QR (unchanged) ──────────────────
  app.post("/api/admin/registrations/:id/issue-card", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { validFrom, validUntil } = req.body;
      if (!validFrom || !validUntil)
        return res.status(400).json({ message: "validFrom ਅਤੇ validUntil ਲੋੜੀਂਦੇ ਹਨ" });

      const updated = await storage.updateRegistrationCard(id, {
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        performedBy: getPerformedBy(req),
      });
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });

      await storage.logActivity({ memberId: id, action: "Card Issued", performedBy: getPerformedBy(req), role: "admin", remarks: updated.cardNumber || "" });
      const base = getBaseUrl(req);
      const qrDataUrl = await generateQRCode(updated.cardNumber!, base);
      res.json({ registration: updated, qrDataUrl });
    } catch (err) {
      console.error("Issue card error:", err);
      res.status(500).json({ message: "Card issue ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: download QR PNG ──────────────────────────────
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

  // ── Admin: ZIP download ─────────────────────────────────
  app.get("/api/admin/registrations/download", isAdminAuth, async (req, res) => {
    try {
      const allRegs = await storage.getRegistrations();
      const zip = new AdmZip();
      let summary = "ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ - ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸੂਚੀ\n" + "=".repeat(50) + "\n\n";

      for (const reg of allRegs) {
        const last4 = reg.aadhaarNumber ? reg.aadhaarNumber.slice(-4) : "****";
        let details = `Tracking: ${reg.trackingId || "N/A"}\nCard No: ${reg.cardNumber || "N/A"}\nStatus: ${reg.status}\n`;
        details += `ਨਾਮ: ${reg.name}\nਆਹੁਦਾ: ${reg.designation}\n`;
        details += `ਪਿੰਡ: ${reg.village}\nਤਹਿਸੀਲ: ${reg.tehsil}\nਜ਼ਿਲ੍ਹਾ: ${reg.district}\n`;
        details += `ਖੇਤਰ: ${reg.areaType || "rural"}\n`;
        if (reg.wardNumber) details += `ਵਾਰਡ: ${reg.wardNumber}\n`;
        if (reg.mohalla) details += `ਮੁਹੱਲਾ: ${reg.mohalla}\n`;
        details += `ਮੋਬਾਈਲ: ${reg.mobileNumber || "*"}\n`;
        details += `ਆਧਾਰ: ${reg.aadhaarNumber ? `**** **** ${last4}` : "*"}\n`;
        details += `Valid: ${reg.validFrom ? new Date(reg.validFrom).toLocaleDateString("pa-IN") : "N/A"} - ${reg.validUntil ? new Date(reg.validUntil).toLocaleDateString("pa-IN") : "N/A"}\n`;
        const fn = `${reg.id}_${reg.name.replace(/[^a-zA-Z0-9ਅ-ੴ]/g, "_")}_${reg.village}`;
        zip.addFile(`${fn}.txt`, Buffer.from(details, "utf-8"));
        if (reg.photoData && reg.photoMimeType) {
          const ext = reg.photoMimeType.split("/")[1] || "jpg";
          zip.addFile(`${fn}.${ext}`, Buffer.from(reg.photoData, "base64"));
        }
        summary += `${reg.id}. ${reg.name} - ${reg.village}, ${reg.district} [${reg.cardNumber || "N/A"}] [${reg.status}]\n`;
      }

      zip.addFile("_summary.txt", Buffer.from(summary, "utf-8"));
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=registrations_${Date.now()}.zip`);
      res.send(zip.toBuffer());
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਊਨਲੋਡ ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  // ── Admin: CSV export ───────────────────────────────────
  app.get("/api/admin/registrations/export-csv", isAdminAuth, async (req, res) => {
    try {
      const allRegs = await storage.getRegistrations();
      const headers = [
        "Sr No", "Tracking ID", "Card Number", "Status", "ਨਾਮ", "ਆਹੁਦਾ",
        "ਪਿੰਡ/ਸ਼ਹਿਰ", "ਤਹਿਸੀਲ", "ਜ਼ਿਲ੍ਹਾ", "ਖੇਤਰ", "ਵਾਰਡ", "ਮੁਹੱਲਾ",
        "ਮੋਬਾਈਲ", "ਆਧਾਰ (ਆਖਰੀ 4)", "Valid From", "Valid Until", "Registration Date"
      ];
      const escape = (v: any) => {
        if (v == null) return "";
        const s = String(v);
        return s.includes(",") || s.includes('"') || s.includes("\n")
          ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = allRegs.map((r, i) => [
        i + 1,
        r.trackingId || "",
        r.cardNumber || "",
        r.status,
        r.name,
        r.designation || "",
        r.village,
        r.tehsil,
        r.district,
        r.areaType || "rural",
        r.wardNumber || "",
        r.mohalla || "",
        r.mobileNumber || "",
        r.aadhaarNumber ? r.aadhaarNumber.slice(-4) : "",
        r.validFrom ? new Date(r.validFrom).toLocaleDateString("en-IN") : "",
        r.validUntil ? new Date(r.validUntil).toLocaleDateString("en-IN") : "",
        r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "",
      ].map(escape).join(","));

      const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const date = new Date().toISOString().slice(0, 10);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=members_${date}.csv`);
      res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "CSV export ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  app.get("/api/admin/registrations/:id", isStaffAuth, async (req, res) => {
    try {
      const reg = await storage.getRegistration(parseInt(req.params.id));
      if (!reg) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      res.json(reg);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: permanent delete ──────────────────────────────
  app.delete("/api/admin/registrations/:id", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const reg = await storage.getRegistration(id);
      if (reg?.photoUrl) await deletePhotoFromR2(reg.photoUrl).catch(console.error);
      const deleted = await storage.deleteRegistration(id);
      if (!deleted) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      await storage.logActivity({ action: "Member Permanently Deleted", performedBy: getPerformedBy(req), role: "admin", remarks: `ID: ${id}, Name: ${reg?.name}` });
      res.json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮਿਟਾਈ ਗਈ" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Delete Requests ──────────────────────────────────────
  app.post("/api/admin/registrations/:id/delete-request", isStaffAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ message: "ਕਾਰਨ ਲੋੜੀਂਦਾ ਹੈ" });
      const reg = await storage.getRegistration(id);
      if (!reg) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      const by = getPerformedBy(req);
      const role = getPerformedByRole(req);
      const dr = await storage.createDeleteRequest({ memberId: id, memberName: reg.name, requestedBy: by, requestedByRole: role, reason });
      await storage.logActivity({ memberId: id, action: "Delete Requested", performedBy: by, role, remarks: reason });
      res.status(201).json(dr);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Request ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.get("/api/admin/delete-requests", isStaffAuth, async (req: any, res: any) => {
    try {
      const role = getPerformedByRole(req);
      const requests = role === "admin" ? await storage.getDeleteRequests() : await storage.getPendingDeleteRequests();
      res.json(requests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.post("/api/admin/delete-requests/:id/approve", isAdminAuth, async (req: any, res: any) => {
    try {
      const drId = parseInt(req.params.id);
      const by = getPerformedBy(req);
      const dr = await storage.resolveDeleteRequest(drId, by, true);
      if (!dr) return res.status(404).json({ message: "Request ਨਹੀਂ ਮਿਲੀ" });
      const reg = await storage.getRegistration(dr.memberId);
      if (reg?.photoUrl) await deletePhotoFromR2(reg.photoUrl).catch(console.error);
      await storage.deleteRegistration(dr.memberId);
      await storage.logActivity({ memberId: dr.memberId, action: "Delete Request Approved", performedBy: by, role: "admin" });
      res.json({ message: "ਮੈਂਬਰ ਮਿਟਾਇਆ ਗਿਆ" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.post("/api/admin/delete-requests/:id/reject", isAdminAuth, async (req: any, res: any) => {
    try {
      const drId = parseInt(req.params.id);
      const by = getPerformedBy(req);
      const dr = await storage.resolveDeleteRequest(drId, by, false);
      if (!dr) return res.status(404).json({ message: "Request ਨਹੀਂ ਮਿਲੀ" });
      await storage.logActivity({ memberId: dr.memberId, action: "Delete Request Rejected", performedBy: by, role: "admin" });
      res.json({ message: "Request ਰੱਦ ਕੀਤੀ" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਗਲਤੀ" });
    }
  });

  // ── Staff User Management ────────────────────────────────
  app.get("/api/admin/staff-users", isAdminAuth, async (req: any, res: any) => {
    try {
      const users = await storage.getStaffUsers();
      res.json(users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName, role: u.role, createdAt: u.createdAt })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.post("/api/admin/staff-users", isAdminAuth, async (req: any, res: any) => {
    try {
      const schema = z.object({
        username: z.string().min(3, "Username ਘੱਟੋ-ਘੱਟ 3 ਅੱਖਰ"),
        password: z.string().min(6, "Password ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰ"),
        displayName: z.string().min(1, "ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ"),
        role: z.enum(["admin", "state_meet_president", "state_president"]),
      });
      const parsed = schema.parse(req.body);
      const existing = await storage.getStaffUserByUsername(parsed.username);
      if (existing) return res.status(400).json({ message: "Username ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ" });
      const hashedPassword = await bcrypt.hash(parsed.password, 12);
      const user = await storage.createStaffUser({ ...parsed, password: hashedPassword });
      await storage.logActivity({ action: "Staff User Created", performedBy: getPerformedBy(req), role: "admin", remarks: `${parsed.username} (${parsed.role})` });
      res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      console.error(err);
      res.status(500).json({ message: "ਯੂਜ਼ਰ ਬਣਾਉਣ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.patch("/api/admin/staff-users/:id/password", isAdminAuth, async (req: any, res: any) => {
    try {
      const schema = z.object({ newPassword: z.string().min(6, "Password ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰ") });
      const { newPassword } = schema.parse(req.body);
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const updated = await storage.updateStaffUserPassword(parseInt(req.params.id), hashedPassword);
      if (!updated) return res.status(404).json({ message: "ਯੂਜ਼ਰ ਨਹੀਂ ਮਿਲਿਆ" });
      await storage.logActivity({ action: "Staff Password Changed", performedBy: getPerformedBy(req), role: "admin", remarks: `User ID: ${req.params.id}` });
      res.json({ message: "ਪਾਸਵਰਡ ਬਦਲਿਆ" });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      console.error(err);
      res.status(500).json({ message: "ਪਾਸਵਰਡ ਬਦਲਣ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.delete("/api/admin/staff-users/:id", isAdminAuth, async (req: any, res: any) => {
    try {
      const deleted = await storage.deleteStaffUser(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "ਯੂਜ਼ਰ ਨਹੀਂ ਮਿਲਿਆ" });
      await storage.logActivity({ action: "Staff User Deleted", performedBy: getPerformedBy(req), role: "admin", remarks: `ID: ${req.params.id}` });
      res.json({ message: "ਯੂਜ਼ਰ ਮਿਟਾਇਆ" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Activity Logs ────────────────────────────────────────
  app.get("/api/admin/activity-logs", isAdminAuth, async (req: any, res: any) => {
    try {
      const memberId = req.query.memberId ? parseInt(String(req.query.memberId)) : undefined;
      res.json(await storage.getActivityLogs(memberId));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Public: get updates ─────────────────────────────────
  app.get("/api/updates", async (req, res) => {
    try {
      res.json(await storage.getUpdates());
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: create update ─────────────────────────────────
  app.post("/api/admin/updates", isAdminAuth, upload.single("image"), async (req: any, res: any) => {
    try {
      const { title, content, eventDate } = req.body;
      if (!title || !content) return res.status(400).json({ message: "title ਅਤੇ content ਲੋੜੀਂਦੇ ਹਨ" });
      let imageUrl: string | undefined;
      if (req.file) {
        const ext = req.file.mimetype.split("/")[1] || "jpg";
        const fileName = `updates/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        try { imageUrl = await uploadPhotoToR2(req.file.buffer, req.file.mimetype, fileName); } catch (e) { console.error(e); }
      }
      const update = await storage.createUpdate({ title, content, imageUrl, eventDate: eventDate ? new Date(eventDate) : undefined });
      res.status(201).json(update);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update ਸੇਵ ਨਹੀਂ ਹੋਇਆ" });
    }
  });

  // ── Admin: edit update ───────────────────────────────────
  app.put("/api/admin/updates/:id", isAdminAuth, upload.single("image"), async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { title, content, eventDate, removeImage } = req.body;
      if (!title || !content) return res.status(400).json({ message: "title ਅਤੇ content ਲੋੜੀਂਦੇ ਹਨ" });
      let imageUrl: string | null | undefined = undefined;
      if (req.file) {
        const ext = req.file.mimetype.split("/")[1] || "jpg";
        const fileName = `updates/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        try { imageUrl = await uploadPhotoToR2(req.file.buffer, req.file.mimetype, fileName); } catch (e) { console.error(e); }
      } else if (removeImage === "true") {
        imageUrl = null;
      }
      const updated = await storage.updateUpdate(id, {
        title,
        content,
        imageUrl,
        eventDate: eventDate ? new Date(eventDate) : (eventDate === "" ? null : undefined),
      });
      if (!updated) return res.status(404).json({ message: "Update ਨਹੀਂ ਮਿਲਿਆ" });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update ਸੇਵ ਨਹੀਂ ਹੋਇਆ" });
    }
  });

  // ── Admin: delete update ─────────────────────────────────
  app.delete("/api/admin/updates/:id", isAdminAuth, async (req: any, res: any) => {
    try {
      const deleted = await storage.deleteUpdate(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Update ਨਹੀਂ ਮਿਲਿਆ" });
      res.json({ message: "Update Delete ਕੀਤਾ" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Delete ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Public: site stats ───────────────────────────────────
  app.get("/api/stats", async (req, res) => {
    try {
      const [total, today] = await Promise.all([storage.getTotalVisits(), storage.getTodayVisits()]);
      res.json({ total, today });
    } catch (err) {
      res.json({ total: 0, today: 0 });
    }
  });

  // ── Admin: analytics ────────────────────────────────────
  app.get("/api/admin/analytics", isAdminAuth, async (req: any, res: any) => {
    try {
      const days = Math.min(parseInt(String(req.query.days || "7")), 365) || 7;
      const [pageStats, totalVisits, todayVisits, dailyData] = await Promise.all([
        storage.getPageViewStats(),
        storage.getTotalVisits(),
        storage.getTodayVisits(),
        storage.getVisitsByDays(days),
      ]);
      res.json({ pageStats, totalVisits, todayVisits, dailyData, days });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Analytics ਲੋਡ ਨਹੀਂ ਹੋਈ" });
    }
  });

  // ── Card: proxy member photo (avoids CORS for canvas) ───
  app.get("/api/admin/registrations/:id/photo", isStaffAuth, async (req: any, res: any) => {
    try {
      const reg = await storage.getRegistration(parseInt(req.params.id));
      if (!reg) return res.status(404).send("Not found");
      if (reg.photoData && reg.photoMimeType) {
        const buf = Buffer.from(reg.photoData, "base64");
        res.setHeader("Content-Type", reg.photoMimeType);
        res.setHeader("Cache-Control", "max-age=3600");
        return res.send(buf);
      }
      if (reg.photoUrl) {
        const r = await fetch(reg.photoUrl);
        if (!r.ok) return res.status(404).send("Photo not found");
        const buf = Buffer.from(await r.arrayBuffer());
        res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");
        res.setHeader("Cache-Control", "max-age=3600");
        return res.send(buf);
      }
      res.status(404).send("No photo");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  });

  // ── Card: QR code PNG for a registration ────────────────
  app.get("/api/admin/registrations/:id/qr", isStaffAuth, async (req: any, res: any) => {
    try {
      const reg = await storage.getRegistration(parseInt(req.params.id));
      if (!reg) return res.status(404).send("Not found");
      const qrText = reg.cardNumber
        ? `https://kisan-union-punjab.fly.dev/?card=${reg.cardNumber}`
        : `https://kisan-union-punjab.fly.dev/?track=${reg.trackingId || reg.id}`;
      const buf = await generateQRCodeBuffer(qrText);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "max-age=3600");
      res.send(buf);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  });

  // ── Card template: serve current (R2 or static default) ─
  app.get("/api/card-template", async (req: any, res: any) => {
    try {
      const url = await storage.getSetting("card_template_url");
      if (url) {
        const r = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
        if (r.ok) {
          res.setHeader("Content-Type", "image/png");
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          return res.send(Buffer.from(await r.arrayBuffer()));
        }
      }
      res.redirect("/card-template.png");
    } catch { res.redirect("/card-template.png"); }
  });

  // ── Admin: serve stamp image ─────────────────────────────
  app.get("/api/admin/stamp", isStaffAuth, async (req: any, res: any) => {
    try {
      const url = await storage.getSetting("stamp_url");
      if (!url) return res.status(404).send("No stamp uploaded");
      const r = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
      if (!r.ok) return res.status(404).send("Stamp not found");
      res.setHeader("Content-Type", r.headers.get("content-type") || "image/png");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.send(Buffer.from(await r.arrayBuffer()));
    } catch (err) { console.error(err); res.status(500).send("Error"); }
  });

  // ── Admin: upload stamp image ────────────────────────────
  app.post("/api/admin/stamp", isAdminAuth, upload.single("stamp"), async (req: any, res: any) => {
    try {
      if (!req.file) return res.status(400).json({ message: "ਫਾਈਲ ਲੋੜੀਂਦੀ ਹੈ" });
      // Use timestamp in filename so R2 CDN never serves a cached old version
      const ext = req.file.mimetype === "image/jpeg" ? "jpg" : "png";
      const key = `stamp/v-${Date.now()}.${ext}`;
      const url = await uploadPhotoToR2(req.file.buffer, req.file.mimetype, key);
      await storage.setSetting("stamp_url", url);
      res.json({ url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਸਟੈਂਪ ਅੱਪਲੋਡ ਫੇਲ੍ਹ" });
    }
  });

  // ── Admin: upload new card template ─────────────────────
  app.post("/api/admin/card-template", isAdminAuth, upload.single("template"), async (req: any, res: any) => {
    try {
      if (!req.file) return res.status(400).json({ message: "ਫਾਈਲ ਲੋੜੀਂਦੀ ਹੈ" });
      // Use timestamp in filename so R2 CDN never serves a cached old version
      const ext = req.file.mimetype === "image/jpeg" ? "jpg" : "png";
      const key = `card-template/v-${Date.now()}.${ext}`;
      const url = await uploadPhotoToR2(req.file.buffer, req.file.mimetype, key);
      await storage.setSetting("card_template_url", url);
      res.json({ url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਟੈਂਪਲੇਟ ਅੱਪਲੋਡ ਫੇਲ੍ਹ" });
    }
  });

  // ── Admin: get card field config ─────────────────────────
  app.get("/api/admin/card-config", isStaffAuth, async (req: any, res: any) => {
    try {
      const [cfgVal, templateUrl] = await Promise.all([
        storage.getSetting("card_config"),
        storage.getSetting("card_template_url"),
      ]);
      const DEFAULT = {
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
      // Merge saved config with DEFAULT so any missing fields (e.g. stamp)
      // always get a sensible value even if the saved JSON predates that field.
      const saved = cfgVal ? JSON.parse(cfgVal) : {};
      const config: Record<string, unknown> = {};
      for (const key of Object.keys(DEFAULT)) {
        config[key] = (saved as Record<string, unknown>)[key] ?? (DEFAULT as Record<string, unknown>)[key];
      }
      res.json({ ...config, templateUrl: templateUrl || null });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Config ਲੋਡ ਫੇਲ੍ਹ" });
    }
  });

  // ── Admin: save card field config ────────────────────────
  app.put("/api/admin/card-config", isAdminAuth, async (req: any, res: any) => {
    try {
      await storage.setSetting("card_config", JSON.stringify(req.body));
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Config ਸੇਵ ਫੇਲ੍ਹ" });
    }
  });

  return httpServer;
}
