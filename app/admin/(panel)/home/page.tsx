import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { deleteHeroAction, saveHeroAction, saveHomeAction } from "@/app/admin/actions";
import { DeleteButton, EntitySheet } from "@/components/admin/entity-dialogs";
import { AdminForm, ImageField, SubmitButton, SwitchField, TextField, TextareaField } from "@/components/admin/form";
import { ActiveBadge, dataTable, EmptyRow, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { HeroSlide } from "@/lib/content-types";

const sections = [["about", "Tentang kami"], ["video", "Video"], ["gallery", "Galeri"], ["news", "Berita"], ["support", "Ajakan donasi"]] as const;

function HeroFields({ slide, nextOrder }: { slide?: HeroSlide; nextOrder: number }) {
  return (
    <>
      {slide && <input type="hidden" name="id" value={slide.id} />}
      <TextField name="title" label="Judul" defaultValue={slide?.title} required maxLength={200} />
      <TextareaField name="description" label="Deskripsi" defaultValue={slide?.description} rows={3} required maxLength={3000} />
      <ImageField name="imageUrl" label="Gambar latar" defaultValue={slide?.imageUrl} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="ctaLabel" label="Teks tombol" defaultValue={slide?.ctaLabel ?? "Pelajari Lebih Lanjut"} required maxLength={120} />
        <TextField name="ctaHref" label="Tujuan tombol" defaultValue={slide?.ctaHref ?? "/tentang-kami"} required hint="Path seperti /donasi atau URL lengkap." />
      </div>
      <TextField name="order" label="Urutan tampil" type="number" min={1} max={9999} defaultValue={slide?.order ?? nextOrder} required />
      <SwitchField name="active" label="Tampilkan di beranda" defaultChecked={slide?.active ?? true} />
    </>
  );
}

export default async function HomeAdminPage() {
  await requireAdmin();
  const { home, heroSlides } = await getSiteContent();
  const slides = [...heroSlides].sort((a, b) => a.order - b.order);
  const nextOrder = Math.max(0, ...heroSlides.map((slide) => slide.order)) + 1;

  return (
    <>
      <PageHeader title="Beranda" description="Kelola slide hero dan teks setiap bagian di halaman beranda." />
      <Panel flush title="Hero carousel" description={`${slides.filter((slide) => slide.active).length} slide tampil · ${slides.length} total`} action={
        <EntitySheet action={saveHeroAction} title="Slide baru" submitLabel="Tambah slide" trigger={<Button variant="outline"><Plus />Slide baru</Button>}>
          <HeroFields nextOrder={nextOrder} />
        </EntitySheet>
      }>
        <Table className={dataTable}>
          <TableHeader><TableRow><TableHead>Slide</TableHead><TableHead>Tombol</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {slides.map((slide) => (
              <TableRow key={slide.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted"><Image src={slide.imageUrl} alt="" fill sizes="64px" className="object-cover" /></span>
                    <span className="max-w-xs truncate font-medium md:max-w-md">{slide.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{slide.ctaLabel} → {slide.ctaHref}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{slide.order}</TableCell>
                <TableCell><ActiveBadge active={slide.active} on="Tampil" off="Disembunyikan" /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <EntitySheet action={saveHeroAction} title="Ubah slide" description={slide.title} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${slide.title}`}><Pencil /></Button>}>
                      <HeroFields slide={slide} nextOrder={nextOrder} />
                    </EntitySheet>
                    <DeleteButton id={slide.id} action={deleteHeroAction} title="Hapus slide?" description={<>Slide <b>{slide.title}</b> akan dihapus dari carousel beranda.</>} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!slides.length && <EmptyRow colSpan={5} title="Belum ada slide" description="Tambahkan slide pertama untuk hero beranda." />}
          </TableBody>
        </Table>
      </Panel>

      <AdminForm action={saveHomeAction} className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map(([key, label]) => {
            const section = home[key];
            return (
              <Panel key={key} title={label} description={`Bagian "${label}" di beranda`}>
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField name={`${key}.eyebrow`} label="Label kecil" defaultValue={section.eyebrow} required maxLength={120} />
                    {"youtubeUrl" in section
                      ? <TextField name={`${key}.youtubeUrl`} label="URL video" type="url" defaultValue={section.youtubeUrl} required hint="YouTube (embed) atau tautan Facebook." />
                      : <TextField name={`${key}.ctaLabel`} label="Teks tombol" defaultValue={section.ctaLabel} required maxLength={120} />}
                  </div>
                  <TextField name={`${key}.title`} label="Judul" defaultValue={section.title} required maxLength={200} />
                  <TextareaField name={`${key}.description`} label="Deskripsi" defaultValue={section.description} rows={3} required maxLength={3000} />
                </div>
              </Panel>
            );
          })}
        </div>
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm text-muted-foreground">Perubahan baru tayang setelah disimpan.</p>
          <SubmitButton>Simpan konten beranda</SubmitButton>
        </div>
      </AdminForm>
    </>
  );
}
