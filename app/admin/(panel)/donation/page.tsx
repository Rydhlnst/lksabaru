import { ExternalLink, Pencil, Plus } from "lucide-react";
import { deleteDocumentAction, deleteLedgerAction, reviewDonationAction, saveDocumentAction, saveDonationAction, saveLedgerAction } from "@/app/admin/actions";
import { DeleteButton, EntitySheet } from "@/components/admin/entity-dialogs";
import { AdminForm, ImageField, SelectField, SubmitButton, SwitchField, TextField, TextareaField } from "@/components/admin/form";
import { ActiveBadge, dataTable, EmptyRow, formatDate, formatRupiah, PageHeader, Panel, Tone } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { DonationLedgerEntry, PublicDocument } from "@/lib/content-types";
import { getDataHealth } from "@/lib/data-health";
import { listDonationSubmissions, type DonationSubmission } from "@/lib/donation-store";

const reviewOptions = [{ value: "pending", label: "Menunggu" }, { value: "verified", label: "Terverifikasi" }, { value: "rejected", label: "Ditolak" }] as const;
const ledgerTypes = [{ value: "income", label: "Pemasukan" }, { value: "expense", label: "Pengeluaran" }] as const;
const ledgerStatuses = [{ value: "completed", label: "Selesai" }, { value: "planned", label: "Direncanakan" }] as const;
const documentCategories = [{ value: "legalitas", label: "Legalitas" }, { value: "profil", label: "Profil" }, { value: "organisasi", label: "Organisasi" }] as const;

function SubmissionStatus({ status }: { status: string }) {
  return <Tone tone={status === "verified" ? "success" : status === "rejected" ? "danger" : "warning"}>{status === "verified" ? "Terverifikasi" : status === "rejected" ? "Ditolak" : "Menunggu"}</Tone>;
}

