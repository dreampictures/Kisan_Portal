import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").default("Member"),
  village: text("village").notNull(),
  tehsil: text("tehsil").notNull(),
  district: text("district").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  aadhaarNumber: text("aadhaar_number").notNull(),
  photoUrl: text("photo_url"), // Path to temp file if needed, or just for schema
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for the form validation (excluding ID/Dates)
export const insertRegistrationSchema = createInsertSchema(registrations)
  .omit({ id: true, createdAt: true, photoUrl: true })
  .extend({
    // We handle file upload separately in the multipart form, but we can validate other fields here
    aadhaarNumber: z.string().length(12, "Aadhaar number must be 12 digits"),
    mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  });

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
