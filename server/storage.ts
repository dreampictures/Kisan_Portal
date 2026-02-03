import { db } from "./db";
import {
  registrations,
  type Registration
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createRegistration(data: {
    name: string;
    designation?: string;
    village: string;
    tehsil: string;
    district: string;
    mobileNumber: string;
    aadhaarNumber: string;
    photoData?: string;
    photoMimeType?: string;
  }): Promise<Registration>;
  getRegistrations(): Promise<Registration[]>;
  getRegistration(id: number): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createRegistration(data: {
    name: string;
    designation?: string;
    village: string;
    tehsil: string;
    district: string;
    mobileNumber: string;
    aadhaarNumber: string;
    photoData?: string;
    photoMimeType?: string;
  }): Promise<Registration> {
    const [registration] = await db
      .insert(registrations)
      .values({
        name: data.name,
        designation: data.designation || "ਮੈਂਬਰ",
        village: data.village,
        tehsil: data.tehsil,
        district: data.district,
        mobileNumber: data.mobileNumber,
        aadhaarNumber: data.aadhaarNumber,
        photoData: data.photoData,
        photoMimeType: data.photoMimeType,
      })
      .returning();
    return registration;
  }

  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async getRegistration(id: number): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
    return registration;
  }

  async deleteRegistration(id: number): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
