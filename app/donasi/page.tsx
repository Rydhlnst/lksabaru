import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileCheck, HeartHandshake } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { PublicShell } from "@/components/site/public-shell";
import { DonationSubmissionForm } from "@/components/donation-submission-form";
import { listVerifiedDonations } from "@/lib/donation-store";

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export const dynamic = "force-dynamic";

export default async function DonationPage() {
  const content = await getSiteContent();
  const page = content.pages.find((item) => item.slug === "donasi" && item.status === "published");
  if (!page) notFound();
  const { account, transparency, legal } = page.sections ?? {};
  if (!account || !transparency || !legal) notFound();
  const { donation, ledger } = content;
  const verifiedDonations = await listVerifiedDonations();
  const income = ledger.filter((item) => item.type === "income" && item.public).reduce((sum, item) => sum + item.amount, 0) + verifiedDonations.reduce((sum, item) => sum + item.amount, 0);
  const expense = ledger.filter((item) => item.type === "expense" && item.public).reduce((sum, item) => sum + item.amount, 0);
  const publicDocuments = content.documents.filter((document) => document.published);
  const confirmHref = `https://wa.me/${donation.confirmationWhatsapp}?text=${encodeURIComponent(donation.confirmationMessage)}`;

  return <PublicShell content={content}>
    <section className="bg-[#f8fafc] py-16 md:py-24"><div className="site-container"><span className="eyebrow">{page.eyebrow}</span><h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold text-ink md:text-6xl">{donation.heading}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{donation.description}</p></div></section>
    <section className="site-container grid gap-8 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-24"><div className="rounded-3xl bg-navy p-8 text-white shadow-card md:p-10"><HeartHandshake className="h-10 w-10 text-orange" /><h2 className="mt-6 font-heading text-2xl font-bold">{account.title}</h2><p className="mt-6 text-xs font-bold uppercase tracking-wider text-white/55">Bank</p><p className="mt-2 font-semibold">{donation.bankName}</p><p className="mt-5 text-xs font-bold uppercase tracking-wider text-white/55">Nomor Rekening</p><p className="mt-2 font-heading text-2xl font-bold text-orange">{donation.accountNumber}</p><p className="mt-5 text-xs font-bold uppercase tracking-wider text-white/55">Atas Nama</p><p className="mt-2 font-semibold">{donation.accountHolder}</p><p className="mt-6 border-l-2 border-orange pl-4 text-sm leading-6 text-white/75">{account.description}</p><Link className="button-primary mt-8" href={confirmHref} target="_blank" rel="noreferrer">Konfirmasi via WhatsApp <ArrowRight className="ml-2 h-4 w-4" /></Link></div><div className="rounded-3xl border border-line bg-white p-8 shadow-subtle md:p-10"><span className="eyebrow">{transparency.eyebrow}</span><h2 className="mt-5 font-heading text-2xl font-bold text-ink">{transparency.title}</h2><div className="mt-8 grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-muted">Donasi masuk</p><p className="mt-1 font-heading text-xl font-bold text-green">{money(income)}</p></div><div><p className="text-xs text-muted">Pengeluaran</p><p className="mt-1 font-heading text-xl font-bold text-orange">{money(expense)}</p></div><div><p className="text-xs text-muted">Dana tersedia</p><p className="mt-1 font-heading text-xl font-bold text-ink">{money(income - expense)}</p></div></div>{ledger.filter((item) => item.public).length ? <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wider text-muted"><tr><th className="py-3">Keterangan</th><th className="py-3">Jumlah</th><th className="py-3">Status</th></tr></thead><tbody className="divide-y divide-line">{ledger.filter((item) => item.public).map((item) => <tr key={item.id}><td className="py-4 text-ink">{item.description}</td><td className="py-4 font-semibold text-ink">{money(item.amount)}</td><td className="py-4 text-muted">{item.status === "completed" ? "Terlaksana" : "Direncanakan"}</td></tr>)}</tbody></table></div> : <div className="empty-state mt-8"><p className="font-semibold text-ink">Laporan publik belum tersedia.</p><p className="mt-1 text-sm text-muted">Pengelola akan memperbarui catatan transparansi melalui CMS.</p></div>}<div className="mt-10 border-t border-line pt-8"><h3 className="font-heading text-xl font-bold text-ink">Sudah transfer?</h3><p className="mt-2 text-sm leading-6 text-muted">Kirim bukti transfer agar admin dapat memeriksa dan memasukkannya ke laporan publik.</p><DonationSubmissionForm /></div></div></section>
    <section className="bg-[#f8fafc] py-16 md:py-20"><div className="site-container"><div className="max-w-2xl"><span className="eyebrow">{legal.eyebrow}</span><h2 className="mt-5 font-heading text-3xl font-bold text-ink md:text-4xl">{legal.title}</h2><p className="mt-4 leading-7 text-muted">{legal.description}</p></div><div className="mt-8 grid gap-4 md:grid-cols-2">{publicDocuments.map((document) => <a key={document.id} href={document.href} target="_blank" rel="noreferrer" className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-subtle transition hover:-translate-y-0.5 hover:shadow-card"><span className="rounded-xl bg-orange/10 p-3 text-orange"><FileCheck className="h-5 w-5" /></span><span><span className="block font-heading font-bold text-ink">{document.title}</span><span className="mt-1 block text-sm leading-6 text-muted">{document.description}</span><span className="mt-3 block text-sm font-bold text-orange">Buka dokumen <ArrowRight className="ml-1 inline h-4 w-4" /></span></span></a>)}</div></div></section>
  </PublicShell>;
}
