import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CircleAlert, CircleCheck, Database, GalleryVerticalEnd, HardDrive, HeartHandshake, Newspaper, Users, type LucideIcon } from "lucide-react";
import { CashflowChart } from "@/components/admin/cashflow-chart";
import { dataTable, formatDate, formatRupiah, Panel, PublishBadge, Tone } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import { getDataHealth } from "@/lib/data-health";
import { listDonationSubmissions, type DonationSubmission } from "@/lib/donation-store";

const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "short" });

function StatCard({ label, value, note, href, icon: Icon }: { label: string; value: number; note: string; href: string; icon: LucideIcon }) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border text-foreground"><Icon className="size-4" /></span>
      </div>
      <Button asChild variant="outline" className="mt-4"><Link href={href}>Kelola<ArrowRight /></Link></Button>
    </Panel>
  );
}

function HealthRow({ icon: Icon, label, detail, ok }: { icon: LucideIcon; label: string; detail: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border"><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      {ok ? <CircleCheck className="size-4 text-green" aria-label="Terhubung" /> : <CircleAlert className="size-4 text-orange" aria-label="Perlu perhatian" />}
    </li>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();
  const health = await getDataHealth();
  const [content, submissions] = await Promise.all([
    getSiteContent(),
    health.database === "connected" ? listDonationSubmissions().catch(() => [] as DonationSubmission[]) : Promise.resolve([] as DonationSubmission[]),
  ]);

  const verified = submissions.filter((item) => item.status === "verified");
  const pending = submissions.filter((item) => item.status === "pending");
  const completed = content.ledger.filter((item) => item.status === "completed");
  const income = verified.reduce((sum, item) => sum + item.amount, 0) + completed.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = completed.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);

  // Enam bulan terakhir: donasi terverifikasi + ledger pemasukan vs ledger pengeluaran.
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, month: monthLabel.format(date), income: 0, expense: 0 };
  });
  const bucket = new Map(months.map((month) => [month.key, month]));
  for (const item of verified) { const month = bucket.get(item.transferDate.slice(0, 7)); if (month) month.income += item.amount; }
  for (const item of completed) { const month = bucket.get(item.date.slice(0, 7)); if (month) month[item.type] += item.amount; }
  const hasCashflow = months.some((month) => month.income || month.expense);

  const articles = [...content.articles].sort((a, b) => b.publishDate.localeCompare(a.publishDate)).slice(0, 5);
  const published = content.articles.filter((item) => item.status === "published").length;
  const visiblePhotos = content.galleries.filter((item) => item.visible).length;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Panel className="relative">
          <h1 className="text-lg font-semibold tracking-tight">Ringkasan LKSA CMS</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Kondisi konten dan donasi {content.settings.shortName}.</p>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <dt className="text-xs text-muted-foreground">Total pemasukan</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{formatRupiah(income)}</dd>
            </div>
            <div className="border-l pl-8">
              <dt className="text-xs text-muted-foreground">Total pengeluaran</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{formatRupiah(expense)}</dd>
            </div>
          </dl>
        </Panel>
        <StatCard label="Donasi menunggu" value={pending.length} note={pending.length ? "Perlu diverifikasi" : "Semua sudah ditinjau"} href="/admin/donation" icon={HeartHandshake} />
        <StatCard label="Berita tayang" value={published} note={`${content.articles.length - published} draft atau arsip`} href="/admin/news" icon={Newspaper} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Arus donasi" description="Pemasukan dan pengeluaran 6 bulan terakhir" action={<Button asChild variant="outline"><Link href="/admin/donation">Lihat ledger</Link></Button>}>
          {hasCashflow ? <CashflowChart data={months.map(({ month, income: monthIncome, expense: monthExpense }) => ({ month, income: monthIncome, expense: monthExpense }))} /> : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <p className="text-sm font-medium">Belum ada transaksi 6 bulan terakhir</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Grafik terisi setelah ada donasi terverifikasi atau catatan ledger.</p>
            </div>
          )}
        </Panel>
        <div className="grid gap-4">
          <Panel title="Koneksi data" description="Sumber data yang dipakai website">
            <ul className="grid gap-4">
              <HealthRow icon={Database} label="Database" ok={health.database === "connected"} detail={health.database === "connected" ? (health.content === "database" ? "Terhubung · konten dibaca dari database" : "Terhubung · konten belum di-seed, memakai bawaan") : health.database === "error" ? "Gagal terhubung · periksa DATABASE_URL" : "DATABASE_URL belum diatur · memakai file lokal"} />
              <HealthRow icon={HardDrive} label="Penyimpanan media" ok={health.storage === "r2"} detail={health.storage === "r2" ? "Cloudflare R2 terhubung" : health.storage === "r2-error" ? "R2 menolak koneksi · periksa kunci akses dan nama bucket" : health.storage === "incomplete" ? "Konfigurasi R2 belum lengkap" : "Folder lokal public/uploads"} />
            </ul>
          </Panel>
          <Panel title="Isi website">
            <ul className="grid gap-3 text-sm">
              {([
                [GalleryVerticalEnd, "Foto galeri tampil", `${visiblePhotos} dari ${content.galleries.length}`, "/admin/gallery"],
                [Users, "Pengurus aktif", `${content.organization.filter((item) => item.active).length} dari ${content.organization.length}`, "/admin/organization"],
                [CalendarDays, "Jadwal aktif", `${content.schedule.filter((item) => item.active).length} dari ${content.schedule.length}`, "/admin/schedule"],
              ] as const).map(([Icon, label, value, href]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 rounded-lg outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1 text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">{value}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel flush title="Berita terbaru" description="Lima artikel dengan tanggal terbit terkini" action={<Button asChild variant="outline"><Link href="/admin/news">Semua berita</Link></Button>}>
          <Table className={dataTable}>
            <TableHeader><TableRow><TableHead>Artikel</TableHead><TableHead>Terbit</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">{article.coverUrl && <Image src={article.coverUrl} alt="" fill sizes="40px" className="object-cover" />}</span>
                      <span className="max-w-xs truncate font-medium md:max-w-md">{article.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(article.publishDate)}</TableCell>
                  <TableCell><PublishBadge status={article.status} /></TableCell>
                </TableRow>
              ))}
              {!articles.length && <TableRow><TableCell colSpan={3} className="py-10 text-center text-muted-foreground">Belum ada artikel.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Panel>
        <Panel title="Donasi terbaru" description="Bukti transfer dari halaman donasi">
          {submissions.length ? (
            <ul className="grid gap-4">
              {submissions.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold uppercase">{item.donorName.slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.donorName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.transferDate)}</p>
                  </div>
                  <div className="grid justify-items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums">{formatRupiah(item.amount)}</span>
                    <Tone tone={item.status === "verified" ? "success" : item.status === "rejected" ? "danger" : "warning"}>{item.status === "verified" ? "Terverifikasi" : item.status === "rejected" ? "Ditolak" : "Menunggu"}</Tone>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">Belum ada bukti donasi masuk.</p>}
          <Button asChild variant="outline" className="mt-5 w-full"><Link href="/admin/donation">Tinjau donasi</Link></Button>
        </Panel>
      </div>
    </>
  );
}
