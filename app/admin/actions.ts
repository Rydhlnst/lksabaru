"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { createAdminSession, credentialsMatch, destroyAdminSession, requireAdmin } from "@/lib/auth";
import { slugify, toFieldErrors, type ActionResult } from "@/lib/action-result";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import { donationSubmissions } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { removeMedia } from "@/lib/media-store";
import { getImageReferences } from "@/lib/media-references";
import { revalidatePublicContent } from "@/lib/public-content";
import type { PageSections, SiteContent } from "@/lib/content-types";
import { articleSchema, deleteSchema, documentSchema, donationReviewSchema, donationSchema, gallerySchema, heroSchema, homeSchema, ledgerSchema, loginSchema, organizationSchema, pageSchema, scheduleSchema, settingsSchema } from "@/lib/validation";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const booleanValue = (formData: FormData, key: string) => formData.get(key) === "on" || formData.get(key) === "true";
const nextId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const values = (formData: FormData, keys: readonly string[]) => Object.fromEntries(keys.map((key) => [key, value(formData, key)]));
const today = () => new Date().toISOString().slice(0, 10);

const ok = (message: string): ActionResult => ({ ok: true, message });
const fail = (message: string, fieldErrors?: Record<string, string>): ActionResult => ({ ok: false, message, fieldErrors });
const invalid = (error: z.ZodError) => fail("Periksa kembali isian yang ditandai.", toFieldErrors(error));
const missing = () => fail("Data tidak ditemukan. Muat ulang halaman, lalu coba lagi.");

/** Semua mutasi konten lewat sini: cek sesi, baca konten secara strict, dan ubah error tak terduga menjadi pesan yang bisa ditampilkan. */
async function mutate(run: (content: SiteContent) => Promise<ActionResult> | ActionResult): Promise<ActionResult> {
  await requireAdmin();
  try {
    return await run(await getSiteContent({ strict: true }));
  } catch (error) {
    console.error("[admin action]", error);
    return fail("Data belum dapat disimpan. Periksa koneksi database, lalu coba lagi.");
  }
}

async function publish(content: SiteContent) {
  await saveSiteContent(content);
  revalidatePublicContent();
}

type Collection = "articles" | "heroSlides" | "organization" | "schedule" | "documents" | "ledger";

/** Mengembalikan false bila `id` dikirim tetapi datanya sudah tidak ada (mis. terhapus di tab lain). */
function upsert<T extends { id: string }>(list: T[], item: T, isUpdate: boolean) {
  const index = list.findIndex((entry) => entry.id === item.id);
  if (isUpdate && index < 0) return false;
  if (index >= 0) list[index] = item; else list.push(item);
  return true;
}

function remove(formData: FormData, collection: Collection, label: string, guard?: (content: SiteContent, id: string) => string | undefined) {
  return mutate(async (content) => {
    const parsed = deleteSchema.safeParse({ id: value(formData, "id") });
    if (!parsed.success) return missing();
    const list = content[collection] as { id: string }[];
    if (!list.some((item) => item.id === parsed.data.id)) return missing();
    const blocked = guard?.(content, parsed.data.id);
    if (blocked) return fail(blocked);
    (content[collection] as { id: string }[]) = list.filter((item) => item.id !== parsed.data.id);
    await publish(content);
    return ok(`${label} dihapus.`);
  });
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: value(formData, "email"), password: String(formData.get("password") ?? "") });
  if (!parsed.success || !credentialsMatch(parsed.data.email, parsed.data.password)) redirect("/admin/login?error=1");
  await createAdminSession(parsed.data.email);
  redirect("/admin");
}

export async function logoutAction() { await destroyAdminSession(); redirect("/admin/login"); }

