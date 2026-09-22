"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createAdminSession, credentialsMatch, destroyAdminSession, requireAdmin } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import { donationReviewSchema } from "@/lib/validation";
import { donationSubmissions } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { deleteStoredMedia } from "@/lib/media-storage";
import { getImageReferences } from "@/lib/media-references";
import { revalidatePublicContent } from "@/lib/public-content";
import type { PageSections } from "@/lib/content-types";
import { articleSchema, documentSchema, donationSchema, galleryDeleteSchema, gallerySchema, heroSchema, homeSchema, ledgerSchema, loginSchema, organizationSchema, pageSchema, scheduleSchema, settingsSchema } from "@/lib/validation";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const booleanValue = (formData: FormData, key: string) => formData.get(key) === "on" || formData.get(key) === "true";
const nextId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const values = (formData: FormData, keys: readonly string[]) => Object.fromEntries(keys.map((key) => [key, value(formData, key)]));

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: value(formData, "email"), password: value(formData, "password") });
  if (!parsed.success || !credentialsMatch(parsed.data.email, parsed.data.password)) redirect("/admin/login?error=1");
  await createAdminSession(parsed.data.email);
  redirect("/admin");
}

export async function logoutAction() { await destroyAdminSession(); redirect("/admin/login"); }

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const labels = formData.getAll("socialLabel");
  const hrefs = formData.getAll("socialHref");
  if (labels.length !== hrefs.length) redirect("/admin/settings?error=validation");
  const socialLinks = labels.map((label, index) => ({ label: String(label).trim(), href: String(hrefs[index]).trim() }));
  const parsed = settingsSchema.safeParse({ ...values(formData, ["organizationName", "shortName", "address", "phone", "email", "mapUrl", "whatsappNumber", "whatsappAgentName", "whatsappResponseTime", "whatsappGreeting", "whatsappMessage"]),
    logoPrimary: formData.has("logoPrimary") ? value(formData, "logoPrimary") : content.settings.logoPrimary,
    logoSecondary: formData.has("logoSecondary") ? value(formData, "logoSecondary") : content.settings.logoSecondary,
    footerDescription: formData.has("footerDescription") ? value(formData, "footerDescription") : content.settings.footerDescription,
    socialLinks: formData.has("socialLinksPresent") || labels.length ? socialLinks.filter((link) => link.label || link.href) : content.settings.socialLinks,
  });
  if (!parsed.success) redirect("/admin/settings?error=validation");
  content.settings = { ...content.settings, ...parsed.data };
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/settings?saved=1");
}

export async function savePageAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const id = value(formData, "id") || nextId("page");
  const existing = content.pages.findIndex((item) => item.id === id);
  const previous = content.pages[existing];
  const sections: Record<string, Record<string, string>> = {};
  for (const section of ["account", "transparency", "legal", "organigram", "weekday", "weekend"]) {
    for (const field of ["eyebrow", "title", "description"]) {
      const key = `sections.${section}.${field}`;
      if (formData.has(key)) (sections[section] ??= {})[field] = value(formData, key);
    }
  }
  const parsed = pageSchema.safeParse({ ...values(formData, ["slug", "title", "intro", "body", "status"]), id,
    eyebrow: formData.has("eyebrow") ? value(formData, "eyebrow") : previous?.eyebrow ?? "Profil Panti",
    sections: Object.keys(sections).length ? sections : undefined,
  });
  if (!parsed.success) redirect("/admin/pages?error=validation");
  const mergedSections: PageSections = { ...previous?.sections };
  for (const section of ["account", "transparency", "legal", "organigram", "weekday", "weekend"] as const) {
    const submitted = parsed.data.sections?.[section];
    if (submitted) mergedSections[section] = { eyebrow: "", title: "", description: "", ...previous?.sections?.[section], ...submitted };
  }
  const page = { ...previous, ...parsed.data, id, sections: mergedSections, updatedAt: new Date().toISOString().slice(0, 10) };
  if (existing >= 0) content.pages[existing] = page; else content.pages.push(page);
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/pages?saved=1");
}

