import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
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
  areaType: text("area_type").default("rural"),
  wardNumber: text("ward_number"),
  mohalla: text("mohalla"),
  mobileNumber: text("mobile_number"),
  aadhaarNumber: text("aadhaar_number"),
  photoUrl: text("photo_url"),
  photoData: text("photo_data"),
  photoMimeType: text("photo_mime_type"),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  eventDate: timestamp("event_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export type PageView = typeof pageViews.$inferSelect;

export const insertRegistrationSchema = createInsertSchema(registrations)
  .omit({ id: true, createdAt: true, photoData: true, photoMimeType: true, cardNumber: true, photoUrl: true, validFrom: true, validUntil: true, status: true })
  .extend({
    aadhaarNumber: z.string().length(12, "ਆਧਾਰ ਨੰਬਰ 12 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ").optional().or(z.literal("")),
    mobileNumber: z.string().min(10, "ਮੋਬਾਈਲ ਨੰਬਰ 10 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ").optional().or(z.literal("")),
    areaType: z.enum(["rural", "urban"]).default("rural"),
    wardNumber: z.string().optional().or(z.literal("")),
    mohalla: z.string().optional().or(z.literal("")),
  });

export const insertUpdateSchema = createInsertSchema(updates)
  .omit({ id: true, createdAt: true });

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
