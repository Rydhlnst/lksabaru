import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { savePageAction } from "@/app/admin/actions";
import { EntitySheet } from "@/components/admin/entity-dialogs";
import { SelectField, TextField, TextareaField } from "@/components/admin/form";
import { dataTable, EmptyRow, formatDate, PageHeader, Panel, PublishBadge, publishOptions } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { PageContent, PageSections } from "@/lib/content-types";

// Slug halaman → rute publik yang menampilkannya.
const publicRoutes: Record<string, string> = {
  "tentang-kami": "/tentang-kami",
  "sop-pengasuhan": "/sop-pengasuhan",
  "struktur-organisasi": "/struktur-organisasi",
  "jadwal-kegiatan": "/profil/jadwal-kegiatan",
  berita: "/berita",
  galeri: "/galeri",
  kontak: "/kontak",
  donasi: "/donasi",
};

const sectionLabels: Record<keyof PageSections, string> = {
  account: "Bagian rekening",
  transparency: "Bagian transparansi",
  legal: "Bagian legalitas",
  organigram: "Bagian organigram",
  weekday: "Bagian hari efektif",
  weekend: "Bagian akhir pekan",
};

function PageFields({ page }: { page: PageContent }) {
  const sections = Object.entries(page.sections ?? {}) as [keyof PageSections, NonNullable<PageSections[keyof PageSections]>][];
  return (
    <>
      <input type="hidden" name="id" value={page.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="eyebrow" label="Label kecil" defaultValue={page.eyebrow} required maxLength={120} />
        <SelectField name="status" label="Status" defaultValue={page.status} options={publishOptions} hint="Selain Tayang, halaman publik menjadi tidak ditemukan." />
      </div>
      <TextField name="title" label="Judul" defaultValue={page.title} required maxLength={200} />
      <TextareaField name="intro" label="Pengantar" defaultValue={page.intro} rows={3} maxLength={3000} />
      <TextareaField name="body" label="Isi halaman" defaultValue={page.body} rows={page.body ? 14 : 4} hint="Pisahkan paragraf dengan satu baris kosong. Boleh dikosongkan untuk halaman yang isinya berasal dari modul lain." />
      {sections.map(([key, section]) => (
        <fieldset key={key} className="grid gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">{sectionLabels[key]}</legend>
          <TextField name={`sections.${key}.eyebrow`} label="Label kecil" defaultValue={section.eyebrow} maxLength={120} />
          <TextField name={`sections.${key}.title`} label="Judul bagian" defaultValue={section.title} maxLength={200} />
          <TextareaField name={`sections.${key}.description`} label="Deskripsi bagian" defaultValue={section.description} rows={3} maxLength={3000} />
        </fieldset>
      ))}
    </>
  );
}

export default async function PagesAdminPage() {
  await requireAdmin();
  const { pages } = await getSiteContent();

  return (
    <>
      <PageHeader title="Halaman" description="Ubah judul, pengantar, dan isi halaman profil. Alamat halaman bersifat tetap agar tautan publik tidak rusak." />
      <Panel flush title="Halaman website" description={`${pages.filter((page) => page.status === "published").length} tayang · ${pages.length} total`}>
        <Table className={dataTable}>
          <TableHeader><TableRow><TableHead>Halaman</TableHead><TableHead>Alamat</TableHead><TableHead>Diperbarui</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {pages.map((page) => {
              const route = publicRoutes[page.slug];
              return (
                <TableRow key={page.id}>
                  <TableCell><p className="font-medium">{page.title}</p><p className="max-w-sm truncate text-xs text-muted-foreground">{page.intro}</p></TableCell>
                  <TableCell className="text-muted-foreground">{route ?? `/${page.slug}`}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(page.updatedAt)}</TableCell>
                  <TableCell><PublishBadge status={page.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {route && <Button asChild variant="ghost" size="icon" aria-label={`Buka ${page.title} di website`}><Link href={route} target="_blank"><ExternalLink /></Link></Button>}
                      <EntitySheet action={savePageAction} title="Ubah halaman" description={route ?? page.slug} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${page.title}`}><Pencil /></Button>}>
                        <PageFields page={page} />
                      </EntitySheet>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!pages.length && <EmptyRow colSpan={5} title="Belum ada halaman" description="Jalankan seed konten untuk membuat halaman bawaan." />}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
}
