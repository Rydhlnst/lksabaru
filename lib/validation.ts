import { z } from "zod";

// Pesan default berbahasa Indonesia; pesan yang ditulis langsung pada skema tetap diutamakan.
z.config({
  customError: (issue) => {
    switch (issue.code) {
      case "invalid_type": return issue.input === undefined || issue.input === null ? "Wajib diisi." : "Nilai tidak valid.";
      case "too_small":
        if (issue.origin === "string") return Number(issue.minimum) <= 1 ? "Wajib diisi." : `Minimal ${issue.minimum} karakter.`;
        return `Minimal ${issue.minimum}.`;
      case "too_big":
        if (issue.origin === "string") return `Maksimal ${issue.maximum} karakter.`;
        if (issue.origin === "array") return `Maksimal ${issue.maximum} item.`;
        return `Maksimal ${issue.maximum}.`;
      case "invalid_format":
        if (issue.format === "email") return "Format email tidak valid.";
        if (issue.format === "url") return "URL tidak valid.";
        if (issue.format === "date") return "Tanggal tidak valid.";
        return "Format tidak valid.";
      case "invalid_value": return "Pilihan tidak valid.";
      case "invalid_union": return "Nilai tidak valid.";
      default: return undefined;
    }
  },
});

const text = (max: number) => z.string().trim().min(1).max(max);
const httpUrl = z.string().trim().max(2000).url().refine((value) => /^https?:\/\//i.test(value), "URL harus menggunakan HTTP atau HTTPS.");
const publicUrl = z.union([httpUrl, z.string().trim().max(2000).regex(/^\/(?!\/)[^\s\\]*$/)], { error: "Gunakan URL http(s) atau path yang diawali \"/\", misalnya /uploads/foto.jpg." });
// Gambar dirender lewat next/image, yang hanya mengizinkan path lokal dan host R2 (lihat next.config.ts).
const r2Origin = (() => { try { return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).origin : null; } catch { return null; } })();
const imageUrlMessage = "Gunakan gambar hasil unggahan atau path yang diawali \"/\". URL dari situs lain tidak dapat ditampilkan.";
const imageUrl = publicUrl.refine((value) => value.startsWith("/") || (r2Origin !== null && new URL(value).origin === r2Origin), imageUrlMessage);
const optionalImageUrl = z.union([imageUrl, z.literal("")], { error: imageUrlMessage });
const idSchema = text(120).optional();
const statusSchema = z.enum(["draft", "published", "archived"]);
const slugSchema = z.string().trim().max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung. Contoh: kegiatan-ramadan.");
const whatsappSchema = z.string().trim().regex(/^\d{8,16}$/, "Gunakan 8–16 digit angka tanpa spasi atau tanda +. Contoh: 628123456789.");
const orderSchema = z.preprocess((value) => typeof value === "string" && !value.trim() ? undefined : value, z.coerce.number().int("Gunakan bilangan bulat.").min(1).max(9999));
const sectionSchema = z.object({ eyebrow: text(120), title: text(200), description: text(3000) });
const ctaSectionSchema = sectionSchema.extend({ ctaLabel: text(120) });

export const homeSchema = z.object({
  about: ctaSectionSchema,
  video: sectionSchema.extend({
    youtubeUrl: httpUrl,
  }),
  gallery: ctaSectionSchema,
  news: ctaSectionSchema,
  support: ctaSectionSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const settingsSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  shortName: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(300),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email(),
  mapUrl: httpUrl,
  logoPrimary: imageUrl,
  logoSecondary: optionalImageUrl,
  footerDescription: text(3000),
  socialLinks: z.array(z.object({ label: text(80), href: httpUrl })).max(20),
  whatsappNumber: whatsappSchema,
  whatsappAgentName: z.string().trim().min(2).max(80),
  whatsappResponseTime: z.string().trim().min(2).max(120),
  whatsappGreeting: z.string().trim().min(2).max(300),
  whatsappMessage: z.string().trim().min(2).max(500),
});

