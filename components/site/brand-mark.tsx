import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = { settings: { organizationName: string; shortName: string; logoPrimary: string; logoSecondary: string } };

export function BrandMark({ settings }: BrandMarkProps) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${settings.organizationName} home`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm"><Image src={settings.logoPrimary || "/media/logo-payf.png"} alt={`Logo ${settings.shortName}`} width={44} height={44} className="h-full w-full object-contain" priority /></span>
      <span className="min-w-0 lg:block">
        <span className="block max-w-[220px] truncate font-heading text-base font-bold leading-tight text-brand-yellow sm:max-w-[280px]">{settings.organizationName}</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-yellow/70">Panti Asuhan & LKSA</span>
      </span>
      {settings.logoSecondary ? <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1"><Image src={settings.logoSecondary} alt="Logo organisasi" width={44} height={44} className="h-full w-full object-contain" /></span> : null}
    </Link>
  );
}


