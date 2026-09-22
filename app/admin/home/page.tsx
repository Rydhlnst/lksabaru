import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { HeroSlide } from "@/lib/content-types";
import { AdminHeader, AdminShell } from "@/components/admin/admin-shell";
import { saveHeroAction, saveHomeAction } from "@/app/admin/actions";

const input = "mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm";
const sections = [["about", "Tentang kami"], ["video", "Video"], ["gallery", "Galeri"], ["news", "Berita"], ["support", "Dukungan"]] as const;

function HeroForm({ slide, order }: { slide?: HeroSlide; order: number }) {
  return (
    <form action={saveHeroAction} className={`grid gap-5 rounded-2xl bg-white p-6 md:grid-cols-2 ${slide ? "border border-line shadow-subtle" : "border-2 border-dashed border-line"}`}>
      {slide ? <input type="hidden" name="id" value={slide.id} /> : <h2 className="font-heading text-xl font-bold md:col-span-2">Tambah slide baru</h2>}
      <label className="text-sm font-semibold">Judul<input className={input} name="title" defaultValue={slide?.title} required /></label>
      <label className="text-sm font-semibold">Urutan<input className={input} name="order" type="number" defaultValue={order} min={1} required /></label>
      <label className="text-sm font-semibold md:col-span-2">Deskripsi<textarea className={input} name="description" defaultValue={slide?.description} rows={2} required /></label>
      <div><label className="text-sm font-semibold">URL gambar<input className={input} name="imageUrl" defaultValue={slide?.imageUrl} placeholder="/uploads/hero.jpg" required /></label><Link href="/admin/media" target="_blank" className="mt-2 inline-block text-sm font-semibold text-orange">Buka Media Library untuk menyalin URL</Link></div>
      <label className="text-sm font-semibold">Label CTA<input className={input} name="ctaLabel" defaultValue={slide?.ctaLabel ?? "Pelajari Lebih Lanjut"} required /></label>
      <label className="text-sm font-semibold">Tujuan CTA<input className={input} name="ctaHref" defaultValue={slide?.ctaHref ?? "/tentang-kami"} required /></label>
      <label className="flex items-center gap-2 pt-8 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={slide?.active ?? true} /> Aktif di website</label>
      <button className="button-primary w-fit">{slide ? "Simpan Slide" : "Tambah Slide"}</button>
    </form>
  );
}

export default async function HomeAdminPage({ searchParams }: PageProps<"/admin/home">) {
  await requireAdmin();
  const params = await searchParams;
  const { home, heroSlides } = await getSiteContent();
  return (
    <AdminShell>
      <AdminHeader eyebrow="Beranda" title="Konten beranda & hero" description="Kelola teks bagian beranda, video, tombol CTA, dan slide hero." />
      <div className="max-w-6xl space-y-6 p-5 md:p-10">
        {params.error === "validation" && <p role="alert" className="text-sm text-red-600">Data tidak valid. Periksa isian dan URL, lalu simpan kembali.</p>}
        {params.saved === "1" && <p role="status" className="text-sm text-green-700">Konten beranda berhasil disimpan.</p>}
        <form action={saveHomeAction} className="space-y-6 rounded-2xl border border-line bg-white p-6 shadow-subtle">
          <h2 className="font-heading text-xl font-bold">Bagian beranda</h2>
          {sections.map(([key, label]) => {
            const section = home[key];
            return (
              <fieldset key={key} className="grid gap-5 border-t border-line pt-5 md:grid-cols-2">
                <legend className="px-2 font-heading text-lg font-bold">{label}</legend>
                <label className="text-sm font-semibold">Label bagian (eyebrow)<input className={input} name={`${key}.eyebrow`} defaultValue={section.eyebrow} required /></label>
                <label className="text-sm font-semibold">Judul<input className={input} name={`${key}.title`} defaultValue={section.title} required /></label>
                <label className="text-sm font-semibold md:col-span-2">Deskripsi<textarea className={input} name={`${key}.description`} defaultValue={section.description} rows={3} required /></label>
                {"youtubeUrl" in section ? <label className="text-sm font-semibold md:col-span-2">URL Video (YouTube atau Facebook)<input className={input} name={`${key}.youtubeUrl`} type="url" defaultValue={section.youtubeUrl} required /></label> : <label className="text-sm font-semibold">Label CTA<input className={input} name={`${key}.ctaLabel`} defaultValue={section.ctaLabel} required /></label>}
              </fieldset>
            );
          })}
          <button className="button-primary w-fit">Simpan Konten Beranda</button>
        </form>
        <h2 className="font-heading text-xl font-bold">Hero carousel</h2>
        {[...heroSlides].sort((a, b) => a.order - b.order).map((slide) => <HeroForm key={slide.id} slide={slide} order={slide.order} />)}
        <HeroForm order={heroSlides.length + 1} />
      </div>
    </AdminShell>
  );
}
