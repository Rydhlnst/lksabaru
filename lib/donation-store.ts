import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { donationSubmissions } from "./db/schema";

export type DonationSubmission = typeof donationSubmissions.$inferSelect;

export async function listDonationSubmissions() {
  if (!db) return [] as DonationSubmission[];
  return db.select().from(donationSubmissions).orderBy(desc(donationSubmissions.createdAt));
}

export async function listVerifiedDonations() {
  if (!db) return [] as DonationSubmission[];
  return db.select().from(donationSubmissions).where(eq(donationSubmissions.status, "verified"));
}

export async function createDonationSubmission(input: Omit<typeof donationSubmissions.$inferInsert, "id">) {
  if (!db) throw new Error("Database unavailable");
  const [submission] = await db.insert(donationSubmissions).values({ id: `donation-${crypto.randomUUID()}`, ...input }).returning();
  return submission;
}

/** Untuk badge navigasi; tidak boleh menjatuhkan layout bila database sedang bermasalah. */
export async function countPendingDonations() {
  if (!db) return 0;
  try {
    const [row] = await db.select({ value: count() }).from(donationSubmissions).where(eq(donationSubmissions.status, "pending"));
    return row?.value ?? 0;
  } catch {
    return 0;
  }
}
