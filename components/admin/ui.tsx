import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublishStatus } from "@/lib/content-types";
import { cn } from "@/lib/utils";

export const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00`) : value;
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function PageHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1 basis-72">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Kartu putih ber-border tipis ala referensi dashboard; `flush` untuk isi tabel yang menempel ke tepi. */
export function Panel({ title, description, action, flush, className, children }: { title?: ReactNode; description?: ReactNode; action?: ReactNode; flush?: boolean; className?: string; children: ReactNode }) {
  return (
    <Card className={cn("shadow-none ring-border", className)}>
      {(title || action) && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent className={cn(flush && "px-0")}>{children}</CardContent>
    </Card>
  );
}

const tones = {
  success: "bg-green/10 text-green",
  warning: "bg-orange/10 text-[#c2410c]",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
} as const;

export function Tone({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return <Badge variant="ghost" className={cn("rounded-full font-medium", tones[tone])}>{children}</Badge>;
}

const publishLabels: Record<PublishStatus, [keyof typeof tones, string]> = { published: ["success", "Tayang"], draft: ["warning", "Draft"], archived: ["neutral", "Arsip"] };

export function PublishBadge({ status }: { status: PublishStatus }) {
  const [tone, label] = publishLabels[status] ?? publishLabels.draft;
  return <Tone tone={tone}>{label}</Tone>;
}

export function ActiveBadge({ active, on = "Aktif", off = "Nonaktif" }: { active: boolean; on?: string; off?: string }) {
  return <Tone tone={active ? "success" : "neutral"}>{active ? on : off}</Tone>;
}

export function EmptyRow({ colSpan, title, description }: { colSpan: number; title: string; description: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </td>
    </tr>
  );
}

export const publishOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Tayang" },
  { value: "archived", label: "Arsip" },
] as const;

/** Tabel dengan padding yang selaras dengan tepi Panel `flush`. */
export const dataTable = "[&_td]:px-3 [&_td]:py-3 [&_th]:h-10 [&_th]:px-3 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground [&_td:first-child]:pl-5 [&_th:first-child]:pl-5 [&_td:last-child]:pr-5 [&_th:last-child]:pr-5 [&_thead_tr]:border-y [&_thead_tr]:bg-muted/40 [&_tbody_tr:last-child]:border-0";