export async function saveHomeAction(formData: FormData): Promise<never> {
  await requireAdmin();
  const raw = Object.fromEntries(["about", "video", "gallery", "news", "support"].map((section) => [section,
    Object.fromEntries(["eyebrow", "title", "description", section === "video" ? "youtubeUrl" : "ctaLabel"].map((field) => [field, value(formData, `${section}.${field}`)])),
  ]));
  const parsed = homeSchema.safeParse(raw);
  if (!parsed.success) redirect("/admin/home?error=validation");
  const content = await getSiteContent();
  content.home = { ...content.home, ...parsed.data };
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/home?saved=1");
}

export async function saveDocumentAction(formData: FormData): Promise<never> {
  await requireAdmin();
  const parsed = documentSchema.safeParse({ ...values(formData, ["title", "description", "href", "category"]), id: value(formData, "id") || undefined, published: booleanValue(formData, "published") });
  if (!parsed.success) redirect("/admin/donation?error=validation");
  const content = await getSiteContent();
  const id = parsed.data.id || nextId("document");
  const index = content.documents.findIndex((item) => item.id === id);
  const document = { ...content.documents[index], ...parsed.data, id };
  if (index >= 0) content.documents[index] = document; else content.documents.push(document);
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/donation?saved=1");
}

export async function saveHeroAction(formData: FormData) {
  await requireAdmin();
  const parsed = heroSchema.safeParse({ ...values(formData, ["title", "description", "imageUrl", "ctaLabel", "ctaHref", "order"]), id: value(formData, "id") || undefined, active: booleanValue(formData, "active") });
  if (!parsed.success) redirect("/admin/home?error=validation");
  const content = await getSiteContent();
  const id = parsed.data.id || nextId("hero");
  const index = content.heroSlides.findIndex((item) => item.id === id);
  const slide = { ...content.heroSlides[index], ...parsed.data, id };
  if (index >= 0) content.heroSlides[index] = slide; else content.heroSlides.push(slide);
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/home?saved=1");
}

export async function saveArticleAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const previous = content.articles.find((item) => item.id === value(formData, "id"));
  const parsed = articleSchema.safeParse({ ...values(formData, ["title", "slug", "excerpt", "body", "publishDate", "status"]), id: value(formData, "id") || undefined, coverUrl: value(formData, "coverUrl") || previous?.coverUrl || "", featured: booleanValue(formData, "featured") });
  if (!parsed.success) redirect("/admin/news?error=validation");
  const id = parsed.data.id || nextId("article");
  const article = { ...previous, ...parsed.data, id, updatedAt: new Date().toISOString().slice(0, 10) };
  const index = content.articles.findIndex((item) => item.id === id);
  if (index >= 0) content.articles[index] = article; else content.articles.push(article);
  await saveSiteContent(content);
  revalidatePublicContent();
  revalidatePath("/berita");
  revalidatePath(`/berita/${article.slug}`);
  if (previous && previous.slug !== article.slug) revalidatePath(`/berita/${previous.slug}`);
  redirect("/admin/news?saved=1");
}

export async function saveGalleryAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const parsed = gallerySchema.safeParse({ id: value(formData, "id") || undefined, url: value(formData, "url"), alt: value(formData, "alt"), caption: value(formData, "caption"), order: value(formData, "order"), visible: booleanValue(formData, "visible") });
  if (!parsed.success) redirect("/admin/gallery?error=validation");
  const id = parsed.data.id || nextId("gallery");
  const index = content.galleries.findIndex((item) => item.id === id);
  const image = { ...content.galleries[index], ...parsed.data, id };
  if (index >= 0) content.galleries[index] = image; else content.galleries.push(image);
  await saveSiteContent(content);
  revalidatePublicContent();
  revalidatePath("/galeri");
  redirect("/admin/gallery?saved=1");
}

