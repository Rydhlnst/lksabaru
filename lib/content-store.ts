import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { defaultContent } from "./content-data";
import type { GalleryItem, SiteContent } from "./content-types";
import { db } from "./db";
import { siteSettings } from "./db/schema";

const contentPath = path.join(process.cwd(), "data", "site-content.json");
const singletonId = "singleton";

type LegacyGalleryAlbum = { visible: boolean; images: Omit<GalleryItem, "visible">[] };
type StoredGalleryEntry = GalleryItem | LegacyGalleryAlbum;
type StoredSiteContent = Partial<SiteContent> & {
  settings?: Partial<SiteContent["settings"]>;
  home?: Partial<SiteContent["home"]>;
  donation?: Partial<SiteContent["donation"]>;
};

function normalizeSiteContent(stored: StoredSiteContent): SiteContent {
  const content = {
    ...defaultContent,
    ...stored,
    settings: { ...defaultContent.settings, ...stored.settings },
    home: {
      about: { ...defaultContent.home.about, ...stored.home?.about },
      video: { ...defaultContent.home.video, ...stored.home?.video },
      gallery: { ...defaultContent.home.gallery, ...stored.home?.gallery },
      news: { ...defaultContent.home.news, ...stored.home?.news },
      support: { ...defaultContent.home.support, ...stored.home?.support },
    },
    donation: { ...defaultContent.donation, ...stored.donation },
  } as SiteContent;
  const entries = (content.galleries as unknown as StoredGalleryEntry[] | undefined) ?? [];
  const galleries = entries
    .flatMap((entry) => "images" in entry ? entry.images.map((image) => ({ ...image, visible: entry.visible })) : [entry])
    .sort((a, b) => a.order - b.order);

  return { ...content, galleries };
}

async function getFileContent(): Promise<SiteContent> {
  try {
    const stored = JSON.parse(await fs.readFile(contentPath, "utf8")) as StoredSiteContent;
    return normalizeSiteContent(stored);
  } catch {
    return normalizeSiteContent(defaultContent);
  }
}

/**
 * `strict` dipakai sebelum menulis: bila database terkonfigurasi tetapi gagal dibaca, lempar error
 * alih-alih jatuh ke file lokal, supaya konten cadangan tidak pernah menimpa data di database.
 */
export async function getSiteContent({ strict = false }: { strict?: boolean } = {}): Promise<SiteContent> {
  if (db) {
    try {
      const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, singletonId)).limit(1);
      if (rows[0]?.data) return normalizeSiteContent(rows[0].data as StoredSiteContent);
    } catch {
      if (strict || process.env.NODE_ENV === "production") throw new Error("Canonical content source is unavailable.");
    }
  }
  if (process.env.NODE_ENV === "production") throw new Error("Canonical content source is unavailable.");
  return getFileContent();
}

export async function saveSiteContent(content: SiteContent) {
  if (db) {
    await db.insert(siteSettings).values({ id: singletonId, data: content }).onConflictDoUpdate({ target: siteSettings.id, set: { data: content, updatedAt: new Date() } });
    return content;
  }
  if (process.env.NODE_ENV === "production") throw new Error("Canonical content source is unavailable.");
  await fs.mkdir(path.dirname(contentPath), { recursive: true });
  await fs.writeFile(contentPath, JSON.stringify(content, null, 2), "utf8");
  return content;
}
