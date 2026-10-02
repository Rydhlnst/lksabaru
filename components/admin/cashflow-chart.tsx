"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// Pasangan warna lolos validasi buta warna (biru ↔ oranye); identitas juga dibawa legenda dan tooltip.
const config = {
  income: { label: "Pemasukan", color: "#1d4ed8" },
  expense: { label: "Pengeluaran", color: "#ea580c" },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

export function CashflowChart({ data }: { data: { month: string; income: number; expense: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart accessibilityLayer data={data} barGap={2} barCategoryGap="28%">
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(value: number) => compact.format(value)} />
        <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="dot" formatter={(value, name) => <span className="flex w-full items-center justify-between gap-4"><span className="flex items-center gap-1.5 text-muted-foreground"><span className="size-2 rounded-full" style={{ background: config[name as keyof typeof config]?.color }} />{config[name as keyof typeof config]?.label}</span><span className="font-medium tabular-nums text-foreground">Rp {Number(value).toLocaleString("id-ID")}</span></span>} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={18} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ChartContainer>
  );
}
