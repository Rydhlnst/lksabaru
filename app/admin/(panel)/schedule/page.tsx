import { Pencil, Plus } from "lucide-react";
import { deleteScheduleAction, saveScheduleAction } from "@/app/admin/actions";
import { DeleteButton, EntitySheet } from "@/components/admin/entity-dialogs";
import { SelectField, SwitchField, TextField } from "@/components/admin/form";
import { ActiveBadge, dataTable, EmptyRow, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { ScheduleEntry } from "@/lib/content-types";

const groups = [{ value: "weekday", label: "Hari efektif (Senin–Jumat)" }, { value: "weekend", label: "Akhir pekan (Sabtu & Ahad)" }] as const;
const periods = [{ value: "pagi", label: "Pagi" }, { value: "siang", label: "Siang" }, { value: "sore", label: "Sore" }, { value: "malam", label: "Malam" }] as const;
const periodRank: Record<string, number> = Object.fromEntries(periods.map((period, index) => [period.value, index]));

function ScheduleFields({ entry, group, nextOrder }: { entry?: ScheduleEntry; group: ScheduleEntry["group"]; nextOrder: number }) {
  return (
    <>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="group" label="Kelompok hari" defaultValue={entry?.group ?? group} options={groups} />
        <SelectField name="period" label="Periode" defaultValue={entry?.period ?? "pagi"} options={periods} />
      </div>
      <TextField name="time" label="Waktu" defaultValue={entry?.time} required maxLength={120} placeholder="04.00 – 05.30" />
      <TextField name="activity" label="Kegiatan" defaultValue={entry?.activity} required maxLength={500} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="location" label="Tempat" defaultValue={entry?.location} maxLength={200} hint="Opsional." />
        <TextField name="coordinator" label="Koordinator" defaultValue={entry?.coordinator} maxLength={160} hint="Opsional." />
      </div>
      <TextField name="order" label="Urutan tampil" type="number" min={1} max={9999} defaultValue={entry?.order ?? nextOrder} required hint="Angka kecil tampil lebih dulu." />
      <SwitchField name="active" label="Tampilkan di website" defaultChecked={entry?.active ?? true} />
    </>
  );
}

export default async function ScheduleAdminPage() {
  await requireAdmin();
  const { schedule } = await getSiteContent();
  const nextOrder = (group: ScheduleEntry["group"]) => Math.max(0, ...schedule.filter((entry) => entry.group === group).map((entry) => entry.order)) + 1;

  return (
    <>
      <PageHeader title="Jadwal kegiatan" description="Kelola jadwal harian anak asuh untuk hari efektif dan akhir pekan." />
      {groups.map((group) => {
        const entries = schedule.filter((entry) => entry.group === group.value).sort((a, b) => a.order - b.order || periodRank[a.period] - periodRank[b.period]);
        return (
          <Panel key={group.value} flush title={group.label} description={`${entries.filter((entry) => entry.active).length} kegiatan tampil · ${entries.length} total`} action={
            <EntitySheet action={saveScheduleAction} title="Tambah kegiatan" description={group.label} submitLabel="Tambah kegiatan" trigger={<Button variant="outline"><Plus />Tambah kegiatan</Button>}>
              <ScheduleFields group={group.value} nextOrder={nextOrder(group.value)} />
            </EntitySheet>
          }>
            <Table className={dataTable}>
              <TableHeader><TableRow><TableHead>Waktu</TableHead><TableHead>Kegiatan</TableHead><TableHead>Tempat</TableHead><TableHead>Koordinator</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell><p className="font-medium">{entry.time}</p><p className="text-xs capitalize text-muted-foreground">{entry.period}</p></TableCell>
                    <TableCell className="max-w-sm whitespace-normal">{entry.activity}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.location || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.coordinator || "—"}</TableCell>
                    <TableCell><ActiveBadge active={entry.active} on="Tampil" off="Disembunyikan" /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <EntitySheet action={saveScheduleAction} title="Ubah kegiatan" description={entry.activity} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${entry.activity}`}><Pencil /></Button>}>
                          <ScheduleFields entry={entry} group={entry.group} nextOrder={entry.order} />
                        </EntitySheet>
                        <DeleteButton id={entry.id} action={deleteScheduleAction} title="Hapus kegiatan?" description={<>Kegiatan <b>{entry.activity}</b> akan dihapus dari jadwal.</>} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!entries.length && <EmptyRow colSpan={6} title="Belum ada kegiatan" description="Tambahkan kegiatan untuk kelompok hari ini." />}
              </TableBody>
            </Table>
          </Panel>
        );
      })}
    </>
  );
}
