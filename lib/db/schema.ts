import { boolean, date, index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const timestamps = { createdAt: timestamp("created_at").notNull().defaultNow(), updatedAt: timestamp("updated_at").notNull().defaultNow() };

export const siteSettings = pgTable("site_settings", { id: text("id").primaryKey(), data: jsonb("data").notNull(), ...timestamps });
export const heroSlides = pgTable("hero_slides", { id: text("id").primaryKey(), title: text("title").notNull(), description: text("description").notNull(), imageUrl: text("image_url").notNull(), ctaLabel: text("cta_label").notNull(), ctaHref: text("cta_href").notNull(), sortOrder: integer("sort_order").notNull().default(0), active: boolean("active").notNull().default(true), ...timestamps });
export const homeValues = pgTable("home_values", { id: text("id").primaryKey(), title: text("title").notNull(), description: text("description").notNull(), icon: text("icon").notNull(), sortOrder: integer("sort_order").notNull().default(0), active: boolean("active").notNull().default(true), ...timestamps });
export const pages = pgTable("pages", { id: text("id").primaryKey(), slug: text("slug").notNull().unique(), title: text("title").notNull(), intro: text("intro").notNull(), body: text("body").notNull(), status: text("status").notNull().default("draft"), ...timestamps });
export const organizationNodes = pgTable("organization_nodes", { id: text("id").primaryKey(), parentId: text("parent_id"), name: text("name").notNull(), role: text("role").notNull(), sortOrder: integer("sort_order").notNull().default(0), active: boolean("active").notNull().default(true), ...timestamps });
export const scheduleEntries = pgTable("schedule_entries", { id: text("id").primaryKey(), groupName: text("group_name").notNull(), period: text("period").notNull(), time: text("time").notNull(), activity: text("activity").notNull(), location: text("location").notNull(), coordinator: text("coordinator").notNull(), sortOrder: integer("sort_order").notNull().default(0), active: boolean("active").notNull().default(true), ...timestamps });
export const articles = pgTable("articles", { id: text("id").primaryKey(), slug: text("slug").notNull().unique(), title: text("title").notNull(), excerpt: text("excerpt").notNull(), coverUrl: text("cover_url").notNull(), body: text("body").notNull(), publishDate: date("publish_date").notNull(), status: text("status").notNull().default("draft"), featured: boolean("featured").notNull().default(false), ...timestamps });
export const galleryItems = pgTable("gallery_items", { id: text("id").primaryKey(), url: text("url").notNull(), alt: text("alt").notNull(), caption: text("caption").notNull(), sortOrder: integer("sort_order").notNull().default(0), visible: boolean("visible").notNull().default(true), ...timestamps });
export const donationSettings = pgTable("donation_settings", { id: text("id").primaryKey(), data: jsonb("data").notNull(), ...timestamps });
export const donationLedger = pgTable("donation_ledger", { id: text("id").primaryKey(), type: text("type").notNull(), description: text("description").notNull(), amount: integer("amount").notNull(), entryDate: date("entry_date").notNull(), status: text("status").notNull(), public: boolean("public").notNull().default(false), ...timestamps });
export const donors = pgTable("donors", { id: text("id").primaryKey(), displayName: text("display_name").notNull(), amount: integer("amount").notNull(), entryDate: date("entry_date").notNull(), public: boolean("public").notNull().default(false), ...timestamps });
export const donationSubmissions = pgTable("donation_submissions", {
  id: text("id").primaryKey(),
  donorName: text("donor_name").notNull(),
  donorPhone: text("donor_phone").notNull().default(""),
  amount: integer("amount").notNull(),
  transferDate: date("transfer_date").notNull(),
  proofUrl: text("proof_url").notNull(),
  note: text("note").notNull().default(""),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note").notNull().default(""),
  verifiedAt: timestamp("verified_at"),
  ...timestamps,
}, (table) => ({ statusCreatedIdx: index("donation_submissions_status_created_idx").on(table.status, table.createdAt) }));
export const mediaAssets = pgTable("media_assets", { id: text("id").primaryKey(), url: text("url").notNull(), filename: text("filename").notNull(), mimeType: text("mime_type").notNull(), alt: text("alt").notNull().default(""), ...timestamps });
