import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const r2Config = {
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.R2_REGION ?? "auto",
  bucket: process.env.R2_BUCKET,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  publicUrl: process.env.R2_PUBLIC_URL,
};

const requiredR2Values = [r2Config.endpoint, r2Config.bucket, r2Config.accessKeyId, r2Config.secretAccessKey, r2Config.publicUrl];
export const hasAnyR2Config = requiredR2Values.some(Boolean);
export const hasCompleteR2Config = requiredR2Values.every(Boolean);
const r2Client = hasCompleteR2Config
  ? new S3Client({ endpoint: r2Config.endpoint, region: r2Config.region, credentials: { accessKeyId: r2Config.accessKeyId!, secretAccessKey: r2Config.secretAccessKey! } })
  : null;

/** Uji nyata ke bucket (bukan sekadar cek env), dipakai kartu "Koneksi data" di dashboard. */
export async function pingStorage(): Promise<"r2" | "r2-error" | "incomplete" | "local"> {
  if (!r2Client) return hasAnyR2Config ? "incomplete" : "local";
  try {
    await r2Client.send(new ListObjectsV2Command({ Bucket: r2Config.bucket, Prefix: "uploads/", MaxKeys: 1 }), { abortSignal: AbortSignal.timeout(4000) });
    return "r2";
  } catch {
    return "r2-error";
  }
}

export type StoredMedia = { url: string; filename: string; mimeType: string };

export async function storeMedia({ filename, body, contentType }: { filename: string; body: Buffer; contentType: string }): Promise<StoredMedia> {
  if (r2Client && r2Config.bucket && r2Config.publicUrl) {
    const key = `uploads/${filename}`;
    await r2Client.send(new PutObjectCommand({ Bucket: r2Config.bucket, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
    return { url: `${r2Config.publicUrl.replace(/\/$/, "")}/${key}`, filename, mimeType: contentType };
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), body);
  return { url: `/uploads/${filename}`, filename, mimeType: contentType };
}

export async function deleteStoredMedia(url: string) {
  if (r2Client && r2Config.bucket && r2Config.publicUrl) {
    const configuredUrl = new URL(r2Config.publicUrl);
    const candidateUrl = new URL(url, configuredUrl);
    if (candidateUrl.origin !== configuredUrl.origin || !candidateUrl.pathname.startsWith("/uploads/")) throw new Error("Media URL is outside the configured R2 public path.");
    const key = candidateUrl.pathname.slice(1);
    if (key.includes("..") || !/^uploads\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(key)) throw new Error("Invalid media object key.");
    await r2Client.send(new DeleteObjectCommand({ Bucket: r2Config.bucket, Key: key }));
    return;
  }

  if (/^\/uploads\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(url)) {
    await fs.rm(path.join(process.cwd(), "public", url), { force: true });
    return;
  }

  if (url.startsWith("http")) throw new Error("Media URL is outside the configured storage.");
}
