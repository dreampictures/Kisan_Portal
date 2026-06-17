import { db } from "./db";
import { registrations, type Registration } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

function generateCardNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KUP-${year}-${rand}`;
}

export interface IStorage {
  createRegistration(data: {
    name: string;
    designation?: string;
    village: string;
    tehsil: string;
    district: string;
    mobileNumber?: string;
    aadhaarNumber?: string;
    photoUrl?: string;
    photoData?: string;
    photoMimeType?: string;
  }): Promise<Registration>;
  updateRegistrationCard(id: number, data: {
    validFrom: Date;
    validUntil: Date;
    cardNumber?: string;
  }): Promise<Registration | undefined>;
  getRegistrations(): Promise<Registration[]>;
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationByCardNumber(cardNumber: string): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createRegistration(data: {
    name: string;
    designation?: string;
    village: string;
    tehsil: string;
    district: string;
    mobileNumber?: string;
    aadhaarNumber?: string;
    photoUrl?: string;
    photoData?: string;
    photoMimeType?: string;
  }): Promise<Registration> {
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
        mobileNumber: data.mobileNumber || null,
        aadhaarNumber: data.aadhaarNumber || null,
        photoUrl: data.photoUrl || null,
        photoData: data.photoData || null,
        photoMimeType: data.photoMimeType || null,
      })
      .returning();
    return registration;
  }

  async updateRegistrationCard(id: number, data: {
    validFrom: Date;
    validUntil: Date;
    cardNumber?: string;
  }): Promise<Registration | undefined> {
    const updateData: any = {
      validFrom: data.validFrom,
      validUntil: data.validUntil,
    };
    if (data.cardNumber) updateData.cardNumber = data.cardNumber;
    const [updated] = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();
    return updated;
  }

  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
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
}

export const storage = new DatabaseStorage();
