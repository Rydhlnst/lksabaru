import Image from "next/image";
import Link from "next/link";
import { FolderOpen, Pencil, Plus } from "lucide-react";
import { deleteGalleryImageAction, saveGalleryAction } from "@/app/admin/actions";
import { DeleteButton, EntitySheet } from "@/components/admin/entity-dialogs";
import { FormPreviewImage, SwitchField, TextField } from "@/components/admin/form";
import { GalleryImageDropzone } from "@/components/admin/gallery-image-dropzone";
import { ActiveBadge, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { GalleryItem } from "@/lib/content-types";

function DetailFields({ image, initialAlt, nextOrder }: { image?: GalleryItem; initialAlt?: string; nextOrder: number }) {
  return (
    <>
      <TextField name="alt" label="Teks alternatif" defaultValue={image?.alt ?? initialAlt} required maxLength={240} placeholder="Anak asuh mengikuti kegiatan..." hint="Menjelaskan isi foto untuk pembaca layar dan mesin pencari." />
      <TextField name="caption" label="Keterangan" defaultValue={image?.caption} maxLength={300} hint="Opsional, tampil di bawah foto." />
      <TextField name="order" label="Urutan tampil" type="number" min={1} max={9999} defaultValue={image?.order ?? nextOrder} required />
      <SwitchField name="visible" label="Tampilkan di website" defaultChecked={image?.visible ?? true} />
    </>
  );
}

export default async function GalleryAdminPage({ searchParams }: PageProps<"/admin/gallery">) {
  await requireAdmin();
  const params = await searchParams;
  const initialUrl = typeof params.assetUrl === "string" ? params.assetUrl : "";
  const initialAlt = typeof params.assetAlt === "string" ? params.assetAlt : "";
  const { galleries } = await getSiteContent();
  const images = [...galleries].sort((a, b) => a.order - b.order);
  const nextOrder = Math.max(0, ...images.map((image) => image.order)) + 1;

  return (
    <>
      <PageHeader title="Galeri foto" description="Kelola koleksi foto yang tampil di halaman galeri dan beranda.">
        <Button asChild variant="outline" size="lg"><Link href="/admin/media"><FolderOpen />Media Library</Link></Button>
        {/* `key` me-mount ulang sheet saat datang dari Media Library dengan aset terpilih. */}
        <EntitySheet key={initialUrl} defaultOpen={Boolean(initialUrl)} closeHref={initialUrl ? "/admin/gallery" : undefined} action={saveGalleryAction} title="Tambah foto" description={initialUrl ? "Aset dari Media Library sudah dipilih. Lengkapi detailnya." : "Unggah foto, lalu lengkapi detailnya."} submitLabel="Simpan ke galeri" trigger={<Button size="lg"><Plus />Tambah foto</Button>}>
          <GalleryImageDropzone initialUrl={initialUrl} initialAlt={initialAlt} />
          <DetailFields initialAlt={initialAlt} nextOrder={nextOrder} />
        </EntitySheet>
      </PageHeader>
      <Panel title="Foto galeri" description={`${images.filter((image) => image.visible).length} tampil di website · ${images.length} tersimpan`}>
        {images.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="relative aspect-[4/3] bg-muted">
                  <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{image.caption || image.alt}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground"><ActiveBadge active={image.visible} on="Tampil" off="Disembunyikan" />Urutan {image.order}</div>
                  </div>
                  <div className="flex shrink-0">
                    <EntitySheet action={saveGalleryAction} title="Ubah foto" description={image.caption || image.alt} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${image.caption || image.alt}`}><Pencil /></Button>}>
                      <input type="hidden" name="id" value={image.id} />
                      <input type="hidden" name="url" value={image.url} />
                      <FormPreviewImage src={image.url} alt={image.alt} />
                      <DetailFields image={image} nextOrder={nextOrder} />
                    </EntitySheet>
                    <DeleteButton id={image.id} action={deleteGalleryImageAction} title="Hapus foto dari galeri?" description={<>Foto <b>{image.caption || image.alt}</b> akan dilepas dari galeri publik. File aslinya hanya dihapus bila tidak dipakai konten lain.</>} />
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed px-6 py-12 text-center">
            <p className="text-sm font-medium">Belum ada foto</p>
            <p className="mt-1 text-sm text-muted-foreground">Tekan Tambah foto untuk mulai mengisi galeri.</p>
          </div>
        )}
      </Panel>
    </>
  );
}
