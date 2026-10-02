"use client";

import Image from "next/image";
import { CheckCircle2, ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { galleryUploadAccept, getGalleryUploadError } from "@/lib/gallery-upload";

type UploadedAsset = {
  id: string;
  url: string;
  filename: string;
};

type UploadResponse = {
  asset?: UploadedAsset;
  error?: string;
};

type GalleryImageDropzoneProps = {
  initialUrl?: string;
  initialAlt?: string;
};

export function GalleryImageDropzone({ initialUrl = "", initialAlt = "" }: GalleryImageDropzoneProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [filename, setFilename] = useState(initialUrl ? initialAlt || "Aset dari Media Library" : "");
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file: File) {
    const validationError = getGalleryUploadError(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setBusy(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json() as UploadResponse;
      if (!response.ok || !data.asset) {
        setMessage(data.error ?? "Upload gagal. Silakan coba lagi.");
        return;
      }

      setUrl(data.asset.url);
      setPreviewUrl(data.asset.url);
      setFilename(data.asset.filename);
      setUploadedAsset(data.asset);
      setMessage("Foto berhasil diunggah dan siap ditambahkan ke galeri.");
    } catch {
      setMessage("Upload gagal. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void upload(file);
  }

  async function clearSelection() {
    if (uploadedAsset) {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: uploadedAsset.id, url: uploadedAsset.url }),
      }).catch(() => undefined);
    }
    setUrl("");
    setPreviewUrl("");
    setFilename("");
    setUploadedAsset(null);
    setMessage("");
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="url" value={url} />
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={galleryUploadAccept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={"flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors " + (dragging ? "border-orange bg-orange/5" : "border-border bg-white hover:border-foreground/30 hover:bg-muted/50") + (busy ? " cursor-wait opacity-75" : " cursor-pointer")}
        aria-describedby={inputId + "-hint"}
      >
        {previewUrl ? (
          <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl bg-muted">
            <Image src={previewUrl} alt={filename || "Pratinjau foto"} fill sizes="(min-width: 640px) 384px, 100vw" className="object-contain" />
          </div>
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange/10 text-orange">
            {busy ? <Loader2 className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
          </span>
        )}
        <span className="mt-4 text-base font-bold text-foreground">{busy ? "Mengunggah foto..." : previewUrl ? "Pilih foto lain" : "Tarik dan letakkan foto di sini"}</span>
        <span id={inputId + "-hint"} className="mt-1 text-sm text-muted-foreground">{busy ? "Tunggu sampai upload selesai." : "atau klik untuk memilih dari perangkat · JPG, PNG, WebP · maksimal 5 MB"}</span>
      </button>
      {previewUrl && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3">
          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-green"><CheckCircle2 className="h-4 w-4 shrink-0" /><span className="truncate">{filename}</span></p>
          <button type="button" onClick={() => void clearSelection()} disabled={busy} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-red-600">
            <X className="h-4 w-4" /> Hapus
          </button>
        </div>
      )}
      {message && <p className={"text-sm " + (message.includes("berhasil") ? "text-green-700" : "text-red-600")} role="status">{message}</p>}
      {!previewUrl && <p className="flex items-center gap-2 text-xs text-muted-foreground"><ImagePlus className="h-4 w-4" />Foto akan otomatis tersimpan di Media Library setelah dipilih.</p>}
    </div>
  );
}
