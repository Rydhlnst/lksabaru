"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, CalendarDays, ExternalLink, FolderOpen, GalleryVerticalEnd, HeartHandshake, Home, LayoutDashboard, LogOut, Newspaper, Search, Settings, Users, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type NavItem = { href: string; label: string; icon: LucideIcon; keywords?: string };

const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "Dashboard", items: [{ href: "/admin", label: "Ringkasan", icon: LayoutDashboard }] },
  { label: "Konten", items: [
    { href: "/admin/home", label: "Beranda", icon: Home, keywords: "hero slide carousel video" },
    { href: "/admin/pages", label: "Halaman", icon: BookOpen, keywords: "profil sop tentang" },
    { href: "/admin/news", label: "Berita", icon: Newspaper, keywords: "artikel kabar" },
    { href: "/admin/gallery", label: "Galeri", icon: GalleryVerticalEnd, keywords: "foto" },
    { href: "/admin/media", label: "Media Library", icon: FolderOpen, keywords: "upload aset gambar" },
  ] },
  { label: "Lembaga", items: [
    { href: "/admin/organization", label: "Pengurus", icon: Users, keywords: "struktur organigram" },
    { href: "/admin/schedule", label: "Jadwal Kegiatan", icon: CalendarDays },
  ] },
  { label: "Donasi", items: [{ href: "/admin/donation", label: "Donasi & Transparansi", icon: HeartHandshake, keywords: "ledger rekening qris dokumen" }] },
  { label: "Sistem", items: [{ href: "/admin/settings", label: "Pengaturan", icon: Settings, keywords: "kontak whatsapp logo sosial" }] },
];

const isActive = (pathname: string, href: string) => href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

function AdminSidebar({ pendingDonations }: { pendingDonations: number }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2.5 rounded-lg p-1.5 group-data-[collapsible=icon]:p-0">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border">
            <Image src="/media/logo-payf.png" alt="" width={32} height={32} className="size-full object-contain" />
          </span>
          <span className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">LKSA CMS</span>
            <span className="text-xs text-muted-foreground">PAYF Al-Furqon Sanden</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-medium tracking-wider uppercase">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild tooltip={label} isActive={isActive(pathname, href)} className="data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground">
                      <Link href={href} onClick={() => setOpenMobile(false)}><Icon /><span>{label}</span></Link>
                    </SidebarMenuButton>
                    {href === "/admin/donation" && pendingDonations > 0 && <SidebarMenuBadge className="rounded-full bg-orange px-1.5 text-white peer-hover/menu-button:text-white peer-data-active/menu-button:text-white">{pendingDonations}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl bg-sidebar-accent p-4 text-center">
          <p className="text-sm font-semibold">Website publik</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Lihat hasil yang dibaca pengunjung.</p>
          <Button asChild className="mt-3 w-full"><Link href="/" target="_blank">Buka website<ExternalLink /></Link></Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); setOpen((current) => !current); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-muted">
        <Search className="size-4" />
        <span className="flex-1 text-left">Cari menu...</span>
        <kbd className="hidden rounded border bg-muted px-1.5 text-[10px] font-medium sm:inline">Ctrl K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Cari menu" description="Lompat ke modul dashboard.">
        <CommandInput placeholder="Ketik nama modul..." />
        <CommandList>
          <CommandEmpty>Menu tidak ditemukan.</CommandEmpty>
          {navGroups.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map(({ href, label, icon: Icon, keywords }) => (
                <CommandItem key={href} value={`${label} ${keywords ?? ""}`} onSelect={() => { setOpen(false); router.push(href); }}><Icon />{label}</CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function Topbar({ email, pendingDonations }: { email: string; pendingDonations: number }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:rounded-t-xl">
      <SidebarTrigger />
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <CommandMenu />
      <div className="ml-auto flex items-center gap-1">
        <Button asChild variant="ghost" size="icon-lg" aria-label="Buka website publik"><Link href="/" target="_blank"><ExternalLink /></Link></Button>
        <Button asChild variant="ghost" size="icon-lg" className="relative" aria-label={pendingDonations ? `${pendingDonations} donasi menunggu verifikasi` : "Tidak ada donasi menunggu"}>
          <Link href="/admin/donation"><Bell />{pendingDonations > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-orange ring-2 ring-background" />}</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="ml-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40" aria-label="Menu akun">
              <Avatar><AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{email.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="grid gap-0.5"><span className="text-sm font-medium text-foreground">Administrator</span><span className="truncate text-xs font-normal text-muted-foreground">{email}</span></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/admin/settings"><Settings />Pengaturan</Link></DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => { void logoutAction(); }}><LogOut />Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AdminShell({ email, pendingDonations, children }: { email: string; pendingDonations: number; children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider data-admin="">
        <AdminSidebar pendingDonations={pendingDonations} />
        <SidebarInset className="min-w-0 border md:shadow-none">
          <Topbar email={email} pendingDonations={pendingDonations} />
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
          <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} PAYF Al-Furqon Sanden · LKSA CMS</footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
