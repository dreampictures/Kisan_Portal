import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
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

  // — New workflow fields —
  trackingId: text("tracking_id").unique(),
  currentStage: text("current_stage").default("submitted"),
  submittedAt: timestamp("submitted_at"),

  meetPresidentStatus: text("meet_president_status"),
  meetPresidentBy: text("meet_president_by"),
  meetPresidentAt: timestamp("meet_president_at"),

  statePresidentStatus: text("state_president_status"),
  statePresidentBy: text("state_president_by"),
  statePresidentAt: timestamp("state_president_at"),

  adminStatus: text("admin_status"),
  adminBy: text("admin_by"),
  adminAt: timestamp("admin_at"),

  rejectedBy: text("rejected_by"),
  rejectedReason: text("rejected_reason"),
  rejectedAt: timestamp("rejected_at"),

  createdBy: text("created_by"),
  createdByRole: text("created_by_role"),
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

export const staffUsers = pgTable("staff_users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deleteRequests = pgTable("delete_requests", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  memberName: text("member_name").notNull(),
  requestedBy: text("requested_by").notNull(),
  requestedByRole: text("requested_by_role").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id"),
  action: text("action").notNull(),
  performedBy: text("performed_by").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  remarks: text("remarks"),
});

export type PageView = typeof pageViews.$inferSelect;
export type StaffUser = typeof staffUsers.$inferSelect;
export type DeleteRequest = typeof deleteRequests.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;

export const insertRegistrationSchema = createInsertSchema(registrations)
  .omit({ id: true, createdAt: true, photoData: true, photoMimeType: true, cardNumber: true, photoUrl: true, validFrom: true, validUntil: true, status: true, trackingId: true, currentStage: true, submittedAt: true, meetPresidentStatus: true, meetPresidentBy: true, meetPresidentAt: true, statePresidentStatus: true, statePresidentBy: true, statePresidentAt: true, adminStatus: true, adminBy: true, adminAt: true, rejectedBy: true, rejectedReason: true, rejectedAt: true, createdBy: true, createdByRole: true })
  .extend({
    aadhaarNumber: z.string().length(12, "ਆਧਾਰ ਨੰਬਰ 12 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ").optional().or(z.literal("")),
    mobileNumber: z.string().min(10, "ਮੋਬਾਈਲ ਨੰਬਰ 10 ਅੰਕ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ").optional().or(z.literal("")),
    areaType: z.enum(["rural", "urban"]).default("rural"),
    wardNumber: z.string().optional().or(z.literal("")),
    mohalla: z.string().optional().or(z.literal("")),
  });

export const insertUpdateSchema = createInsertSchema(updates)
  .omit({ id: true, createdAt: true });

export const insertStaffUserSchema = createInsertSchema(staffUsers)
  .omit({ id: true, createdAt: true });

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type InsertStaffUser = z.infer<typeof insertStaffUserSchema>;
