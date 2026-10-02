import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { deleteArticleAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/entity-dialogs";
import { dataTable, EmptyRow, formatDate, PageHeader, Panel, PublishBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";

export default async function NewsAdminPage() {
  await requireAdmin();
  const { articles } = await getSiteContent();
  const sorted = [...articles].sort((a, b) => b.publishDate.localeCompare(a.publishDate));

  return (
    <>
      <PageHeader title="Berita & artikel" description="Tulis artikel, simpan sebagai draft, lalu tayangkan saat siap.">
        <Button asChild size="lg"><Link href="/admin/news/new"><Plus />Artikel baru</Link></Button>
      </PageHeader>
      <Panel flush title="Semua artikel" description={`${articles.filter((item) => item.status === "published").length} tayang · ${articles.length} total`}>
        <Table className={dataTable}>
          <TableHeader><TableRow><TableHead>Artikel</TableHead><TableHead>Terbit</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {sorted.map((article) => {
              const href = `/admin/news/${encodeURIComponent(article.id)}`;
              return (
                <TableRow key={article.id}>
                  <TableCell>
                    <Link href={href} className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">{article.coverUrl && <Image src={article.coverUrl} alt="" fill sizes="64px" className="object-cover" />}</span>
                      <span className="min-w-0">
                        <span className="flex max-w-xs items-center gap-1.5 font-medium group-hover:underline md:max-w-lg"><span className="truncate">{article.title}</span>{article.featured && <Star className="size-3.5 shrink-0 fill-orange text-orange" aria-label="Unggulan" />}</span>
                        <span className="block max-w-xs truncate text-xs text-muted-foreground md:max-w-lg">{article.excerpt}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(article.publishDate)}</TableCell>
                  <TableCell><PublishBadge status={article.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`Ubah ${article.title}`}><Link href={href}><Pencil /></Link></Button>
                      <DeleteButton id={article.id} action={deleteArticleAction} title="Hapus artikel?" description={<>Artikel <b>{article.title}</b> akan dihapus permanen dari website.</>} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!sorted.length && <EmptyRow colSpan={4} title="Belum ada artikel" description="Mulai dengan menekan tombol Artikel baru." />}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
}
