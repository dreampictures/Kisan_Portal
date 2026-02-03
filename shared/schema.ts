import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models (mandatory for Replit Auth)
export * from "./models/auth";

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").default("ਮੈਂਬਰ"),
  village: text("village").notNull(),
  tehsil: text("tehsil").notNull(),
  district: text("district").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  aadhaarNumber: text("aadhaar_number").notNull(),
  photoData: text("photo_data"), // Base64 encoded photo
  photoMimeType: text("photo_mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for the form validation (excluding ID/Dates/Photo fields)
export const insertRegistrationSchema = createInsertSchema(registrations)
  .omit({ id: true, createdAt: true, photoData: true, photoMimeType: true })
  .extend({
    aadhaarNumber: z.string().length(12, "ਆਧਾਰ ਨੰਬਰ 12 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ"),
    mobileNumber: z.string().min(10, "ਮੋਬਾਈਲ ਨੰਬਰ 10 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ"),
  });

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
