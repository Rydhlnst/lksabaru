import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { deleteArticleAction } from "@/app/admin/actions";
import { ArticleForm } from "@/components/admin/article-form";
import { DeleteButton } from "@/components/admin/entity-dialogs";
import { formatDate, PageHeader, PublishBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";

export default async function ArticleDetailPage({ params }: PageProps<"/admin/news/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { articles } = await getSiteContent();
  const article = articles.find((item) => item.id === decodeURIComponent(id));
  if (!article) notFound();

  return (
    <>
      <Link href="/admin/news" className="-mb-3 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Semua berita</Link>
      <PageHeader title={article.title} description={`/berita/${article.slug} · terbit ${formatDate(article.publishDate)}`}>
        <PublishBadge status={article.status} />
        {article.status === "published" && <Button asChild variant="outline" size="lg"><Link href={`/berita/${article.slug}`} target="_blank">Lihat di website<ExternalLink /></Link></Button>}
        <DeleteButton id={article.id} action={deleteArticleAction} redirectTo="/admin/news" title="Hapus artikel?" description={<>Artikel <b>{article.title}</b> akan dihapus permanen dari website.</>}>Hapus</DeleteButton>
      </PageHeader>
      {/* `key` memastikan form berangkat dari nilai tersimpan setiap kali artikel diperbarui. */}
      <ArticleForm key={article.updatedAt} article={article} today={article.publishDate} />
    </>
  );
}
