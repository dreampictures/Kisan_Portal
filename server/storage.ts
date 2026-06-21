import { db } from "./db";
import { registrations, updates, pageViews, type Registration, type Update } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

function generateCardNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KSCPKB-${rand}`;
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
};

export interface IStorage {
  createRegistration(data: RegistrationData): Promise<Registration>;
  updateRegistration(id: number, data: Partial<RegistrationData>): Promise<Registration | undefined>;
  updateRegistrationCard(id: number, data: {
    validFrom: Date;
    validUntil: Date;
    cardNumber?: string;
  }): Promise<Registration | undefined>;
  approveRegistration(id: number): Promise<Registration | undefined>;
  rejectRegistration(id: number): Promise<boolean>;
  getRegistrations(): Promise<Registration[]>;
  getPendingRegistrations(): Promise<Registration[]>;
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationByCardNumber(cardNumber: string): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;

  // Updates
  getUpdates(): Promise<Update[]>;
  createUpdate(data: { title: string; content: string; imageUrl?: string; eventDate?: Date }): Promise<Update>;
  deleteUpdate(id: number): Promise<boolean>;

  // Analytics
  recordPageView(page: string): Promise<void>;
  getPageViewStats(): Promise<{ page: string; count: number }[]>;
  getTotalVisits(): Promise<number>;
  getVisitsLast7Days(): Promise<{ date: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async createRegistration(data: RegistrationData): Promise<Registration> {
    const cardNumber = generateCardNumber();
    const [registration] = await db
      .insert(registrations)
      .values({
        cardNumber,
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
    const [updated] = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();
    return updated;
  }

  async updateRegistrationCard(id: number, data: {
    validFrom: Date;
    validUntil: Date;
    cardNumber?: string;
  }): Promise<Registration | undefined> {
    const updateData: any = {
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      status: "approved",
    };
    if (data.cardNumber) updateData.cardNumber = data.cardNumber;
    const [updated] = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();
    return updated;
  }

  async approveRegistration(id: number): Promise<Registration | undefined> {
    const [updated] = await db
      .update(registrations)
      .set({ status: "approved" })
      .where(eq(registrations.id, id))
      .returning();
    return updated;
  }

  async rejectRegistration(id: number): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
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

  async deleteRegistration(id: number): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
  }

  // ── Updates ──────────────────────────────────────────────
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

  // ── Analytics ─────────────────────────────────────────────
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
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViews);
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
}

export const storage = new DatabaseStorage();
