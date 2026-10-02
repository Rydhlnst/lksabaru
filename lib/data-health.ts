import "server-only";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { siteSettings } from "./db/schema";
import { pingStorage } from "./media-storage";

export type DataHealth = {
  database: "connected" | "error" | "missing";
  content: "database" | "file" | "unseeded";
  storage: Awaited<ReturnType<typeof pingStorage>>;
};

export async function getDataHealth(): Promise<DataHealth> {
  const pendingStorage = pingStorage();
  if (!db) return { database: "missing", content: "file", storage: await pendingStorage };
  try {
    const [storage, rows] = await Promise.all([pendingStorage, db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.id, "singleton")).limit(1)]);
    return { database: "connected", content: rows.length ? "database" : "unseeded", storage };
  } catch {
    return { database: "error", content: "file", storage: await pendingStorage };
  }
}
