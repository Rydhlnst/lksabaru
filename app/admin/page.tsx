import Link from "next/link";
import { ArrowUpRight, FileText, GalleryVerticalEnd, HeartHandshake, Images, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import { listDonationSubmissions } from "@/lib/donation-store";
import { AdminHeader, AdminShell } from "@/components/admin/admin-shell";

export default async function AdminDashboard() {
  await requireAdmin();
  const [content, submissions] = await Promise.all([getSiteContent(), listDonationSubmissions()]);
  const cards = [
    { label: "Berita", value: content.articles.length, href: "/admin/news", icon: FileText },
    { label: "Slide hero", value: content.heroSlides.length, href: "/admin/home", icon: Images },
    { label: "Pengurus", value: content.organization.length, href: "/admin/organization", icon: Users },
    { label: "Bukti donasi", value: submissions.filter((item) => item.status === "pending").length, href: "/admin/donation", icon: HeartHandshake },
  ];
  return <AdminShell><AdminHeader eyebrow="Dashboard" title="Selamat datang di LKSA CMS" description="Satu tempat untuk menjaga cerita, program, dan informasi publik LKSA tetap terbaru." /><div className="max-w-6xl space-y-8 p-5 md:p-10"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, href, icon: Icon }) => <Link key={href} href={href} className="rounded-2xl border border-line bg-white p-5 shadow-subtle transition hover:-translate-y-1 hover:shadow-card"><div className="flex items-center justify-between"><span className="rounded-xl bg-orange/10 p-3 text-orange"><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-muted" /></div><p className="mt-6 text-sm text-muted">{label}</p><p className="mt-1 font-heading text-3xl font-bold text-ink">{value}</p></Link>)}</div><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-2xl border border-line bg-white p-6 shadow-subtle"><div className="flex items-center justify-between"><div><h2 className="font-heading text-xl font-bold">Alur kerja konten</h2><p className="mt-1 text-sm text-muted">Edit dari dashboard, lalu terbitkan perubahan.</p></div><GalleryVerticalEnd className="h-6 w-6 text-green" /></div><div className="mt-6 grid gap-3 text-sm"><p className="rounded-xl bg-[#f8fafc] p-4"><b>1. Kelola:</b> buka modul konten yang ingin diubah.</p><p className="rounded-xl bg-[#f8fafc] p-4"><b>2. Simpan:</b> validasi dilakukan di server sebelum data ditulis.</p><p className="rounded-xl bg-[#f8fafc] p-4"><b>3. Cek:</b> buka website publik untuk memastikan perubahan tampil.</p></div></div><div className="rounded-2xl bg-navy p-6 text-white shadow-card"><HeartHandshake className="h-7 w-7 text-orange" /><h2 className="mt-5 font-heading text-xl font-bold">Website publik</h2><p className="mt-2 text-sm leading-6 text-white/65">Lihat hasil yang sedang dibaca pengunjung.</p><Link href="/" target="_blank" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange hover:text-white">Buka website <ArrowUpRight className="h-4 w-4" /></Link></div></div></div></AdminShell>;
}