export async function updateSettingsAction(formData: FormData) {
  return mutate(async (content) => {
    const labels = formData.getAll("socialLabel");
    const hrefs = formData.getAll("socialHref");
    if (labels.length !== hrefs.length) return fail("Tautan sosial tidak lengkap. Muat ulang halaman, lalu coba lagi.");
    const socialLinks = labels.map((label, index) => ({ label: String(label).trim(), href: String(hrefs[index]).trim() }));
    const parsed = settingsSchema.safeParse({ ...values(formData, ["organizationName", "shortName", "address", "phone", "email", "mapUrl", "whatsappNumber", "whatsappAgentName", "whatsappResponseTime", "whatsappGreeting", "whatsappMessage"]),
      logoPrimary: formData.has("logoPrimary") ? value(formData, "logoPrimary") : content.settings.logoPrimary,
      logoSecondary: formData.has("logoSecondary") ? value(formData, "logoSecondary") : content.settings.logoSecondary,
      footerDescription: formData.has("footerDescription") ? value(formData, "footerDescription") : content.settings.footerDescription,
      socialLinks: formData.has("socialLinksPresent") || labels.length ? socialLinks.filter((link) => link.label || link.href) : content.settings.socialLinks,
    });
    if (!parsed.success) return invalid(parsed.error);
    content.settings = { ...content.settings, ...parsed.data };
    await publish(content);
    return ok("Pengaturan website disimpan.");
  });
}

const pageSectionKeys = ["account", "transparency", "legal", "organigram", "weekday", "weekend"] as const;

export async function savePageAction(formData: FormData) {
  return mutate(async (content) => {
    const index = content.pages.findIndex((item) => item.id === value(formData, "id"));
    const previous = content.pages[index];
    if (!previous) return missing();
    const sections: Record<string, Record<string, string>> = {};
    for (const section of pageSectionKeys) {
      for (const field of ["eyebrow", "title", "description"]) {
        const key = `sections.${section}.${field}`;
        if (formData.has(key)) (sections[section] ??= {})[field] = value(formData, key);
      }
    }
    // Slug dikunci: rute publik mencari halaman berdasarkan slug, jadi mengubahnya membuat halaman 404.
    const parsed = pageSchema.safeParse({ ...values(formData, ["title", "intro", "body", "status"]), id: previous.id, slug: previous.slug,
      eyebrow: formData.has("eyebrow") ? value(formData, "eyebrow") : previous.eyebrow,
      sections: Object.keys(sections).length ? sections : undefined,
    });
    if (!parsed.success) return invalid(parsed.error);
    const mergedSections: PageSections = { ...previous.sections };
    for (const section of pageSectionKeys) {
      const submitted = parsed.data.sections?.[section];
      if (submitted) mergedSections[section] = { eyebrow: "", title: "", description: "", ...previous.sections?.[section], ...submitted };
    }
    content.pages[index] = { ...previous, ...parsed.data, id: previous.id, sections: mergedSections, updatedAt: today() };
    await publish(content);
    return ok(`Halaman "${parsed.data.title}" disimpan.`);
  });
}

export async function saveHomeAction(formData: FormData) {
  return mutate(async (content) => {
    const raw = Object.fromEntries(["about", "video", "gallery", "news", "support"].map((section) => [section,
      Object.fromEntries(["eyebrow", "title", "description", section === "video" ? "youtubeUrl" : "ctaLabel"].map((field) => [field, value(formData, `${section}.${field}`)])),
    ]));
    const parsed = homeSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    content.home = { ...content.home, ...parsed.data };
    await publish(content);
    return ok("Konten beranda disimpan.");
  });
}

export async function saveDocumentAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = documentSchema.safeParse({ ...values(formData, ["title", "description", "href", "category"]), id: value(formData, "id") || undefined, published: booleanValue(formData, "published") });
    if (!parsed.success) return invalid(parsed.error);
    const id = parsed.data.id || nextId("document");
    if (!upsert(content.documents, { ...parsed.data, id }, Boolean(parsed.data.id))) return missing();
    await publish(content);
    return ok("Dokumen disimpan.");
  });
}

export async function deleteDocumentAction(formData: FormData) { return remove(formData, "documents", "Dokumen"); }

