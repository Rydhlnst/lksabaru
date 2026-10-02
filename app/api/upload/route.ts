import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { getImageReferences } from "@/lib/media-references";
import { deleteStoredMedia, hasAnyR2Config, hasCompleteR2Config, storeMedia } from "@/lib/media-storage";
import { removeMedia } from "@/lib/media-store";
import { mediaDeleteSchema } from "@/lib/validation";

export const runtime = "nodejs";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const maxFileSize = 5 * 1024 * 1024;

function storageError() {
  return NextResponse.json({ error: "Penyimpanan media belum dikonfigurasi dengan lengkap." }, { status: 500 });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (hasAnyR2Config && !hasCompleteR2Config) return storageError();

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File wajib dipilih." }, { status: 400 });
  const extension = allowed.get(file.type);
  if (!extension) return NextResponse.json({ error: "Gunakan JPG, PNG, atau WebP." }, { status: 400 });
  if (file.size > maxFileSize) return NextResponse.json({ error: "Ukuran maksimal 5 MB." }, { status: 400 });

  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  let storedUrl = "";

  try {
    const stored = await storeMedia({ filename, body: buffer, contentType: file.type });
    storedUrl = stored.url;
    const assetId = `media-${crypto.randomUUID()}`;
    if (db) await db.insert(mediaAssets).values({ id: assetId, url: stored.url, filename: stored.filename, mimeType: stored.mimeType, alt: "" });
    return NextResponse.json({ url: stored.url, asset: { id: assetId, url: stored.url, filename: stored.filename, mimeType: stored.mimeType, alt: "", createdAt: new Date().toISOString() } });
  } catch {
    if (storedUrl) await deleteStoredMedia(storedUrl).catch(() => undefined);
    return NextResponse.json({ error: "Upload gagal. Silakan coba lagi." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (hasAnyR2Config && !hasCompleteR2Config) return storageError();

  const parsed = mediaDeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data media tidak valid." }, { status: 400 });

  const row = parsed.data.id && db
    ? (await db.select().from(mediaAssets).where(eq(mediaAssets.id, parsed.data.id)).limit(1))[0]
    : undefined;
  if (parsed.data.id && db && !row) return NextResponse.json({ error: "Media tidak ditemukan." }, { status: 404 });
  if (row && row.url !== parsed.data.url) return NextResponse.json({ error: "URL media tidak cocok." }, { status: 400 });

  const references = getImageReferences(await getSiteContent(), parsed.data.url);
  if (references.length) return NextResponse.json({ error: `Media masih digunakan: ${references.join(", ")}. Hapus tautannya dari konten terlebih dahulu.` }, { status: 409 });

  try {
    await removeMedia(parsed.data.url);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Media tidak dapat dihapus dari penyimpanan." }, { status: 502 });
  }
}
