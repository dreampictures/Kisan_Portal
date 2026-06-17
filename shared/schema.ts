import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  cardNumber: text("card_number").unique(),
  name: text("name").notNull(),
  designation: text("designation").default("ਮੈਂਬਰ"),
  village: text("village").notNull(),
  tehsil: text("tehsil").notNull(),
  district: text("district").notNull(),
  mobileNumber: text("mobile_number"),
  aadhaarNumber: text("aadhaar_number"),
  photoUrl: text("photo_url"),
  photoData: text("photo_data"),
  photoMimeType: text("photo_mime_type"),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrations)
  .omit({ id: true, createdAt: true, photoData: true, photoMimeType: true, cardNumber: true, photoUrl: true, validFrom: true, validUntil: true })
  .extend({
    aadhaarNumber: z.string().length(12, "ਆਧਾਰ ਨੰਬਰ 12 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ").optional().or(z.literal("")),
    mobileNumber: z.string().min(10, "ਮੋਬਾਈਲ ਨੰਬਰ 10 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ").optional().or(z.literal("")),
  });

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
