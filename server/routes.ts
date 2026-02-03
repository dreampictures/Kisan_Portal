import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import AdmZip from "adm-zip";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Admin emails that are allowed to access admin panel (lowercase only)
const ADMIN_EMAILS = ['help.dreampictures@gmail.com'];

// Middleware to check admin access
const isAdmin = (req: any, res: any, next: any) => {
  const userEmail = req.user?.claims?.email?.toLowerCase();
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return res.status(403).json({ message: "ਪ੍ਰਸ਼ਾਸਕ ਪਹੁੰਚ ਲੋੜੀਂਦੀ ਹੈ" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Public route: Submit registration (no auth required)
  app.post(api.registrations.submit.path, upload.single('photo'), async (req, res) => {
    try {
      // Parse and validate form data
      const bodySchema = insertRegistrationSchema.extend({
        name: z.string().min(1, "ਨਾਮ ਲੋੜੀਂਦਾ ਹੈ"),
        village: z.string().min(1, "ਪਿੰਡ ਲੋੜੀਂਦਾ ਹੈ"),
        tehsil: z.string().min(1, "ਤਹਿਸੀਲ ਲੋੜੀਂਦੀ ਹੈ"),
        district: z.string().min(1, "ਜ਼ਿਲ੍ਹਾ ਲੋੜੀਂਦਾ ਹੈ"),
      });

      const parsed = bodySchema.parse(req.body);
      
      // Convert photo to base64 if provided
      let photoData: string | undefined;
      let photoMimeType: string | undefined;
      
      if (req.file) {
        photoData = req.file.buffer.toString('base64');
        photoMimeType = req.file.mimetype;
      }

      const registration = await storage.createRegistration({
        ...parsed,
        photoData,
        photoMimeType,
      });

      res.status(201).json({ 
        message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ! ਤੁਹਾਡਾ ਕਾਰਡ ਜਲਦੀ ਹੀ ਤਿਆਰ ਕੀਤਾ ਜਾਵੇਗਾ।", 
        id: registration.id 
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error('Registration error:', err);
      res.status(500).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  // Admin routes (require authentication + admin check)
  app.get(api.registrations.list.path, isAuthenticated, isAdmin, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json(registrations);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.get('/api/admin/registrations/download', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allRegistrations = await storage.getRegistrations();
      
      const zip = new AdmZip();
      
      // Create a summary text file
      let summaryContent = "ਕਿਸਾਨ ਯੂਨੀਅਨ ਪੰਜਾਬ - ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸੂਚੀ\n";
      summaryContent += "=".repeat(50) + "\n\n";
      
      for (const reg of allRegistrations) {
        const last4Aadhaar = reg.aadhaarNumber.slice(-4);
        
        // Create individual text file for each registration
        let details = `ਨਾਮ: ${reg.name}\n`;
        details += `ਆਹੁਦਾ: ${reg.designation}\n`;
        details += `ਪਿੰਡ: ${reg.village}\n`;
        details += `ਤਹਿਸੀਲ: ${reg.tehsil}\n`;
        details += `ਜ਼ਿਲ੍ਹਾ: ${reg.district}\n`;
        details += `ਮੋਬਾਈਲ: ${reg.mobileNumber}\n`;
        details += `ਆਧਾਰ (ਆਖਰੀ 4 ਅੰਕ): **** **** ${last4Aadhaar}\n`;
        details += `ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮਿਤੀ: ${reg.createdAt?.toLocaleDateString('pa-IN') || 'N/A'}\n`;
        
        const fileName = `${reg.village}_${reg.tehsil}_${reg.district}_${last4Aadhaar}`;
        
        // Add text file
        zip.addFile(`${fileName}.txt`, Buffer.from(details, 'utf-8'));
        
        // Add photo if available
        if (reg.photoData && reg.photoMimeType) {
          const ext = reg.photoMimeType.split('/')[1] || 'jpg';
          const photoBuffer = Buffer.from(reg.photoData, 'base64');
          zip.addFile(`${fileName}.${ext}`, photoBuffer);
        }
        
        // Add to summary
        summaryContent += `${reg.id}. ${reg.name} - ${reg.village}, ${reg.district}\n`;
      }
      
      zip.addFile("_summary.txt", Buffer.from(summaryContent, 'utf-8'));
      
      const zipBuffer = zip.toBuffer();
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=registrations.zip');
      res.send(zipBuffer);
    } catch (err) {
      console.error('Error downloading registrations:', err);
      res.status(500).json({ message: "ਡਾਊਨਲੋਡ ਫੇਲ੍ਹ ਹੋ ਗਈ" });
    }
  });

  app.get('/api/admin/registrations/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getRegistration(id);
      
      if (!registration) {
        return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      }
      
      res.json(registration);
    } catch (err) {
      console.error('Error fetching registration:', err);
      res.status(500).json({ message: "ਡਾਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  app.delete('/api/admin/registrations/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRegistration(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ" });
      }
      
      res.json({ message: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮਿਟਾਈ ਗਈ" });
    } catch (err) {
      console.error('Error deleting registration:', err);
      res.status(500).json({ message: "ਮਿਟਾਉਣ ਵਿੱਚ ਗਲਤੀ" });
    }
  });

  // Check if user is admin
  app.get('/api/admin/check', isAuthenticated, isAdmin, (req, res) => {
    res.json({ isAdmin: true });
  });

  return httpServer;
}