function ReviewFields({ submission }: { submission: DonationSubmission }) {
  return (
    <>
      <input type="hidden" name="id" value={submission.id} />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
        <div><dt className="text-xs text-muted-foreground">Donatur</dt><dd className="font-medium">{submission.donorName}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Nominal</dt><dd className="font-medium tabular-nums">{formatRupiah(submission.amount)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Tanggal transfer</dt><dd>{formatDate(submission.transferDate)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">WhatsApp</dt><dd>{submission.donorPhone || "—"}</dd></div>
        {submission.note && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Catatan donatur</dt><dd className="whitespace-pre-line">{submission.note}</dd></div>}
      </dl>
      <Button asChild variant="outline" size="lg" className="w-fit"><a href={submission.proofUrl} target="_blank" rel="noreferrer">Lihat bukti transfer<ExternalLink /></a></Button>
      <SelectField name="status" label="Keputusan" defaultValue={submission.status === "pending" ? "verified" : submission.status} options={reviewOptions} hint="Hanya donasi terverifikasi yang masuk ke total publik." />
      <TextareaField name="adminNote" label="Catatan admin" defaultValue={submission.adminNote} rows={3} maxLength={500} hint="Opsional, hanya terlihat di dashboard." />
    </>
  );
}

function LedgerFields({ entry }: { entry?: DonationLedgerEntry }) {
  return (
    <>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="type" label="Jenis" defaultValue={entry?.type ?? "income"} options={ledgerTypes} />
        <SelectField name="status" label="Status" defaultValue={entry?.status ?? "completed"} options={ledgerStatuses} />
      </div>
      <TextField name="description" label="Keterangan" defaultValue={entry?.description} required maxLength={500} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="amount" label="Nominal (Rp)" type="number" min={0} step={1} defaultValue={entry?.amount} required inputMode="numeric" />
        <TextField name="date" label="Tanggal" type="date" defaultValue={entry?.date ?? new Date().toISOString().slice(0, 10)} required />
      </div>
      <SwitchField name="public" label="Tampilkan ke publik" hint="Masuk ke laporan transparansi di halaman donasi." defaultChecked={entry?.public ?? true} />
    </>
  );
}

function DocumentFields({ document }: { document?: PublicDocument }) {
  return (
    <>
      {document && <input type="hidden" name="id" value={document.id} />}
      <TextField name="title" label="Judul dokumen" defaultValue={document?.title} required maxLength={200} />
      <TextareaField name="description" label="Deskripsi" defaultValue={document?.description} rows={3} required maxLength={3000} />
      <TextField name="href" label="URL dokumen" defaultValue={document?.href} required placeholder="/documents/akta.pdf" hint="Path file di website atau URL lengkap (https://…)." />
      <SelectField name="category" label="Kategori" defaultValue={document?.category ?? "legalitas"} options={documentCategories} />
      <SwitchField name="published" label="Tampilkan ke publik" defaultChecked={document?.published ?? true} />
    </>
  );
}

export default async function DonationAdminPage() {
  await requireAdmin();
  const health = await getDataHealth();
  const [{ donation, ledger, documents }, submissions] = await Promise.all([
    getSiteContent(),
    health.database === "connected" ? listDonationSubmissions().catch(() => [] as DonationSubmission[]) : Promise.resolve([] as DonationSubmission[]),
  ]);
  const pendingCount = submissions.filter((item) => item.status === "pending").length;
  const entries = [...ledger].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader title="Donasi & transparansi" description="Verifikasi bukti transfer, catat arus dana, dan kelola informasi rekening serta dokumen legalitas." />
      <Tabs defaultValue="submissions" className="gap-4">
        <TabsList>
          <TabsTrigger value="submissions">Bukti donasi{pendingCount > 0 && <span className="ml-1 rounded-full bg-orange px-1.5 text-[11px] font-semibold text-white">{pendingCount}</span>}</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="documents">Dokumen</TabsTrigger>
          <TabsTrigger value="info">Informasi donasi</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Panel flush title="Bukti donasi masuk" description={health.database !== "connected" ? "Database belum terhubung, sehingga pengajuan donasi tidak dapat dimuat." : pendingCount ? `${pendingCount} donasi menunggu verifikasi · ${submissions.length} pengajuan` : `Semua sudah ditinjau · ${submissions.length} pengajuan`}>
            <Table className={dataTable}>
              <TableHeader><TableRow><TableHead>Donatur</TableHead><TableHead>Nominal</TableHead><TableHead>Transfer</TableHead><TableHead>Dikirim</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell><p className="font-medium">{submission.donorName}</p>{submission.donorPhone && <p className="text-xs text-muted-foreground">{submission.donorPhone}</p>}</TableCell>
                    <TableCell className="font-medium tabular-nums">{formatRupiah(submission.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(submission.transferDate)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(submission.createdAt)}</TableCell>
                    <TableCell><SubmissionStatus status={submission.status} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <EntitySheet action={reviewDonationAction} title="Tinjau donasi" description={`Dari ${submission.donorName}`} submitLabel="Simpan keputusan" trigger={<Button variant={submission.status === "pending" ? "default" : "outline"}>Tinjau</Button>}>
                          <ReviewFields submission={submission} />
                        </EntitySheet>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!submissions.length && <EmptyRow colSpan={6} title="Belum ada bukti donasi" description="Pengajuan dari halaman donasi publik akan muncul di sini." />}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="ledger">
          <Panel flush title="Ledger transparansi" description="Catatan pemasukan dan pengeluaran di luar donasi yang diverifikasi" action={
            <EntitySheet action={saveLedgerAction} title="Catatan baru" submitLabel="Tambah catatan" trigger={<Button variant="outline"><Plus />Catatan baru</Button>}>
              <LedgerFields />
            </EntitySheet>
          }>
            <Table className={dataTable}>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Keterangan</TableHead><TableHead>Jenis</TableHead><TableHead className="text-right">Nominal</TableHead><TableHead>Status</TableHead><TableHead>Publik</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">{formatDate(entry.date)}</TableCell>
                    <TableCell className="max-w-sm whitespace-normal font-medium">{entry.description}</TableCell>
                    <TableCell><Tone tone={entry.type === "income" ? "success" : "warning"}>{entry.type === "income" ? "Pemasukan" : "Pengeluaran"}</Tone></TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatRupiah(entry.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.status === "completed" ? "Selesai" : "Direncanakan"}</TableCell>
                    <TableCell><ActiveBadge active={entry.public} on="Ya" off="Tidak" /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <EntitySheet action={saveLedgerAction} title="Ubah catatan" description={entry.description} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${entry.description}`}><Pencil /></Button>}>
                          <LedgerFields entry={entry} />
                        </EntitySheet>
                        <DeleteButton id={entry.id} action={deleteLedgerAction} title="Hapus catatan?" description={<>Catatan <b>{entry.description}</b> ({formatRupiah(entry.amount)}) akan dihapus dari ledger.</>} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!entries.length && <EmptyRow colSpan={7} title="Ledger masih kosong" description="Tambahkan pemasukan atau pengeluaran untuk laporan transparansi." />}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="documents">
          <Panel flush title="Dokumen pendukung" description="Dokumen legalitas dan profil yang tampil di halaman donasi" action={
            <EntitySheet action={saveDocumentAction} title="Dokumen baru" submitLabel="Tambah dokumen" trigger={<Button variant="outline"><Plus />Dokumen baru</Button>}>
              <DocumentFields />
            </EntitySheet>
          }>
            <Table className={dataTable}>
              <TableHeader><TableRow><TableHead>Dokumen</TableHead><TableHead>Kategori</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell><p className="font-medium">{document.title}</p><p className="max-w-md truncate text-xs text-muted-foreground">{document.href}</p></TableCell>
                    <TableCell className="capitalize text-muted-foreground">{document.category}</TableCell>
                    <TableCell><ActiveBadge active={document.published} on="Tampil" off="Disembunyikan" /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label={`Buka ${document.title}`}><a href={document.href} target="_blank" rel="noreferrer"><ExternalLink /></a></Button>
                        <EntitySheet action={saveDocumentAction} title="Ubah dokumen" description={document.title} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${document.title}`}><Pencil /></Button>}>
                          <DocumentFields document={document} />
                        </EntitySheet>
                        <DeleteButton id={document.id} action={deleteDocumentAction} title="Hapus dokumen?" description={<>Dokumen <b>{document.title}</b> akan dihapus dari daftar. File aslinya tidak ikut terhapus.</>} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!documents.length && <EmptyRow colSpan={4} title="Belum ada dokumen" description="Tambahkan dokumen legalitas atau profil lembaga." />}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="info">
          <AdminForm action={saveDonationAction} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Ajakan donasi" description="Teks pembuka di halaman donasi">
                <div className="grid gap-4">
                  <TextField name="heading" label="Judul" defaultValue={donation.heading} required maxLength={200} />
                  <TextareaField name="description" label="Deskripsi" defaultValue={donation.description} rows={4} required maxLength={3000} />
                  <TextField name="transparencyHeading" label="Judul bagian transparansi" defaultValue={donation.transparencyHeading} required maxLength={200} />
                </div>
              </Panel>
              <Panel title="Rekening & konfirmasi" description="Tujuan transfer dan kontak konfirmasi">
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField name="bankName" label="Nama bank" defaultValue={donation.bankName} required maxLength={160} />
                    <TextField name="accountNumber" label="Nomor rekening" defaultValue={donation.accountNumber} required maxLength={80} />
                  </div>
                  <TextField name="accountHolder" label="Atas nama" defaultValue={donation.accountHolder} required maxLength={200} />
                  <ImageField name="qrisUrl" label="Gambar QRIS" defaultValue={donation.qrisUrl} hint="Opsional. Kosongkan bila belum memiliki QRIS." />
                  <TextField name="confirmationWhatsapp" label="WhatsApp konfirmasi" defaultValue={donation.confirmationWhatsapp} required inputMode="numeric" hint="Format internasional tanpa +, contoh 628123456789." />
                  <TextareaField name="confirmationMessage" label="Pesan konfirmasi" defaultValue={donation.confirmationMessage} rows={3} required maxLength={1000} />
                </div>
              </Panel>
            </div>
            <div className="flex justify-end"><SubmitButton>Simpan informasi donasi</SubmitButton></div>
          </AdminForm>
        </TabsContent>
      </Tabs>
    </>
  );
}
