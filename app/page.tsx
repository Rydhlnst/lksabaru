import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, Heart, Sparkles, Users } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { getGalleryPreview } from "@/lib/gallery-presentation";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { PublicShell } from "@/components/site/public-shell";
import { SectionHeading } from "@/components/site/section-heading";

const icons = { heart: Heart, book: BookOpen, sparkles: Sparkles, users: Users };

function isYouTubeUrl(value: string) {
  try {
    return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"].includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

export default async function Home() {
  const content = await getSiteContent();
  const latest = content.articles.filter((article) => article.status === "published").sort((a, b) => b.publishDate.localeCompare(a.publishDate)).slice(0, 3);
  const gallery = getGalleryPreview(content.galleries);

  return (
    <PublicShell content={content}>
      <HeroCarousel slides={content.heroSlides} />
      <section className="site-container grid gap-12 py-20 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:py-28">
        <div>
          <SectionHeading eyebrow={content.home.about.eyebrow} title={content.home.about.title} description={content.home.about.description} />
          <Link href="/tentang-kami" className="mt-7 inline-flex items-center gap-2 font-bold text-orange hover:gap-3">{content.home.about.ctaLabel} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {content.homeValues.filter((value) => value.active).map((value) => {
            const Icon = icons[value.icon];
            return <article key={value.id} className="rounded-2xl border border-line bg-white p-6 shadow-subtle transition hover:-translate-y-1 hover:shadow-card"><span className="mb-5 inline-flex rounded-xl bg-orange/10 p-3 text-orange"><Icon className="h-5 w-5" /></span><h3 className="font-heading text-lg font-bold text-ink">{value.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{value.description}</p></article>;
          })}
        </div>
      </section>
      <section className="bg-[#f8fafc] py-20 lg:py-24">
        <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <SectionHeading eyebrow={content.home.video.eyebrow} title={content.home.video.title} description={content.home.video.description} />
          <div className="aspect-video overflow-hidden rounded-3xl border border-line bg-navy shadow-card">
            {isYouTubeUrl(content.home.video.youtubeUrl) ? <iframe className="h-full w-full" src={content.home.video.youtubeUrl} title={content.home.video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <a href={content.home.video.youtubeUrl} target="_blank" rel="noreferrer" className="flex h-full flex-col items-center justify-center gap-4 bg-[#1877f2] p-8 text-center text-white transition hover:bg-[#166fe5]"><span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Video Facebook</span><span className="max-w-sm font-heading text-2xl font-bold">Buka video kegiatan PAYF Al-Furqon Sanden</span><span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#1877f2]">Tonton video <ExternalLink className="h-4 w-4" /></span></a>}
          </div>
        </div>
      </section>
      <section id="galeri" className="site-container py-20 lg:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={content.home.gallery.eyebrow} title={content.home.gallery.title} description={content.home.gallery.description} />
          <Link href="/galeri" className="inline-flex shrink-0 items-center gap-2 font-bold text-orange">{content.home.gallery.ctaLabel} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {gallery.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image) => (
              <Link key={image.id} href="/galeri" className="group overflow-hidden rounded-2xl border border-line bg-white shadow-subtle transition hover:-translate-y-1 hover:shadow-card">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f8fafc]">
                  <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <p className="p-4 text-sm font-semibold leading-6 text-ink group-hover:text-orange">{image.caption || image.alt}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state mt-10">
            <p className="font-semibold text-ink">Galeri sedang disiapkan.</p>
            <p className="mt-1 text-sm text-muted">Dokumentasi terbaru akan tampil di sini.</p>
          </div>
        )}
      </section>
      <section className="site-container py-20 lg:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={content.home.news.eyebrow} title={content.home.news.title} description={content.home.news.description} />
          <Link href="/berita" className="inline-flex shrink-0 items-center gap-2 font-bold text-orange">{content.home.news.ctaLabel} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {latest.map((article) => <article key={article.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-subtle"><div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${article.coverUrl})` }} /><div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-orange">{article.publishDate}</p><h3 className="mt-3 font-heading text-xl font-bold leading-snug text-ink">{article.title}</h3><p className="mt-3 text-sm leading-6 text-muted">{article.excerpt}</p><Link href={`/berita/${article.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-orange">Baca Artikel <ArrowRight className="h-4 w-4" /></Link></div></article>)}
        </div>
      </section>
      <section className="site-container flex flex-col gap-8 py-20 md:flex-row md:items-center md:justify-between">
        <SectionHeading eyebrow={content.home.support.eyebrow} title={content.home.support.title} description={content.home.support.description} />
        <Link href="/donasi" className="button-primary shrink-0">{content.home.support.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </section>
    </PublicShell>
  );
}
