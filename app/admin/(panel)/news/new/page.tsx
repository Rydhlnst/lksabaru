import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/components/admin/article-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export default async function NewArticlePage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/news" className="-mb-3 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Semua berita</Link>
      <PageHeader title="Artikel baru" description="Artikel berstatus draft tidak tampil di website sampai statusnya diubah menjadi Tayang." />
      <ArticleForm today={new Date().toISOString().slice(0, 10)} />
    </>
  );
}
