import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/content-types";
import { BrandMark } from "./brand-mark";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return <footer className="bg-navy text-white">
    <div className="site-container grid gap-12 py-16 md:grid-cols-[1.4fr_0.8fr_1fr]">
      <div><BrandMark settings={settings} /><p className="mt-6 max-w-md text-sm leading-7 text-white/65">{settings.footerDescription}</p><div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">{settings.socialLinks.map((social) => <a key={social.href} href={social.href} target="_blank" rel="noreferrer" className="transition hover:text-orange">{social.label}</a>)}</div></div>
      <div><p className="footer-title">Tautan Cepat</p><div className="grid gap-3 text-sm text-white/70"><Link href="/tentang-kami" className="hover:text-white">Tentang Kami</Link><Link href="/struktur-organisasi" className="hover:text-white">Struktur Pengurus</Link><Link href="/sop-pengasuhan" className="hover:text-white">SOP Pengasuhan</Link><Link href="/profil/jadwal-kegiatan" className="hover:text-white">Jadwal Kegiatan</Link><Link href="/berita" className="hover:text-white">Berita & Artikel</Link><Link href="/galeri" className="hover:text-white">Galeri Kegiatan</Link><Link href="/donasi" className="hover:text-white">Informasi Donasi</Link></div></div>
      <div><p className="footer-title">Hubungi Kami</p><div className="grid gap-4 text-sm leading-6 text-white/70"><a className="flex gap-3 hover:text-white" href={settings.mapUrl}><MapPin className="mt-1 h-4 w-4 shrink-0 text-orange" />{settings.address}</a><a className="flex gap-3 hover:text-white" href={`tel:${settings.phone}`}><Phone className="mt-1 h-4 w-4 shrink-0 text-orange" />{settings.phone}</a><a className="flex gap-3 hover:text-white" href={`mailto:${settings.email}`}><Mail className="mt-1 h-4 w-4 shrink-0 text-orange" />{settings.email}</a></div></div>
    </div>
    <div className="border-t border-white/10"><div className="site-container flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} {settings.organizationName}. Hak Cipta Dilindungi.</span><span>PAYF Al-Furqon Sanden</span></div></div>
  </footer>;
}

