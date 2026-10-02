import Image from "next/image";
import { Pencil, Plus, Star } from "lucide-react";
import { deleteArticleAction, saveArticleAction } from "@/app/admin/actions";
import { DeleteButton, EntitySheet } from "@/components/admin/entity-dialogs";
import { ImageField, SelectField, SwitchField, TextField, TextareaField } from "@/components/admin/form";
import { dataTable, EmptyRow, formatDate, PageHeader, Panel, PublishBadge, publishOptions } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { Article } from "@/lib/content-types";

function ArticleFields({ article }: { article?: Article }) {
  return (
    <>
      {article && <input type="hidden" name="id" value={article.id} />}
      <TextField name="title" label="Judul" defaultValue={article?.title} required minLength={3} maxLength={160} />
      <TextField name="slug" label="Slug" defaultValue={article?.slug} maxLength={160} placeholder="otomatis dari judul" hint="Alamat artikel: /berita/slug. Kosongkan untuk membuatnya otomatis dari judul." />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="publishDate" label="Tanggal terbit" type="date" defaultValue={article?.publishDate ?? new Date().toISOString().slice(0, 10)} required />
        <SelectField name="status" label="Status" defaultValue={article?.status ?? "draft"} options={publishOptions} />
      </div>
      <ImageField name="coverUrl" label="Gambar sampul" defaultValue={article?.coverUrl} />
      <TextareaField name="excerpt" label="Ringkasan" defaultValue={article?.excerpt} rows={3} required minLength={3} maxLength={300} hint="Maksimal 300 karakter, tampil di daftar berita." />
      <TextareaField name="body" label="Isi artikel" defaultValue={article?.body} rows={12} required minLength={3} hint="Pisahkan paragraf dengan satu baris kosong." />
      <SwitchField name="featured" label="Artikel unggulan" hint="Ditonjolkan di halaman berita." defaultChecked={article?.featured} />
    </>
  );
}

export default async function NewsAdminPage() {
  await requireAdmin();
  const { articles } = await getSiteContent();
  const sorted = [...articles].sort((a, b) => b.publishDate.localeCompare(a.publishDate));

  return (
    <>
      <PageHeader title="Berita & artikel" description="Tulis artikel, simpan sebagai draft, lalu tayangkan saat siap.">
        <EntitySheet action={saveArticleAction} title="Artikel baru" description="Artikel berstatus draft tidak tampil di website." submitLabel="Simpan artikel" trigger={<Button size="lg"><Plus />Artikel baru</Button>}>
          <ArticleFields />
        </EntitySheet>
      </PageHeader>
      <Panel flush title="Semua artikel" description={`${articles.filter((item) => item.status === "published").length} tayang · ${articles.length} total`}>
        <Table className={dataTable}>
          <TableHeader><TableRow><TableHead>Artikel</TableHead><TableHead>Terbit</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {sorted.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">{article.coverUrl && <Image src={article.coverUrl} alt="" fill sizes="56px" className="object-cover" />}</span>
                    <div className="min-w-0">
                      <p className="flex max-w-xs items-center gap-1.5 font-medium md:max-w-md"><span className="truncate">{article.title}</span>{article.featured && <Star className="size-3.5 shrink-0 fill-orange text-orange" aria-label="Unggulan" />}</p>
                      <p className="max-w-xs truncate text-xs text-muted-foreground md:max-w-md">/berita/{article.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(article.publishDate)}</TableCell>
                <TableCell><PublishBadge status={article.status} /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <EntitySheet action={saveArticleAction} title="Ubah artikel" description={article.title} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${article.title}`}><Pencil /></Button>}>
                      <ArticleFields article={article} />
                    </EntitySheet>
                    <DeleteButton id={article.id} action={deleteArticleAction} title="Hapus artikel?" description={<>Artikel <b>{article.title}</b> akan dihapus permanen dari website.</>} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!sorted.length && <EmptyRow colSpan={4} title="Belum ada artikel" description="Mulai dengan menekan tombol Artikel baru." />}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
}
