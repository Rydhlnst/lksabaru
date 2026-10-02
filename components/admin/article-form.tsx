"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveArticleAction } from "@/app/admin/actions";
import { AdminForm, ImageField, SelectField, SubmitButton, SwitchField, TextField, TextareaField } from "@/components/admin/form";
import { Panel, publishOptions } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/content-types";

/** Form satu halaman penuh untuk artikel baru maupun yang sudah ada; setelah tersimpan kembali ke daftar berita. */
export function ArticleForm({ article, today }: { article?: Article; today: string }) {
  const router = useRouter();
  return (
    <AdminForm action={saveArticleAction} onSuccess={() => router.push("/admin/news")} className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {article && <input type="hidden" name="id" value={article.id} />}
      <Panel title="Konten" description="Judul, ringkasan, dan isi yang dibaca pengunjung">
        <div className="grid gap-4">
          <TextField name="title" label="Judul" defaultValue={article?.title} required minLength={3} maxLength={160} />
          <TextareaField name="excerpt" label="Ringkasan" defaultValue={article?.excerpt} rows={3} required minLength={3} maxLength={300} hint="Maksimal 300 karakter, tampil di daftar berita." />
          <TextareaField name="body" label="Isi artikel" defaultValue={article?.body} rows={18} required minLength={3} hint="Pisahkan paragraf dengan satu baris kosong." />
        </div>
      </Panel>
      <div className="grid gap-4">
        <Panel title="Penerbitan">
          <div className="grid gap-4">
            <SelectField name="status" label="Status" defaultValue={article?.status ?? "draft"} options={publishOptions} hint="Hanya artikel berstatus Tayang yang tampil di website." />
            <TextField name="publishDate" label="Tanggal terbit" type="date" defaultValue={article?.publishDate ?? today} required />
            <SwitchField name="featured" label="Artikel unggulan" hint="Ditonjolkan di halaman berita." defaultChecked={article?.featured} />
          </div>
        </Panel>
        <Panel title="Sampul & alamat">
          <div className="grid gap-4">
            <ImageField name="coverUrl" label="Gambar sampul" defaultValue={article?.coverUrl} />
            <TextField name="slug" label="Slug" defaultValue={article?.slug} maxLength={160} placeholder="otomatis dari judul" hint="Alamat artikel: /berita/slug. Kosongkan untuk membuatnya otomatis dari judul." />
          </div>
        </Panel>
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="lg"><Link href="/admin/news">Batal</Link></Button>
          <SubmitButton>{article ? "Simpan perubahan" : "Simpan artikel"}</SubmitButton>
        </div>
      </div>
    </AdminForm>
  );
}