export async function saveHeroAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = heroSchema.safeParse({ ...values(formData, ["title", "description", "imageUrl", "ctaLabel", "ctaHref", "order"]), id: value(formData, "id") || undefined, active: booleanValue(formData, "active") });
    if (!parsed.success) return invalid(parsed.error);
    const id = parsed.data.id || nextId("hero");
    if (!upsert(content.heroSlides, { ...parsed.data, id }, Boolean(parsed.data.id))) return missing();
    await publish(content);
    return ok("Slide hero disimpan.");
  });
}

export async function deleteHeroAction(formData: FormData) {
  return remove(formData, "heroSlides", "Slide hero", (content) => content.heroSlides.length <= 1 ? "Minimal harus ada satu slide hero di beranda." : undefined);
}

export async function saveArticleAction(formData: FormData) {
  return mutate(async (content) => {
    const submittedId = value(formData, "id");
    const previous = content.articles.find((item) => item.id === submittedId);
    if (submittedId && !previous) return missing();
    const title = value(formData, "title");
    const parsed = articleSchema.safeParse({ ...values(formData, ["excerpt", "body", "publishDate", "status"]), title, slug: value(formData, "slug") || slugify(title), id: submittedId || undefined, coverUrl: formData.has("coverUrl") ? value(formData, "coverUrl") : previous?.coverUrl ?? "", featured: booleanValue(formData, "featured") });
    if (!parsed.success) return invalid(parsed.error);
    const id = parsed.data.id || nextId("article");
    if (content.articles.some((item) => item.id !== id && item.slug === parsed.data.slug)) return fail("Slug sudah dipakai artikel lain.", { slug: "Slug ini sudah dipakai artikel lain. Gunakan slug yang berbeda." });
    upsert(content.articles, { ...previous, ...parsed.data, id, updatedAt: today() }, Boolean(previous));
    await publish(content);
    revalidatePath("/berita");
    revalidatePath(`/berita/${parsed.data.slug}`);
    if (previous && previous.slug !== parsed.data.slug) revalidatePath(`/berita/${previous.slug}`);
    return ok(parsed.data.status === "published" ? "Artikel disimpan dan tayang di website." : "Artikel disimpan.");
  });
}

export async function deleteArticleAction(formData: FormData) { return remove(formData, "articles", "Artikel"); }

export async function saveGalleryAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = gallerySchema.safeParse({ id: value(formData, "id") || undefined, url: value(formData, "url"), alt: value(formData, "alt"), caption: value(formData, "caption"), order: value(formData, "order"), visible: booleanValue(formData, "visible") });
    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error);
      return fail(fieldErrors.url ? "Unggah atau pilih foto terlebih dahulu." : "Periksa kembali isian yang ditandai.", fieldErrors);
    }
    const id = parsed.data.id || nextId("gallery");
    if (!upsert(content.galleries, { ...parsed.data, id }, Boolean(parsed.data.id))) return missing();
    await publish(content);
    return ok("Foto galeri disimpan.");
  });
}

export async function deleteGalleryImageAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = deleteSchema.safeParse({ id: value(formData, "id") });
    const image = parsed.success ? content.galleries.find((item) => item.id === parsed.data.id) : undefined;
    if (!image) return missing();
    content.galleries = content.galleries.filter((item) => item.id !== image.id);
    await publish(content);
    if (!getImageReferences(content, image.url).length) await removeMedia(image.url).catch((error) => console.error("[admin action] media cleanup", error));
    return ok("Foto dihapus dari galeri.");
  });
}

export async function saveOrganizationAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = organizationSchema.safeParse({ ...values(formData, ["name", "role", "order"]), id: value(formData, "id") || undefined, parentId: value(formData, "parentId") || null, active: booleanValue(formData, "active") });
    if (!parsed.success) return invalid(parsed.error);
    const id = parsed.data.id || nextId("org");
    const byId = new Map(content.organization.map((node) => [node.id, node]));
    // Induk harus ada dan tidak boleh berada di bawah anggota ini sendiri (mencegah struktur melingkar).
    for (let cursor = parsed.data.parentId, depth = 0; cursor; cursor = byId.get(cursor)?.parentId ?? null, depth++) {
      if (!byId.has(cursor)) return fail("Atasan tidak ditemukan.", { parentId: "Atasan yang dipilih sudah tidak ada." });
      if (cursor === id || depth > byId.size) return fail("Struktur tidak valid.", { parentId: "Atasan tidak boleh dirinya sendiri atau bawahannya." });
    }
    if (!upsert(content.organization, { ...parsed.data, id }, Boolean(parsed.data.id))) return missing();
    await publish(content);
    return ok("Data pengurus disimpan.");
  });
}

