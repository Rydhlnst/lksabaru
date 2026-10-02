import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { mediaAssets } from "./db/schema";
import { deleteStoredMedia } from "./media-storage";

export async function getMediaAssets() {
  if (!db) return [];
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
}

/** Hapus objek dari penyimpanan beserta catatannya di Media Library, agar keduanya tidak pernah selisih. */
export async function removeMedia(url: string) {
  await deleteStoredMedia(url);
  if (db) await db.delete(mediaAssets).where(eq(mediaAssets.url, url));
}