export async function deleteGalleryImageAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const parsed = galleryDeleteSchema.safeParse({ id: value(formData, "id") });
  if (!parsed.success) redirect("/admin/gallery?error=validation");
  const { id } = parsed.data;
  const image = content.galleries.find((item) => item.id === id);
  if (!image) redirect("/admin/gallery?error=not-found");
  content.galleries = content.galleries.filter((item) => item.id !== id);
  await saveSiteContent(content);
  revalidatePublicContent();
  if (!getImageReferences(content, image.url).length) await deleteStoredMedia(image.url).catch(() => undefined);
  revalidatePath("/galeri");
  redirect("/admin/gallery?deleted=1");
}

export async function saveOrganizationAction(formData: FormData) {
  await requireAdmin();
  const parsed = organizationSchema.safeParse({ ...values(formData, ["name", "role", "order"]), id: value(formData, "id") || undefined, parentId: value(formData, "parentId") || null, active: booleanValue(formData, "active") });
  if (!parsed.success) redirect("/admin/organization?error=validation");
  const content = await getSiteContent();
  const id = parsed.data.id || nextId("org");
  const index = content.organization.findIndex((item) => item.id === id);
  const node = { ...content.organization[index], ...parsed.data, id };
  if (index >= 0) content.organization[index] = node; else content.organization.push(node);
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/organization?saved=1");
}

export async function saveScheduleAction(formData: FormData) {
  await requireAdmin();
  const parsed = scheduleSchema.safeParse({ ...values(formData, ["group", "period", "time", "activity", "location", "coordinator", "order"]), id: value(formData, "id") || undefined, active: booleanValue(formData, "active") });
  if (!parsed.success) redirect("/admin/schedule?error=validation");
  const content = await getSiteContent();
  const id = parsed.data.id || nextId("schedule");
  const index = content.schedule.findIndex((item) => item.id === id);
  const entry = { ...content.schedule[index], ...parsed.data, id };
  if (index >= 0) content.schedule[index] = entry; else content.schedule.push(entry);
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/schedule?saved=1");
}

export async function reviewDonationAction(formData: FormData): Promise<never> {
  await requireAdmin();
  const parsed = donationReviewSchema.safeParse({ id: value(formData, "id"), status: value(formData, "status"), adminNote: value(formData, "adminNote") });
  if (!parsed.success || !db) redirect("/admin/donation?error=validation");
  await db.update(donationSubmissions).set({ status: parsed.data.status, adminNote: parsed.data.adminNote, verifiedAt: parsed.data.status === "verified" ? new Date() : null, updatedAt: new Date() }).where(eq(donationSubmissions.id, parsed.data.id));
  revalidatePath("/donasi");
  revalidatePath("/admin");
  redirect("/admin/donation?saved=1");
}
export async function saveDonationAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const parsed = donationSchema.safeParse({ ...values(formData, ["heading", "description", "bankName", "accountNumber", "accountHolder", "confirmationMessage", "confirmationWhatsapp", "transparencyHeading"]), qrisUrl: formData.has("qrisUrl") ? value(formData, "qrisUrl") : content.donation.qrisUrl });
  if (!parsed.success) redirect("/admin/donation?error=validation");
  content.donation = { ...content.donation, ...parsed.data };
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/donation?saved=1");
}

export async function saveLedgerAction(formData: FormData) {
  await requireAdmin();
  const parsed = ledgerSchema.safeParse({ ...values(formData, ["type", "description", "amount", "date"]), status: formData.has("status") ? value(formData, "status") : "completed", public: booleanValue(formData, "public") });
  if (!parsed.success) redirect("/admin/donation?error=validation");
  const content = await getSiteContent();
  content.ledger.push({ ...parsed.data, id: nextId("ledger") });
  await saveSiteContent(content);
  revalidatePublicContent();
  redirect("/admin/donation?saved=1");
}
