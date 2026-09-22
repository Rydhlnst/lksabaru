import "server-only";

import { desc, eq } from "drizzle-orm";
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
