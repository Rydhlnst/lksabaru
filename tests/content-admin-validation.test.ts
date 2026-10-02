import assert from "node:assert/strict";
import test from "node:test";
import { defaultContent } from "../lib/content-data.ts";
import * as validation from "../lib/validation.ts";

test("settings schema rejects unpaired social fields and unsafe URLs", () => {
  for (const socialLinks of [
    [{ label: "YouTube" }],
    [{ href: "https://example.com" }],
    [{ label: "Social", href: "not-a-url" }],
    [{ label: "Social", href: "javascript:alert(1)" }],
  ]) {
    assert.equal(validation.settingsSchema.safeParse({ ...defaultContent.settings, socialLinks }).success, false);
  }
});

test("settings schema accepts current settings and optional secondary logo", () => {
  assert.equal(validation.settingsSchema.safeParse(defaultContent.settings).success, true);
  assert.equal(validation.settingsSchema.safeParse({ ...defaultContent.settings, logoSecondary: "/uploads/logo.png" }).success, true);
});

test("image fields reject hosts that next/image is not configured to load", () => {
  assert.equal(validation.settingsSchema.safeParse({ ...defaultContent.settings, logoSecondary: "https://example.com/logo.png" }).success, false);
  assert.equal(validation.gallerySchema.safeParse({ url: "https://example.com/foto.jpg", alt: "Foto", caption: "", order: 1, visible: true }).success, false);
  assert.equal(validation.gallerySchema.safeParse({ url: "/uploads/foto.jpg", alt: "Foto", caption: "", order: 1, visible: true }).success, true);
});

test("settings schema bounds social links and validates public logo URLs", () => {
  assert.equal(validation.settingsSchema.safeParse({ ...defaultContent.settings, socialLinks: Array.from({ length: 21 }, () => ({ label: "Social", href: "https://example.com" })) }).success, false);
  for (const logoPrimary of ["not-a-url", "//example.com/logo.png", "javascript:alert(1)"]) {
    assert.equal(validation.settingsSchema.safeParse({ ...defaultContent.settings, logoPrimary }).success, false);
  }
});

test("home schema accepts current copy and rejects non-YouTube URLs", () => {
  assert.ok("homeSchema" in validation, "homeSchema must exist");
  const { homeSchema } = validation;
  assert.equal(homeSchema.safeParse(defaultContent.home).success, true);
  for (const youtubeUrl of ["not-a-url", "https://example.com/video", "https://youtube.com.example.com/embed/video", "javascript:alert(1)"]) {
    assert.equal(homeSchema.safeParse({ ...defaultContent.home, video: { ...defaultContent.home.video, youtubeUrl } }).success, false);
  }
  assert.equal(homeSchema.safeParse({ ...defaultContent.home, about: { ...defaultContent.home.about, title: " " } }).success, false);
});

test("document schema accepts seeded URLs and restricts categories and URLs", () => {
  assert.ok("documentSchema" in validation, "documentSchema must exist");
  const { documentSchema } = validation;
  for (const document of defaultContent.documents) assert.equal(documentSchema.safeParse(document).success, true);
  const document = { title: "Legal", description: "Dokumen", href: "https://example.com/doc.pdf", category: "legalitas", published: true };
  assert.equal(documentSchema.safeParse(document).success, true);
  assert.equal(documentSchema.safeParse({ ...document, category: "illegal" }).success, false);
  for (const href of ["not-a-url", "javascript:alert(1)", "//example.com/doc.pdf"]) {
    assert.equal(documentSchema.safeParse({ ...document, href }).success, false);
  }
});

test("page schema supports empty editorial bodies and optional partial sections", () => {
  assert.ok("pageSchema" in validation, "pageSchema must exist");
  const { pageSchema } = validation;
  for (const page of defaultContent.pages) assert.equal(pageSchema.safeParse(page).success, true);
  const page = { slug: "custom-page", eyebrow: "Profil", title: "Custom page", intro: "Intro", body: "", status: "draft" };
  assert.equal(pageSchema.safeParse(page).success, true);
  assert.deepEqual(pageSchema.parse({ ...page, sections: { weekday: { title: "Hari kerja" } } }).sections, { weekday: { title: "Hari kerja" } });
  assert.equal(pageSchema.safeParse({ ...page, status: "invalid" }).success, false);
  assert.equal(pageSchema.safeParse({ ...page, slug: "../invalid" }).success, false);
  assert.equal(pageSchema.safeParse({ ...page, eyebrow: undefined }).success, false);
  assert.equal(pageSchema.safeParse({ ...page, sections: { legal: { title: 12 } } }).success, false);
});

test("donation schema accepts empty QRIS and validates QRIS and WhatsApp", () => {
  assert.ok("donationSchema" in validation, "donationSchema must exist");
  const { donationSchema } = validation;
  assert.equal(donationSchema.safeParse(defaultContent.donation).success, true);
  assert.equal(donationSchema.safeParse({ ...defaultContent.donation, qrisUrl: "/uploads/qris.png" }).success, true);
  assert.equal(donationSchema.safeParse({ ...defaultContent.donation, qrisUrl: "javascript:alert(1)" }).success, false);
  assert.equal(donationSchema.safeParse({ ...defaultContent.donation, confirmationWhatsapp: "invalid" }).success, false);
});

test("ledger schema coerces amounts and rejects invalid amounts, dates, and enums", () => {
  assert.ok("ledgerSchema" in validation, "ledgerSchema must exist");
  const { ledgerSchema } = validation;
  const entry = { type: "income", description: "Donasi", amount: "150000", date: "2026-09-17", status: "completed", public: false };
  assert.equal(ledgerSchema.parse(entry).amount, 150000);
  assert.equal(ledgerSchema.safeParse({ ...entry, amount: "0" }).success, true);
  for (const amount of ["", "invalid", "-1", "Infinity"]) assert.equal(ledgerSchema.safeParse({ ...entry, amount }).success, false);
  for (const date of ["", "invalid", "2026-02-30"]) assert.equal(ledgerSchema.safeParse({ ...entry, date }).success, false);
  assert.equal(ledgerSchema.safeParse({ ...entry, type: "invalid" }).success, false);
  assert.equal(ledgerSchema.safeParse({ ...entry, status: "invalid" }).success, false);
});
