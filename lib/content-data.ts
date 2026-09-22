import type { SiteContent } from "./content-types";

export const defaultContent: SiteContent = {
  contentVersion: 3,
  settings: {
    organizationName: "Panti Asuhan / LKSA Yatim Piatu Fakir Miskin (PAYF) Al-Furqon Sanden",
    shortName: "PAYF Al-Furqon Sanden",
    logoPrimary: "/media/logo-payf.png",
    logoSecondary: "",
    address: "27H6+W5P, Bongos Kenti, Murtigading, Kec. Sanden, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55763",
    phone: "+62 000 0000 0000",
    email: "info@payf-alfurqon-sanden.id",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=PAYF+Al-Furqon+Sanden",
    socialLinks: [
      { label: "Google Maps", href: "https://www.google.com/maps/search/?api=1&query=PAYF+Al-Furqon+Sanden" },
    ],
    footerDescription: "PAYF Al-Furqon Sanden mendampingi anak asuh melalui pengasuhan, pendidikan, pembinaan Al-Qur'an, dan kegiatan sosial yang berkelanjutan.",
    whatsappNumber: "620000000000",
    whatsappAgentName: "Pengelola PAYF Al-Furqon Sanden",
    whatsappResponseTime: "Biasanya membalas dalam beberapa jam.",
    whatsappGreeting: "Assalamu'alaikum. Ada yang bisa kami bantu terkait informasi panti, kunjungan, atau donasi?",
    whatsappMessage: "Assalamu'alaikum Wr. Wb. Saya ingin mengetahui lebih lanjut tentang Panti Asuhan / LKSA Yatim Piatu Fakir Miskin (PAYF) Al-Furqon Sanden, kegiatan anak asuh, kunjungan, atau donasi.",
  },
  home: {
    about: { eyebrow: "Tentang Kami", title: "Menjaga amanah pengasuhan dengan kasih dan pendidikan", description: "Panti Asuhan / LKSA Yatim Piatu Fakir Miskin (PAYF) Al-Furqon Sanden mendampingi anak asuh dalam lingkungan yang aman, religius, dan penuh kebersamaan.", ctaLabel: "Baca Selengkapnya" },
    video: { eyebrow: "Cerita Kemandirian", title: "Kegiatan PAYF, usaha kreatif untuk memberdayakan anak asuh", description: "Tonton video resmi PAYF Al-Furqon Sanden tentang ikhtiar kemandirian panti melalui Kegiatan PAYF.", youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    gallery: { eyebrow: "Dokumentasi", title: "Momen yang tumbuh bersama", description: "Lihat kegiatan, kebersamaan, dan proses belajar anak asuh di lingkungan LKSA.", ctaLabel: "Lihat Semua Galeri" },
    news: { eyebrow: "Kabar Terbaru", title: "Cerita dan kegiatan terbaru", description: "Ikuti kegiatan pendidikan, pembinaan Al-Qur'an, dan kebersamaan anak asuh.", ctaLabel: "Lihat Semua Berita" },
    support: { eyebrow: "Mari Bersama", title: "Menanam kebaikan untuk masa depan yang lebih cerah", description: "Dukungan Anda membantu menyediakan pendidikan, pengasuhan, dan kesempatan tumbuh bagi anak-anak asuh.", ctaLabel: "Salurkan Donasi" },
  },
  heroSlides: [
    { id: "hero-1", title: "Tumbuh bersama dalam iman, ilmu, dan kepedulian", description: "Mendampingi anak asuh melalui pengasuhan yang aman, pendidikan, dan pembinaan Al-Qur'an.", imageUrl: "/media/hero-kegiatan-pengajian.jpeg", ctaLabel: "Lihat Kegiatan", ctaHref: "/galeri", order: 1, active: true },
    { id: "hero-2", title: "Mendampingi anak asuh menuju masa depan mandiri", description: "Pendidikan formal, penguatan akhlak, dan kebersamaan menjadi bagian dari keseharian anak-anak asuh.", imageUrl: "/media/anak-asuh-sekolah.jpeg", ctaLabel: "Tentang Kami", ctaHref: "/tentang-kami", order: 2, active: true },
    { id: "hero-3", title: "Kegiatan anak asuh, keluarga, dan masyarakat", description: "Setiap dukungan membantu menghadirkan ruang tumbuh yang hangat, berdaya, dan penuh harapan.", imageUrl: "/media/kegiatan-bersama.jpeg", ctaLabel: "Salurkan Donasi", ctaHref: "/donasi", order: 3, active: true },
  ],
  homeValues: [
    { id: "value-1", title: "Pendidikan", description: "Mendukung pendidikan formal dan proses belajar anak asuh sesuai kebutuhan mereka.", icon: "book", order: 1, active: true },
    { id: "value-2", title: "Pembinaan Al-Qur'an", description: "Membangun kebiasaan mengaji, hafalan, dan pembinaan keislaman dalam keseharian.", icon: "sparkles", order: 2, active: true },
    { id: "value-3", title: "Kemandirian", description: "Menumbuhkan tanggung jawab, keterampilan, dan kepercayaan diri anak asuh.", icon: "users", order: 3, active: true },
    { id: "value-4", title: "Kekeluargaan", description: "Menciptakan lingkungan pengasuhan yang aman, hangat, dan saling menjaga.", icon: "heart", order: 4, active: true },
  ],
  pages: [
    { id: "page-news", slug: "berita", eyebrow: "Kabar Terbaru", title: "Berita & Artikel", intro: "Ikuti terus perkembangan, kegiatan, dan cerita dari kami.", body: "", sections: {}, status: "published", updatedAt: "2026-09-17" },
    { id: "page-gallery", slug: "galeri", eyebrow: "Dokumentasi", title: "Galeri Kegiatan", intro: "Momen-momen berharga dan dokumentasi aktivitas di lingkungan panti asuhan kami.", body: "", sections: {}, status: "published", updatedAt: "2026-09-17" },
    { id: "page-contact", slug: "kontak", eyebrow: "Hubungi Kami", title: "Kami siap mendengar dari Anda", intro: "Silakan hubungi kami untuk informasi lebih lanjut mengenai panti asuhan, program, atau donasi.", body: "", sections: {}, status: "published", updatedAt: "2026-09-17" },
    { id: "page-organization", slug: "struktur-organisasi", eyebrow: "Profil Panti", title: "Struktur Pengurus & Pengelola", intro: "Struktur pengelolaan Panti Asuhan / LKSA Yatim Piatu Fakir Miskin (PAYF) Al-Furqon Sanden. Nama dan jabatan dapat diperbarui melalui dashboard CMS.", body: "", sections: {
      organigram: { eyebrow: "Organigram", title: "Bersama menjalankan amanah pengasuhan", description: "Pengurus, pengasuh, pendamping pendidikan, dan relawan bekerja bersama untuk menjaga layanan anak asuh." },
    }, status: "published", updatedAt: "2026-09-17" },
    { id: "page-schedule", slug: "jadwal-kegiatan", eyebrow: "Profil Panti", title: "Jadwal Kegiatan Panti", intro: "Jadwal kegiatan harian dan mingguan yang berlaku di panti asuhan kami.", body: "", sections: {
      weekday: { eyebrow: "", title: "Hari Efektif Senin–Jumat", description: "" },
      weekend: { eyebrow: "", title: "Hari Sabtu & Ahad", description: "" },
    }, status: "published", updatedAt: "2026-09-17" },
    { id: "page-donation", slug: "donasi", eyebrow: "Dukung Program", title: "Dukung Pengasuhan dan Pendidikan Anak", intro: "Donasi Anda membantu kebutuhan pendidikan, pembinaan Al-Qur'an, kesehatan, dan pengasuhan anak-anak PAYF.", body: "", sections: {
      account: { eyebrow: "", title: "Rekening Donasi", description: "Mohon cek kembali nama rekening sebelum transfer dan konfirmasi melalui WhatsApp resmi LKSA." },
      transparency: { eyebrow: "Transparansi", title: "Transparansi dan Legalitas Donasi", description: "" },
      legal: { eyebrow: "Legalitas", title: "Dokumen pendukung donasi", description: "Dokumen resmi berikut disediakan untuk membantu calon donatur mengenal profil, legalitas, dan struktur pengelolaan LKSA." },
    }, status: "published", updatedAt: "2026-09-17" },
    { id: "page-about", slug: "tentang-kami", eyebrow: "Profil Panti", title: "Tentang Kami", intro: "Mengenal Panti Asuhan / LKSA Yatim Piatu Fakir Miskin (PAYF) Al-Furqon Sanden dan ruang tumbuh anak-anak asuh.", body: "Sejarah dan kiprah\n\nPAYF Al-Furqon Sanden merupakan lembaga pengasuhan dan pembinaan anak yang tumbuh bersama dukungan keluarga besar PAYF, masyarakat, donatur, dan relawan. Kegiatan anak asuh mencakup pendidikan, pembinaan Al-Qur'an, penguatan akhlak, serta aktivitas sosial dan kebersamaan.\n\nLokasi dan asrama\n\nDokumentasi yang dihimpun memuat PAYF Al-Furqon Sanden di Bongos Kenti, Murtigading, Kecamatan Sanden, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55763.\n\nVisi\n\nMewujudkan lingkungan pengasuhan yang aman, religius, berpendidikan, dan mendorong anak asuh menjadi pribadi yang berakhlak serta mandiri.\n\nMisi\n\nMenyelenggarakan pengasuhan yang bertanggung jawab, mendukung pendidikan anak, membiasakan pembinaan Al-Qur'an, menumbuhkan kepedulian sosial, dan membangun kolaborasi dengan masyarakat.", sections: {}, status: "published", updatedAt: "2026-09-16" },
    { id: "page-sop", slug: "sop-pengasuhan", eyebrow: "Profil Panti", title: "SOP Pengasuhan Anak", intro: "Prinsip pengasuhan yang aman, terarah, dan berpusat pada kebutuhan anak.", body: "Tujuan\n\nSOP pengasuhan menjadi acuan untuk menjaga keselamatan, kesehatan, pendidikan, ibadah, dan perkembangan anak asuh secara berkelanjutan.\n\nRuang lingkup\n\nPenerimaan anak, pemenuhan kebutuhan dasar, pendampingan sekolah, pembinaan Al-Qur'an, pengasuhan harian, kesehatan, perlindungan anak, komunikasi dengan keluarga, monitoring, dan evaluasi.\n\nPrinsip layanan\n\nSetiap anak diperlakukan dengan hormat, tanpa kekerasan, dengan menjaga privasi, martabat, dan kepentingan terbaik anak. Pengurus, pengasuh, relawan, dan tamu wajib mengikuti arahan pengelola panti selama berada di lingkungan LKSA.", sections: {}, status: "published", updatedAt: "2026-09-16" },
  ],
  organization: [
    { id: "org-1", name: "Pimpinan PAYF", role: "Pembina", parentId: null, order: 1, active: true },
    { id: "org-2", name: "Pengurus LKSA", role: "Pengelola lembaga", parentId: "org-1", order: 1, active: true },
    { id: "org-3", name: "Ketua", role: "Pengurus LKSA", parentId: "org-2", order: 1, active: true },
    { id: "org-4", name: "Sekretaris", role: "Pengurus LKSA", parentId: "org-2", order: 2, active: true },
    { id: "org-5", name: "Bendahara", role: "Pengurus LKSA", parentId: "org-2", order: 3, active: true },
    { id: "org-6", name: "Pengasuhan dan Pendidikan", role: "Pelaksana layanan anak", parentId: "org-2", order: 4, active: true },
  ],
  schedule: [
    { id: "schedule-1", group: "weekday", period: "pagi", time: "Pagi", activity: "Persiapan, ibadah, dan berangkat sekolah", location: "Asrama", coordinator: "Pengasuh", order: 1, active: true },
    { id: "schedule-2", group: "weekday", period: "siang", time: "Siang", activity: "Sekolah dan kegiatan belajar", location: "Sekolah", coordinator: "Pendamping pendidikan", order: 2, active: true },
    { id: "schedule-3", group: "weekday", period: "sore", time: "Sore", activity: "Istirahat, olahraga, dan kegiatan bersama", location: "Lingkungan panti", coordinator: "Pengasuh", order: 3, active: true },
    { id: "schedule-4", group: "weekday", period: "malam", time: "Malam", activity: "Mengaji, belajar malam, dan evaluasi harian", location: "Asrama / ruang belajar", coordinator: "Pengasuh", order: 4, active: true },
    { id: "schedule-5", group: "weekend", period: "pagi", time: "Akhir pekan", activity: "Pembinaan Al-Qur'an dan kegiatan sosial", location: "Asrama", coordinator: "Tim pengasuhan", order: 1, active: true },
    { id: "schedule-6", group: "weekend", period: "sore", time: "Akhir pekan", activity: "Kegiatan kebersamaan dan pengembangan diri", location: "Lingkungan panti", coordinator: "Pengurus / relawan", order: 2, active: true },
  ],
  articles: [
    { id: "article-1", title: "Pembinaan Al-Qur'an dalam Keseharian Anak Asuh", slug: "pembinaan-al-quran-anak-asuh", excerpt: "Kegiatan mengaji dan membaca Al-Qur'an menjadi bagian dari rutinitas pembinaan anak asuh.", coverUrl: "/media/hero-kegiatan-pengajian.jpeg", body: "Kegiatan pembinaan Al-Qur'an menjadi bagian penting dalam keseharian anak asuh Panti Asuhan / LKSA Yatim Piatu Fakir Miskin (PAYF) Al-Furqon Sanden. Anak-anak belajar bersama dalam suasana yang dekat, saling mendukung, dan didampingi oleh pengasuh serta pembina.", publishDate: "2026-09-16", status: "published", featured: true, updatedAt: "2026-09-16" },
    { id: "article-2", title: "Belajar, Bermain, dan Bertumbuh Bersama", slug: "belajar-bermain-dan-bertumbuh-bersama", excerpt: "Kegiatan bersama membangun rasa percaya diri, persaudaraan, dan kepedulian anak asuh.", coverUrl: "/media/kegiatan-bersama.jpeg", body: "Lingkungan panti menjadi ruang bagi anak-anak untuk belajar, berinteraksi, mengikuti kegiatan sosial, dan mengembangkan minat. Setiap momen kebersamaan adalah bagian dari proses tumbuh yang ingin kami jaga bersama.", publishDate: "2026-09-16", status: "published", featured: false, updatedAt: "2026-09-16" },
  ],
  galleries: [
    { id: "gallery-1", url: "/media/hero-kegiatan-pengajian.jpeg", alt: "Anak-anak mengikuti kegiatan pembinaan bersama", caption: "Kegiatan pembinaan bersama anak asuh.", order: 1, visible: true },
    { id: "gallery-2", url: "/media/anak-asuh-sekolah.jpeg", alt: "Anak-anak asuh mengenakan seragam sekolah", caption: "Anak asuh bersiap mengikuti pendidikan formal.", order: 2, visible: true },
    { id: "gallery-3", url: "/media/kelas-mengaji-1.jpeg", alt: "Anak-anak membaca Al-Qur'an bersama di ruangan panti", caption: "Pembinaan Al-Qur'an.", order: 3, visible: true },
    { id: "gallery-4", url: "/media/kelas-mengaji-2.jpeg", alt: "Anak-anak dan pendamping mengikuti kelas mengaji", caption: "Belajar membaca Al-Qur'an bersama.", order: 4, visible: true },
    { id: "gallery-5", url: "/media/kegiatan-bersama.jpeg", alt: "Anak-anak dan relawan berfoto bersama", caption: "Kebersamaan anak asuh, keluarga, dan relawan.", order: 5, visible: true },
    { id: "gallery-6", url: "/media/kegiatan-hut-kemerdekaan.jpeg", alt: "Anak-anak mengikuti kegiatan peringatan kemerdekaan", caption: "Kegiatan sosial dan kebersamaan masyarakat.", order: 6, visible: true },
    { id: "gallery-7", url: "/media/asrama-putri.jpeg", alt: "Gedung dan halaman PAYF", caption: "Lingkungan PAYF Al-Furqon Sanden.", order: 7, visible: true },
    { id: "gallery-8", url: "/media/asrama-putra.jpeg", alt: "Anak-anak mengikuti kegiatan olahraga", caption: "Olahraga dan pengembangan diri.", order: 8, visible: true },
    { id: "gallery-9", url: "/media/anak-asuh-putra.jpeg", alt: "Anak-anak putra berfoto bersama di ruang kegiatan", caption: "Kegiatan anak asuh putra.", order: 9, visible: true },
    { id: "gallery-10", url: "/media/anak-asuh-sekolah-dasar.jpeg", alt: "Anak-anak mengenakan seragam sekolah dasar", caption: "Anak asuh dalam kegiatan pendidikan.", order: 10, visible: true },
    { id: "gallery-11", url: "/media/kunjungan-donatur.jpeg", alt: "Kunjungan keluarga dan relawan ke lingkungan panti", caption: "Kunjungan dan silaturahmi.", order: 11, visible: true },
    { id: "gallery-12", url: "/media/halaqah-putri.jpeg", alt: "Anak-anak putri mengikuti halaqah", caption: "Halaqah dan pembinaan putri.", order: 12, visible: true },
    { id: "gallery-13", url: "/media/halaqah-putri-2.jpeg", alt: "Anak-anak putri membaca Al-Qur'an bersama", caption: "Kegiatan mengaji putri.", order: 13, visible: true },
  ],
  documents: [
    { id: "doc-profil", title: "Profil PAYF Al-Furqon Sanden", description: "Dokumen profil PAYF Al-Furqon Sanden.", href: "/documents/profil-payf-al-furqon-sanden.pdf", category: "profil", published: true },
  ],
  donation: { heading: "Dukung Pengasuhan dan Pendidikan Anak", description: "Donasi Anda membantu kebutuhan pendidikan, pembinaan Al-Qur'an, kesehatan, dan pengasuhan anak-anak PAYF.", bankName: "Konfirmasi kepada pengelola PAYF", accountNumber: "Hubungi pengelola PAYF", accountHolder: "PAYF Al-Furqon Sanden", qrisUrl: "", confirmationMessage: "Assalamu'alaikum, saya sudah melakukan donasi untuk Panti Asuhan / LKSA Yatim Piatu Fakir Miskin (PAYF) Al-Furqon Sanden dan ingin melakukan konfirmasi.", confirmationWhatsapp: "620000000000", transparencyHeading: "Transparansi dan Legalitas Donasi" },
  ledger: [],
  donors: [],
};






