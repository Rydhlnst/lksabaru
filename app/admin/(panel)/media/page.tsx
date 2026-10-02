import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { getMediaAssets } from "@/lib/media-store";

export default async function MediaAdminPage() {
  await requireAdmin();
  const assets = await getMediaAssets().catch(() => []);
  return (
    <>
      <PageHeader title="Media Library" description="Unggah gambar yang sudah mendapat izin penggunaan, lalu pakai ulang di galeri, beranda, atau berita.">
        <Button asChild variant="outline" size="lg"><Link href="/admin/gallery"><GalleryVerticalEnd />Galeri</Link></Button>
      </PageHeader>
      <MediaUploader initialAssets={assets.map((asset) => ({ ...asset, createdAt: asset.createdAt.toISOString() }))} />
    </>
  );
}
