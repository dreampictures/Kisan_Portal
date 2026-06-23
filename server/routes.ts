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
const ADMIN_PIN = "1103";

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

  // ── Page view tracking middleware ────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api") && !req.path.includes(".")) {
      const page = req.path || "/";
      storage.recordPageView(page).catch(() => {});
    }
    next();
  });

  // ── Admin login ──────────────────────────────────────────
  app.post("/api/admin/login", async (req: any, res: any) => {
    const { username, password } = req.body;

    // Check staff_users table first
    const staffUser = await storage.getStaffUserByUsername(username).catch(() => undefined);
    if (staffUser && staffUser.password === password) {
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

  app.post("/api/admin/verify-pin", isPasswordAuth, (req: any, res: any) => {
    const { pin } = req.body;
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
  app.get("/api/track", async (req: any, res: any) => {
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

      const result = regs.map(r => ({
        id: r.id,
        trackingId: r.trackingId,
        name: r.name,
        village: r.village,
        district: r.district,
        currentStage: r.currentStage || "submitted",
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
        cardNumber: r.cardNumber,
        validFrom: r.validFrom,
        validUntil: r.validUntil,
      }));

      res.json(result);
    } catch (err) {
      console.error("Track error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Public: submit registration ──────────────────────────
  app.post(api.registrations.submit.path, upload.single("photo"), async (req, res) => {
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

      if (req.file) {
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
      const updated = await storage.meetPresidentReject(id, reason, by);
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
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
      const updated = await storage.statePresidentReject(id, reason, by);
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      await storage.logActivity({ memberId: id, action: "State President Rejected", performedBy: by, role: getPerformedByRole(req), remarks: reason });
      res.json({ message: "Reject ਕੀਤਾ", registration: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Reject ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: approve registration ──────────────────────────
  app.post("/api/admin/registrations/:id/approve", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const by = getPerformedBy(req);
      const updated = await storage.approveRegistration(id, by, "admin");
      if (!updated) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      await storage.logActivity({ memberId: id, action: "Admin Approved", performedBy: by, role: "admin" });
      res.json({ message: "ਅਪ੍ਰੂਵ ਕੀਤਾ", registration: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "ਅਪ੍ਰੂਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // ── Admin: reject registration (mark as rejected) ────────
  app.delete("/api/admin/registrations/:id/reject", isAdminAuth, async (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const by = getPerformedBy(req);
      const reg = await storage.getRegistration(id);
      if (!reg) return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      const updated = await storage.rejectRegistration(id, reason || "Admin rejected", by, "admin");
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
  app.patch("/api/admin/registrations/:id", isStaffAuth, async (req: any, res: any) => {
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
      });
      const parsed = editSchema.parse(req.body);
      const updated = await storage.updateRegistration(id, parsed);
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
        password: z.string().min(4, "Password ਘੱਟੋ-ਘੱਟ 4 ਅੱਖਰ"),
        displayName: z.string().min(1, "ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ"),
        role: z.enum(["admin", "state_meet_president", "state_president"]),
      });
      const parsed = schema.parse(req.body);
      const existing = await storage.getStaffUserByUsername(parsed.username);
      if (existing) return res.status(400).json({ message: "Username ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ" });
      const user = await storage.createStaffUser(parsed);
      await storage.logActivity({ action: "Staff User Created", performedBy: getPerformedBy(req), role: "admin", remarks: `${parsed.username} (${parsed.role})` });
      res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      console.error(err);
      res.status(500).json({ message: "ਯੂਜ਼ਰ ਬਣਾਉਣ ਵਿੱਚ ਗਲਤੀ" });
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

  return httpServer;
}
