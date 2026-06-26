import { db } from "./db";
import { registrations, updates, pageViews, staffUsers, deleteRequests, activityLogs, type Registration, type Update, type StaffUser, type DeleteRequest, type ActivityLog } from "@shared/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

function generateCardNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KSCPKB-${rand}`;
}

function generateTrackingId(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TRK-${rand}`;
}

type RegistrationData = {
  name: string;
  designation?: string;
  village: string;
  tehsil: string;
  district: string;
  areaType?: string;
  wardNumber?: string;
  mohalla?: string;
  mobileNumber?: string;
  aadhaarNumber?: string;
  photoUrl?: string;
  photoData?: string;
  photoMimeType?: string;
  status?: string;
  createdBy?: string;
  createdByRole?: string;
};

export interface IStorage {
  createRegistration(data: RegistrationData): Promise<Registration>;
  updateRegistration(id: number, data: Partial<RegistrationData>): Promise<Registration | undefined>;
  updateRegistrationCard(id: number, data: { validFrom: Date; validUntil: Date; cardNumber?: string; performedBy?: string; }): Promise<Registration | undefined>;
  approveRegistration(id: number, performedBy?: string, performedByRole?: string): Promise<Registration | undefined>;
  rejectRegistration(id: number, reason?: string, performedBy?: string, performedByRole?: string): Promise<Registration | undefined>;
  getRegistrations(): Promise<Registration[]>;
  getPendingRegistrations(): Promise<Registration[]>;
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationByCardNumber(cardNumber: string): Promise<Registration | undefined>;
  getRegistrationByTrackingId(trackingId: string): Promise<Registration | undefined>;
  getRegistrationsByMobile(mobile: string): Promise<Registration[]>;
  deleteRegistration(id: number): Promise<boolean>;

  meetPresidentApprove(id: number, performedBy: string): Promise<Registration | undefined>;
  meetPresidentReject(id: number, reason: string, performedBy: string): Promise<Registration | undefined>;
  statePresidentApprove(id: number, performedBy: string): Promise<Registration | undefined>;
  statePresidentReject(id: number, reason: string, performedBy: string): Promise<Registration | undefined>;
  adminApprove(id: number, performedBy: string): Promise<Registration | undefined>;

  getUpdates(): Promise<Update[]>;
  createUpdate(data: { title: string; content: string; imageUrl?: string; eventDate?: Date }): Promise<Update>;
  deleteUpdate(id: number): Promise<boolean>;

  recordPageView(page: string): Promise<void>;
  getPageViewStats(): Promise<{ page: string; count: number }[]>;
  getTotalVisits(): Promise<number>;
  getVisitsLast7Days(): Promise<{ date: string; count: number }[]>;
  getVisitsByDays(days: number): Promise<{ date: string; count: number }[]>;
  getTodayVisits(): Promise<number>;

  getStaffUsers(): Promise<StaffUser[]>;
  getStaffUserByUsername(username: string): Promise<StaffUser | undefined>;
  createStaffUser(data: { username: string; password: string; displayName: string; role: string }): Promise<StaffUser>;
  deleteStaffUser(id: number): Promise<boolean>;

  createDeleteRequest(data: { memberId: number; memberName: string; requestedBy: string; requestedByRole: string; reason: string }): Promise<DeleteRequest>;
  getDeleteRequests(): Promise<DeleteRequest[]>;
  getPendingDeleteRequests(): Promise<DeleteRequest[]>;
  resolveDeleteRequest(id: number, resolvedBy: string, approved: boolean): Promise<DeleteRequest | undefined>;

  logActivity(data: { memberId?: number; action: string; performedBy: string; role: string; remarks?: string }): Promise<void>;
  getActivityLogs(memberId?: number): Promise<ActivityLog[]>;