export async function deleteOrganizationAction(formData: FormData) {
  return remove(formData, "organization", "Pengurus", (content, id) => content.organization.some((node) => node.parentId === id) ? "Pengurus ini masih memiliki bawahan. Pindahkan atau hapus bawahannya terlebih dahulu." : undefined);
}

export async function saveScheduleAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = scheduleSchema.safeParse({ ...values(formData, ["group", "period", "time", "activity", "location", "coordinator", "order"]), id: value(formData, "id") || undefined, active: booleanValue(formData, "active") });
    if (!parsed.success) return invalid(parsed.error);
    const id = parsed.data.id || nextId("schedule");
    if (!upsert(content.schedule, { ...parsed.data, id }, Boolean(parsed.data.id))) return missing();
    await publish(content);
    return ok("Jadwal kegiatan disimpan.");
  });
}

export async function deleteScheduleAction(formData: FormData) { return remove(formData, "schedule", "Jadwal kegiatan"); }

export async function reviewDonationAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = donationReviewSchema.safeParse({ id: value(formData, "id"), status: value(formData, "status"), adminNote: value(formData, "adminNote") });
  if (!parsed.success) return invalid(parsed.error);
  if (!db) return fail("Database belum terhubung, sehingga bukti donasi tidak dapat diverifikasi.");
  try {
    const updated = await db.update(donationSubmissions).set({ status: parsed.data.status, adminNote: parsed.data.adminNote, verifiedAt: parsed.data.status === "verified" ? new Date() : null, updatedAt: new Date() }).where(eq(donationSubmissions.id, parsed.data.id)).returning({ id: donationSubmissions.id });
    if (!updated.length) return missing();
  } catch (error) {
    console.error("[admin action]", error);
    return fail("Status donasi belum dapat diperbarui. Periksa koneksi database, lalu coba lagi.");
  }
  revalidatePath("/donasi");
  revalidatePath("/admin", "layout");
  return ok(parsed.data.status === "verified" ? "Donasi diverifikasi dan masuk ke total publik." : parsed.data.status === "rejected" ? "Donasi ditolak." : "Donasi dikembalikan ke status menunggu.");
}

export async function saveDonationAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = donationSchema.safeParse({ ...values(formData, ["heading", "description", "bankName", "accountNumber", "accountHolder", "confirmationMessage", "confirmationWhatsapp", "transparencyHeading"]), qrisUrl: formData.has("qrisUrl") ? value(formData, "qrisUrl") : content.donation.qrisUrl });
    if (!parsed.success) return invalid(parsed.error);
    content.donation = { ...content.donation, ...parsed.data };
    await publish(content);
    return ok("Informasi donasi disimpan.");
  });
}

export async function saveLedgerAction(formData: FormData) {
  return mutate(async (content) => {
    const parsed = ledgerSchema.safeParse({ ...values(formData, ["type", "description", "amount", "date"]), id: value(formData, "id") || undefined, status: formData.has("status") ? value(formData, "status") : "completed", public: booleanValue(formData, "public") });
    if (!parsed.success) return invalid(parsed.error);
    const id = parsed.data.id || nextId("ledger");
    if (!upsert(content.ledger, { ...parsed.data, id }, Boolean(parsed.data.id))) return missing();
    await publish(content);
    return ok("Catatan keuangan disimpan.");
  });
}

export async function deleteLedgerAction(formData: FormData) { return remove(formData, "ledger", "Catatan keuangan"); }
