import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { api } from "@shared/routes";
import { z } from "zod";

const upload = multer({ dest: "/tmp/uploads/" });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // We use this route for the form submission
  app.post("/api/generate-card", upload.single("photo"), async (req, res) => {
    try {
      const { name, designation, village, tehsil, district, mobileNumber, aadhaarNumber } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "Photo is required" });
      }

      // 1. Read the HTML template
      const templatePath = path.join(process.cwd(), "attached_assets", "index_1770098091792.html");
      let htmlContent = await fs.promises.readFile(templatePath, "utf-8");

      // 2. Replace placeholders
      // Note: The template has specific hardcoded values we need to replace. 
      // Based on the file content:
      // <h2>ਨਾਮ : ਭਗਵੰਤ ਸਿੰਘ</h2> -> Name
      // <h2>ਆਹੁਦਾ : ਮੈਂਬਰ</h2> -> Designation
      // <h2>ਪਤਾ : ਹਰੀਕੇ</h2> -> Village
      // <h2>ਤਹਿ.:  ਤਰਨ ਤਾਰਨ</h2> -> Tehsil
      // <h2>ਜ਼ਿਲ੍ਹਾ: ਤਰਨਤਾਰਨ</h2> -> District
      // **** **** 2059 -> Last 4 of Aadhaar
      // Phone/Email might be static based on the request "Name his village his tehsil his district and the last 4 characters of his aadhaar card"

      const last4Aadhaar = aadhaarNumber.slice(-4);
      
      // Simple string replacements based on the structure we saw
      // We'll use regex to be a bit more robust against whitespace
      htmlContent = htmlContent.replace(/ਨਾਮ\s*:\s*[^<]+/g, `ਨਾਮ : ${name}`);
      htmlContent = htmlContent.replace(/ਆਹੁਦਾ\s*:\s*[^<]+/g, `ਆਹੁਦਾ : ${designation}`);
      htmlContent = htmlContent.replace(/ਪਤਾ\s*:\s*[^<]+/g, `ਪਤਾ : ${village}`);
      htmlContent = htmlContent.replace(/ਤਹਿ\.\s*:\s*[^<]+/g, `ਤਹਿ.: ${tehsil}`);
      htmlContent = htmlContent.replace(/ਜ਼ਿਲ੍ਹਾ\s*:\s*[^<]+/g, `ਜ਼ਿਲ੍ਹਾ: ${district}`);
      htmlContent = htmlContent.replace(/\*\*\*\*\s*\*\*\*\*\s*\d{4}/g, `**** **** ${last4Aadhaar}`);

      // We also need to handle the image. 
      // The template uses an external URL: <img src="https://1drv.ms/...">
      // We should embed the uploaded image as base64 to ensure it works offline/locally
      const imageBuffer = await fs.promises.readFile(file.path);
      const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString("base64")}`;
      
      // Replace the image src
      // Finding the img tag with the specific src or just the first img in header
      htmlContent = htmlContent.replace(/<img src="https:\/\/1drv\.ms[^"]+">/, `<img src="${base64Image}" style="max-width: 100%; height: auto;">`);

      // 3. Create Text File content
      const textContent = `Name: ${name}
Designation: ${designation}
Village: ${village}
Tehsil: ${tehsil}
District: ${district}
Mobile Number: ${mobileNumber}
Aadhaar Number: ${aadhaarNumber} (Last 4: ${last4Aadhaar})
Generated on: ${new Date().toLocaleString()}
`;

      // 4. Create ZIP
      const zip = new AdmZip();
      zip.addFile("identity_card.html", Buffer.from(htmlContent, "utf-8"));
      zip.addFile("details.txt", Buffer.from(textContent, "utf-8"));

      // 5. Send ZIP
      const zipBuffer = zip.toBuffer();
      
      res.set("Content-Type", "application/zip");
      res.set("Content-Disposition", `attachment; filename=identity_card_${name.replace(/\s+/g, "_")}.zip`);
      res.set("Content-Length", String(zipBuffer.length));
      res.send(zipBuffer);

      // Cleanup temp file
      await fs.promises.unlink(file.path).catch(console.error);

    } catch (error) {
      console.error("Error generating card:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
