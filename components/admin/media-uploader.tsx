"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, ImagePlus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, Panel } from "@/components/admin/ui";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  alt: string;
  createdAt: string;
};

type UploadResponse = { url?: string; error?: string; asset?: MediaAsset };

function galleryHref(asset: MediaAsset) {
  const params = new URLSearchParams({ assetUrl: asset.url, assetAlt: asset.alt || asset.filename });
  return `/admin/gallery?${params.toString()}`;
}

function DeleteMediaDialog({ asset, disabled, onDelete }: { asset: MediaAsset; disabled: boolean; onDelete: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const deleted = await onDelete();
    setDeleting(false);
    if (deleted) setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" disabled={disabled} aria-label={`Hapus ${asset.filename}`} title="Hapus" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus aset ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Aset <span className="font-semibold">{asset.filename}</span> akan dihapus permanen dari penyimpanan. Gambar yang masih dipakai konten tidak akan terhapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleting} onClick={(event) => { event.preventDefault(); void handleDelete(); }}>
            {deleting ? "Menghapus..." : "Ya, hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function MediaUploader({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedAsset, setUploadedAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/upload", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await response.json() as UploadResponse;
      if (!response.ok || !data.asset) {
        const error = data.error ?? "Upload gagal.";
        setMessage(error);
        toast.error(error);
        return;
      }
      setAssets((current) => [data.asset!, ...current.filter((asset) => asset.id !== data.asset!.id)]);
      setUploadedAsset(data.asset);
      event.currentTarget.reset();
      setUploadOpen(false);
      setMessage("Aset berhasil diunggah.");
      toast.success("Aset berhasil diunggah.");
    } catch {
      const error = "Upload gagal. Periksa koneksi lalu coba lagi.";
      setMessage(error);
      toast.error(error);
    } finally {
      setBusy(false);
    }
  }

  async function removeAsset(asset: MediaAsset) {
    setBusy(true);
    try {
      const response = await fetch("/api/upload", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: asset.id, url: asset.url }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        const error = data.error ?? "Media tidak dapat dihapus.";
        setMessage(error);
        toast.error(error);
        return false;
      }
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      setUploadedAsset((current) => current?.id === asset.id ? null : current);
      setMessage("Media berhasil dihapus.");
      toast.success("Media berhasil dihapus.");
      return true;
    } catch {
      const error = "Media tidak dapat dihapus. Periksa koneksi lalu coba lagi.";
      setMessage(error);
      toast.error(error);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl(asset: MediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.url);
    } catch {
      toast.error("URL tidak dapat disalin. Salin manual dari kolom gambar.");
      return;
    }
    setCopiedId(asset.id);
    toast.success("URL gambar disalin.");
    window.setTimeout(() => setCopiedId((current) => current === asset.id ? null : current), 1600);
  }

  const uploadDialog = (
    <Dialog open={uploadOpen} onOpenChange={(open) => { if (!busy) setUploadOpen(open); }}>
      <DialogTrigger asChild>
        <Button type="button"><Upload />Unggah gambar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Unggah gambar baru</DialogTitle>
          <DialogDescription>Gunakan JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium" htmlFor="media-file">
            Pilih gambar
            <input id="media-file" className="rounded-lg border border-border p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:font-medium file:text-foreground" type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          {message && <p className="text-sm text-destructive" role="alert">{message}</p>}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={busy}>Batal</Button></DialogClose>
            <Button type="submit" disabled={busy}>{busy ? "Mengunggah..." : "Unggah"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="grid gap-4">
      {uploadedAsset && (
        <section className="flex flex-col gap-4 rounded-xl border border-green/30 bg-green/5 p-4 sm:flex-row sm:items-center">
          <Image src={uploadedAsset.url} alt={uploadedAsset.alt || uploadedAsset.filename} width={220} height={160} className="aspect-[4/3] w-full rounded-lg object-cover sm:w-32" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-medium text-green"><CheckCircle2 className="size-4" />Gambar siap digunakan</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{uploadedAsset.filename}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button asChild><Link href={galleryHref(uploadedAsset)}>Tambahkan ke galeri<ArrowRight /></Link></Button>
              <Button type="button" variant="outline" onClick={() => void copyUrl(uploadedAsset)}><Copy />{copiedId === uploadedAsset.id ? "Tersalin" : "Salin URL"}</Button>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Tutup pratinjau" onClick={() => setUploadedAsset(null)} className="self-start"><X /></Button>
        </section>
      )}

      <Panel title="Gambar tersimpan" description={`${assets.length} gambar · yang masih dipakai konten tidak dapat dihapus`} action={uploadDialog}>
        {assets.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-xl border bg-card">
                <Image src={asset.url} alt={asset.alt || asset.filename} width={640} height={480} sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full bg-muted object-cover" />
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" title={asset.filename}>{asset.filename}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(new Date(asset.createdAt))}</p>
                  </div>
                  <div className="flex shrink-0">
                    <Button type="button" variant="ghost" size="icon" aria-label={`Salin URL ${asset.filename}`} title="Salin URL" onClick={() => void copyUrl(asset)}>{copiedId === asset.id ? <CheckCircle2 className="text-green" /> : <Copy />}</Button>
                    <Button asChild variant="ghost" size="icon" aria-label={`Tambahkan ${asset.filename} ke galeri`} title="Tambahkan ke galeri"><Link href={galleryHref(asset)}><ImagePlus /></Link></Button>
                    <DeleteMediaDialog asset={asset} disabled={busy} onDelete={() => removeAsset(asset)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Belum ada gambar tersimpan</p>
            <p className="mt-1 text-sm text-muted-foreground">Unggah gambar pertama untuk mulai mengisi Media Library.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