const pageSectionSchema = z.object({
  eyebrow: z.string().trim().max(120).optional(),
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(3000).optional(),
});

export const pageSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  eyebrow: text(120),
  title: text(200),
  intro: z.string().trim().max(3000),
  body: z.string().trim().max(100000),
  status: statusSchema,
  sections: z.object({
    account: pageSectionSchema.optional(),
    transparency: pageSectionSchema.optional(),
    legal: pageSectionSchema.optional(),
    organigram: pageSectionSchema.optional(),
    weekday: pageSectionSchema.optional(),
    weekend: pageSectionSchema.optional(),
  }).strict().optional(),
});

export const documentSchema = z.object({
  id: idSchema,
  title: text(200),
  description: text(3000),
  href: publicUrl,
  category: z.enum(["legalitas", "profil", "organisasi"]),
  published: z.boolean(),
});

export const donationSchema = z.object({
  heading: text(200),
  description: text(3000),
  bankName: text(160),
  accountNumber: text(80),
  accountHolder: text(200),
  qrisUrl: optionalImageUrl,
  confirmationMessage: text(1000),
  confirmationWhatsapp: whatsappSchema,
  transparencyHeading: text(200),
});

export const ledgerSchema = z.object({
  id: idSchema,
  type: z.enum(["income", "expense"]),
  description: text(500),
  amount: z.preprocess((value) => typeof value === "string" && !value.trim() ? undefined : value, z.coerce.number().finite().min(0).max(Number.MAX_SAFE_INTEGER)),
  date: z.iso.date(),
  status: z.enum(["planned", "completed"]),
  public: z.boolean(),
});

export const donationSubmissionSchema = z.object({
  donorName: text(160),
  donorPhone: z.string().trim().max(30),
  amount: z.preprocess((value) => typeof value === "string" && !value.trim() ? undefined : value, z.coerce.number().int().finite().min(1000).max(Number.MAX_SAFE_INTEGER)),
  transferDate: z.iso.date(),
  proofUrl: publicUrl,
  note: z.string().trim().max(500),
});

export const donationReviewSchema = z.object({
  id: text(120),
  status: z.enum(["pending", "verified", "rejected"]),
  adminNote: z.string().trim().max(500),
});
export const heroSchema = z.object({
  id: idSchema,
  title: text(200),
  description: text(3000),
  imageUrl,
  ctaLabel: text(120),
  ctaHref: publicUrl,
  order: orderSchema,
  active: z.boolean(),
});

export const organizationSchema = z.object({
  id: idSchema,
  name: text(160),
  role: text(160),
  parentId: text(120).nullable(),
  order: orderSchema,
  active: z.boolean(),
});

export const scheduleSchema = z.object({
  id: idSchema,
  group: z.enum(["weekday", "weekend"]),
  period: z.enum(["pagi", "siang", "sore", "malam"]),
  time: text(120),
  activity: text(500),
  location: z.string().trim().max(200),
  coordinator: z.string().trim().max(160),
  order: orderSchema,
  active: z.boolean(),
});

export const deleteSchema = z.object({ id: text(120) });
export const galleryDeleteSchema = deleteSchema;

export const articleSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(3).max(160),
  slug: slugSchema,
  excerpt: z.string().trim().min(3).max(300),
  body: z.string().trim().min(3).max(100000),
  publishDate: z.iso.date(),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean().default(false),
  coverUrl: optionalImageUrl,
});

export const gallerySchema = z.object({
  id: idSchema,
  url: imageUrl,
  alt: z.string().trim().min(1).max(240),
  caption: z.string().trim().max(300),
  order: orderSchema,
  visible: z.boolean().default(true),
});

export const mediaDeleteSchema = z.object({
  id: z.string().min(1).optional(),
  url: z.string().min(1).max(2000).refine((value) => value.startsWith("/uploads/") || /^https?:\/\//.test(value), "URL media tidak valid."),
});