  getDashboardStats(): Promise<{
    total: number;
    submitted: number;
    meetPresidentReview: number;
    statePresidentReview: number;
    adminReview: number;
    approved: number;
    rejected: number;
    cardIssued: number;
    pendingDeleteRequests: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async createRegistration(data: RegistrationData): Promise<Registration> {
    const cardNumber = generateCardNumber();
    let trackingId = generateTrackingId();
    let tries = 0;
    while (tries < 5) {
      const existing = await db.select({ id: registrations.id }).from(registrations).where(eq(registrations.trackingId, trackingId));
      if (!existing.length) break;
      trackingId = generateTrackingId();
      tries++;
    }

    const [registration] = await db
      .insert(registrations)
      .values({
        cardNumber,
        trackingId,
        name: data.name,
        designation: data.designation || "ਮੈਂਬਰ",
        village: data.village,
        tehsil: data.tehsil,
        district: data.district,
        areaType: data.areaType || "rural",
        wardNumber: data.wardNumber || null,
        mohalla: data.mohalla || null,
        mobileNumber: data.mobileNumber || null,
        aadhaarNumber: data.aadhaarNumber || null,
        photoUrl: data.photoUrl || null,
        photoData: data.photoData || null,
        photoMimeType: data.photoMimeType || null,
        status: data.status || "pending",
        currentStage: data.status === "approved" ? "approved" : "submitted",
        submittedAt: new Date(),
        createdBy: data.createdBy || null,
        createdByRole: data.createdByRole || null,
      })
      .returning();
    return registration;
  }

  async updateRegistration(id: number, data: Partial<RegistrationData>): Promise<Registration | undefined> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.village !== undefined) updateData.village = data.village;
    if (data.tehsil !== undefined) updateData.tehsil = data.tehsil;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.areaType !== undefined) updateData.areaType = data.areaType;
    if (data.wardNumber !== undefined) updateData.wardNumber = data.wardNumber || null;
    if (data.mohalla !== undefined) updateData.mohalla = data.mohalla || null;
    if (data.mobileNumber !== undefined) updateData.mobileNumber = data.mobileNumber || null;
    if (data.aadhaarNumber !== undefined) updateData.aadhaarNumber = data.aadhaarNumber || null;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl || null;
    if (data.photoData !== undefined) updateData.photoData = data.photoData || null;
    if (data.photoMimeType !== undefined) updateData.photoMimeType = data.photoMimeType || null;
    const [updated] = await db.update(registrations).set(updateData).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async updateRegistrationCard(id: number, data: { validFrom: Date; validUntil: Date; cardNumber?: string; performedBy?: string }): Promise<Registration | undefined> {
    const updateData: any = {
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      status: "approved",
      currentStage: "card_issued",
      adminAt: new Date(),
    };
    if (data.cardNumber) updateData.cardNumber = data.cardNumber;
    if (data.performedBy) updateData.adminBy = data.performedBy;
    const [updated] = await db.update(registrations).set(updateData).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async approveRegistration(id: number, performedBy?: string, performedByRole?: string): Promise<Registration | undefined> {
    const updateData: any = {
      status: "approved",
      currentStage: "approved",
      adminAt: new Date(),
    };
    if (performedBy) updateData.adminBy = performedBy;
    if (performedBy) updateData.adminStatus = "approved";
    const [updated] = await db.update(registrations).set(updateData).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async rejectRegistration(id: number, reason?: string, performedBy?: string, performedByRole?: string): Promise<Registration | undefined> {
    const now = new Date();
    const updateData: any = {
      status: "rejected",
      currentStage: "rejected",
      rejectedAt: now,
    };
    if (reason) updateData.rejectedReason = reason;
    if (performedBy) updateData.rejectedBy = performedBy;
    const [updated] = await db.update(registrations).set(updateData).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async meetPresidentApprove(id: number, performedBy: string): Promise<Registration | undefined> {
    const [updated] = await db.update(registrations).set({
      meetPresidentStatus: "approved",
      meetPresidentBy: performedBy,
      meetPresidentAt: new Date(),
      currentStage: "state_president_review",
    }).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async meetPresidentReject(id: number, reason: string, performedBy: string): Promise<Registration | undefined> {
    const [updated] = await db.update(registrations).set({
      meetPresidentStatus: "rejected",
      meetPresidentBy: performedBy,
      meetPresidentAt: new Date(),
      status: "rejected",
      currentStage: "rejected",
      rejectedBy: performedBy,
      rejectedReason: reason,
      rejectedAt: new Date(),
    }).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async statePresidentApprove(id: number, performedBy: string): Promise<Registration | undefined> {
    const [updated] = await db.update(registrations).set({
      statePresidentStatus: "approved",
      statePresidentBy: performedBy,
      statePresidentAt: new Date(),
      currentStage: "admin_review",
    }).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async statePresidentReject(id: number, reason: string, performedBy: string): Promise<Registration | undefined> {
    const [updated] = await db.update(registrations).set({
      statePresidentStatus: "rejected",
      statePresidentBy: performedBy,
      statePresidentAt: new Date(),
      status: "rejected",
      currentStage: "rejected",
      rejectedBy: performedBy,
      rejectedReason: reason,
      rejectedAt: new Date(),
    }).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async adminApprove(id: number, performedBy: string): Promise<Registration | undefined> {
    const [updated] = await db.update(registrations).set({
      adminStatus: "approved",
      adminBy: performedBy,
      adminAt: new Date(),
      status: "approved",
      currentStage: "approved",
    }).where(eq(registrations.id, id)).returning();
    return updated;
  }

  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async getPendingRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations)
      .where(eq(registrations.status, "pending"))
      .orderBy(desc(registrations.createdAt));
  }

  async getRegistration(id: number): Promise<Registration | undefined> {
    const [r] = await db.select().from(registrations).where(eq(registrations.id, id));
    return r;
  }

  async getRegistrationByCardNumber(cardNumber: string): Promise<Registration | undefined> {
    const [r] = await db.select().from(registrations).where(eq(registrations.cardNumber, cardNumber));
    return r;
  }

  async getRegistrationByTrackingId(trackingId: string): Promise<Registration | undefined> {
    const [r] = await db.select().from(registrations).where(eq(registrations.trackingId, trackingId));
    return r;
  }

  async getRegistrationsByMobile(mobile: string): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.mobileNumber, mobile)).orderBy(desc(registrations.createdAt));
  }

  async deleteRegistration(id: number): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
  }

  async getUpdates(): Promise<Update[]> {
    return await db.select().from(updates).orderBy(desc(updates.createdAt));
  }

  async createUpdate(data: { title: string; content: string; imageUrl?: string; eventDate?: Date }): Promise<Update> {
    const [update] = await db.insert(updates).values({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl || null,
      eventDate: data.eventDate || null,
    }).returning();
    return update;
  }

  async deleteUpdate(id: number): Promise<boolean> {
    const result = await db.delete(updates).where(eq(updates.id, id)).returning();
    return result.length > 0;
  }

  async recordPageView(page: string): Promise<void> {
    await db.insert(pageViews).values({ page });
  }

  async getPageViewStats(): Promise<{ page: string; count: number }[]> {
    const rows = await db
      .select({ page: pageViews.page, count: sql<number>`count(*)::int` })
      .from(pageViews)
      .groupBy(pageViews.page)
      .orderBy(sql`count(*) desc`);
    return rows;
  }

  async getTotalVisits(): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(pageViews);
    return row?.count ?? 0;
  }

  async getVisitsLast7Days(): Promise<{ date: string; count: number }[]> {
    const rows = await db
      .select({
        date: sql<string>`date_trunc('day', ${pageViews.viewedAt})::date::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(pageViews)
      .where(sql`${pageViews.viewedAt} >= now() - interval '7 days'`)
      .groupBy(sql`date_trunc('day', ${pageViews.viewedAt})`)
      .orderBy(sql`date_trunc('day', ${pageViews.viewedAt})`);
    return rows;
  }

  async getVisitsByDays(days: number): Promise<{ date: string; count: number }[]> {
    const rows = await db
      .select({
        date: sql<string>`date_trunc('day', ${pageViews.viewedAt})::date::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(pageViews)
      .where(sql`${pageViews.viewedAt} >= now() - interval '1 day' * ${days}`)
      .groupBy(sql`date_trunc('day', ${pageViews.viewedAt})`)
      .orderBy(sql`date_trunc('day', ${pageViews.viewedAt})`);
    return rows;
  }

  async getTodayVisits(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(sql`${pageViews.viewedAt} >= date_trunc('day', now())`);
    return row?.count ?? 0;
  }

  async getStaffUsers(): Promise<StaffUser[]> {
    return await db.select().from(staffUsers).orderBy(desc(staffUsers.createdAt));
  }

  async getStaffUserByUsername(username: string): Promise<StaffUser | undefined> {
    const [u] = await db.select().from(staffUsers).where(eq(staffUsers.username, username));
    return u;
  }

  async createStaffUser(data: { username: string; password: string; displayName: string; role: string }): Promise<StaffUser> {
    const [u] = await db.insert(staffUsers).values(data).returning();
    return u;
  }

  async deleteStaffUser(id: number): Promise<boolean> {
    const result = await db.delete(staffUsers).where(eq(staffUsers.id, id)).returning();
    return result.length > 0;
  }

  async updateStaffUserPassword(id: number, newPassword: string): Promise<boolean> {
    const result = await db.update(staffUsers).set({ password: newPassword }).where(eq(staffUsers.id, id)).returning();
    return result.length > 0;
  }

  async createDeleteRequest(data: { memberId: number; memberName: string; requestedBy: string; requestedByRole: string; reason: string }): Promise<DeleteRequest> {
    const [req] = await db.insert(deleteRequests).values({ ...data, status: "pending" }).returning();
    return req;
  }

  async getDeleteRequests(): Promise<DeleteRequest[]> {
    return await db.select().from(deleteRequests).orderBy(desc(deleteRequests.createdAt));
  }

  async getPendingDeleteRequests(): Promise<DeleteRequest[]> {
    return await db.select().from(deleteRequests).where(eq(deleteRequests.status, "pending")).orderBy(desc(deleteRequests.createdAt));
  }

  async resolveDeleteRequest(id: number, resolvedBy: string, approved: boolean): Promise<DeleteRequest | undefined> {
    const [updated] = await db.update(deleteRequests).set({
      status: approved ? "approved" : "rejected",
      resolvedBy,
      resolvedAt: new Date(),
    }).where(eq(deleteRequests.id, id)).returning();
    return updated;
  }

  async logActivity(data: { memberId?: number; action: string; performedBy: string; role: string; remarks?: string }): Promise<void> {
    await db.insert(activityLogs).values({
      memberId: data.memberId || null,
      action: data.action,
      performedBy: data.performedBy,
      role: data.role,
      remarks: data.remarks || null,
    });
  }

  async getActivityLogs(memberId?: number): Promise<ActivityLog[]> {
    if (memberId) {
      return await db.select().from(activityLogs).where(eq(activityLogs.memberId, memberId)).orderBy(desc(activityLogs.timestamp));
    }
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(200);
  }

  async getDashboardStats() {
    const all = await db.select({ id: registrations.id, status: registrations.status, currentStage: registrations.currentStage, cardNumber: registrations.cardNumber, validFrom: registrations.validFrom, validUntil: registrations.validUntil }).from(registrations);
    const pendingDeletes = await db.select({ id: deleteRequests.id }).from(deleteRequests).where(eq(deleteRequests.status, "pending"));

    const submitted = all.filter(r => r.currentStage === "submitted" && r.status === "pending").length;
    const meetPresidentReview = all.filter(r => r.currentStage === "state_president_review" && r.status === "pending").length;
    const statePresidentReview = all.filter(r => r.currentStage === "admin_review" && r.status === "pending").length;
    const adminReview = all.filter(r => r.currentStage === "approved" && r.status === "approved" && !r.cardNumber).length;
    const approved = all.filter(r => r.status === "approved").length;
    const rejected = all.filter(r => r.status === "rejected").length;
    const cardIssued = all.filter(r => r.currentStage === "card_issued").length;

    return {
      total: all.length,
      submitted,
      meetPresidentReview,
      statePresidentReview,
      adminReview,
      approved,
      rejected,
      cardIssued,
      pendingDeleteRequests: pendingDeletes.length,
    };
  }
}

export const storage = new DatabaseStorage();
