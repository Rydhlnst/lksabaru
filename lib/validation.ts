import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const httpUrl = z.string().trim().max(2000).url().refine((value) => /^https?:\/\//i.test(value), "URL harus menggunakan HTTP atau HTTPS.");
const publicUrl = z.union([httpUrl, z.string().trim().max(2000).regex(/^\/(?!\/)[^\s\\]*$/)]);
const optionalImageUrl = z.union([publicUrl, z.literal("")]);
const idSchema = text(120).optional();
const statusSchema = z.enum(["draft", "published", "archived"]);
const slugSchema = z.string().max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const whatsappSchema = z.string().regex(/^\d{8,16}$/);
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
  email: z.string().email(),
  password: z.string().min(8),
});

export const settingsSchema = z.object({
  organizationName: z.string().min(2).max(120),
  shortName: z.string().min(2).max(80),
  address: z.string().min(5).max(300),
  phone: z.string().min(6).max(30),
  email: z.string().email(),
  mapUrl: z.string().url(),
  logoPrimary: publicUrl,
  logoSecondary: optionalImageUrl,
  footerDescription: text(3000),
  socialLinks: z.array(z.object({ label: text(80), href: httpUrl })).max(20),
  whatsappNumber: z.string().regex(/^\d{8,16}$/),
  whatsappAgentName: z.string().min(2).max(80),
  whatsappResponseTime: z.string().min(2).max(120),
  whatsappGreeting: z.string().min(2).max(300),
  whatsappMessage: z.string().min(2).max(500),
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
  type: z.enum(["income", "expense"]),
  description: text(500),
  amount: z.preprocess((value) => typeof value === "string" && !value.trim() ? undefined : value, z.coerce.number().finite().min(0).max(Number.MAX_SAFE_INTEGER)),
  date: z.iso.date(),
  status: z.enum(["planned", "completed"]),
  public: z.boolean(),
});

export const heroSchema = z.object({
  id: idSchema,
  title: text(200),
  description: text(3000),
  imageUrl: publicUrl,
  ctaLabel: text(120),
  ctaHref: publicUrl,
  order: z.coerce.number().int().min(1).max(9999),
  active: z.boolean(),
});

export const organizationSchema = z.object({
  id: idSchema,
  name: text(160),
  role: text(160),
  parentId: text(120).nullable(),
  order: z.coerce.number().int().min(1).max(9999),
  active: z.boolean(),
});

export const scheduleSchema = z.object({
  id: idSchema,
  group: z.enum(["weekday", "weekend"]),
  period: z.enum(["pagi", "siang", "sore", "malam"]),
  time: text(120),
  activity: text(500),
  location: text(200),
  coordinator: text(160),
  order: z.coerce.number().int().min(1).max(9999),
  active: z.boolean(),
});

export const galleryDeleteSchema = z.object({ id: text(120) });

export const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(160),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().min(3).max(300),
  body: z.string().min(3),
  publishDate: z.string().min(8),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean().default(false),
  coverUrl: optionalImageUrl,
});

export const gallerySchema = z.object({
  id: z.string().optional(),
  url: publicUrl,
  alt: z.string().min(1).max(240),
  caption: z.string().max(300),
  order: z.coerce.number().int().min(1).max(9999),
  visible: z.boolean().default(true),
});

export const mediaDeleteSchema = z.object({
  id: z.string().min(1).optional(),
  url: z.string().min(1).max(2000).refine((value) => value.startsWith("/uploads/") || /^https?:\/\//.test(value), "URL media tidak valid."),
});
