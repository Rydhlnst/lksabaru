import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main data-admin="" className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border bg-card p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border">
            <Image src="/media/logo-payf.png" alt="Logo PAYF Al-Furqon Sanden" width={48} height={48} className="size-full object-contain" />
          </span>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">Masuk ke LKSA CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola halaman, berita, jadwal, donasi, dan pengaturan website.</p>
          {params.error && <p role="alert" className="mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">Email atau password tidak valid.</p>}
          <form action={loginAction} className="mt-6 grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="username" required className="h-9 border-border bg-background shadow-xs" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" minLength={8} required className="h-9 border-border bg-background shadow-xs" />
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full">Masuk</Button>
          </form>
        </div>
        <Link href="/" className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Kembali ke website</Link>
      </div>
    </main>
  );
}
