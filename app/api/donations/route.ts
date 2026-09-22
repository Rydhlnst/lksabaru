import { NextResponse } from "next/server";
import { createDonationSubmission } from "@/lib/donation-store";
import { deleteStoredMedia, hasAnyR2Config, hasCompleteR2Config, storeMedia } from "@/lib/media-storage";
import { donationSubmissionSchema } from "@/lib/validation";

export const runtime = "nodejs";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (hasAnyR2Config && !hasCompleteR2Config) return NextResponse.json({ error: "Penyimpanan bukti belum dikonfigurasi dengan lengkap." }, { status: 500 });
  const form = await request.formData();
  const proof = form.get("proof");
  if (!(proof instanceof File)) return NextResponse.json({ error: "Bukti transfer wajib diunggah." }, { status: 400 });
  const extension = allowed.get(proof.type);
  if (!extension) return NextResponse.json({ error: "Gunakan JPG, PNG, atau WebP." }, { status: 400 });
  if (proof.size > maxFileSize) return NextResponse.json({ error: "Ukuran bukti maksimal 5 MB." }, { status: 400 });

  const parsed = donationSubmissionSchema.safeParse({ donorName: form.get("donorName"), donorPhone: form.get("donorPhone") ?? "", amount: form.get("amount"), transferDate: form.get("transferDate"), proofUrl: "https://example.com/proof", note: form.get("note") ?? "" });
  if (!parsed.success) return NextResponse.json({ error: "Data donasi belum lengkap atau tidak valid." }, { status: 400 });

  let storedUrl = "";
  try {
    const stored = await storeMedia({ filename: `donation-${Date.now()}-${crypto.randomUUID()}.${extension}`, body: Buffer.from(await proof.arrayBuffer()), contentType: proof.type });
    storedUrl = stored.url;
    await createDonationSubmission({ ...parsed.data, proofUrl: stored.url, status: "pending", adminNote: "", verifiedAt: null });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    if (storedUrl) await deleteStoredMedia(storedUrl).catch(() => undefined);
    return NextResponse.json({ error: "Donasi belum dapat dikirim. Silakan coba lagi." }, { status: 502 });
  }
}

