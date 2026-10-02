import { Pencil, Plus } from "lucide-react";
import { deleteOrganizationAction, saveOrganizationAction } from "@/app/admin/actions";
import { DeleteButton, EntitySheet } from "@/components/admin/entity-dialogs";
import { SelectField, SwitchField, TextField } from "@/components/admin/form";
import { ActiveBadge, dataTable, EmptyRow, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import type { OrganizationNode } from "@/lib/content-types";

/** Urutkan sebagai pohon (induk diikuti bawahannya) dan sertakan kedalaman untuk indentasi. */
function flattenTree(nodes: OrganizationNode[]) {
  const ids = new Set(nodes.map((node) => node.id));
  const seen = new Set<string>();
  const result: { node: OrganizationNode; depth: number }[] = [];
  const visit = (parentId: string | null, depth: number) => {
    for (const node of nodes.filter((item) => (item.parentId && ids.has(item.parentId) ? item.parentId : null) === parentId).sort((a, b) => a.order - b.order)) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      result.push({ node, depth });
      visit(node.id, depth + 1);
    }
  };
  visit(null, 0);
  for (const node of nodes) if (!seen.has(node.id)) result.push({ node, depth: 0 });
  return result;
}

function descendantsOf(nodes: OrganizationNode[], id: string) {
  const found = new Set([id]);
  for (let changed = true; changed;) {
    changed = false;
    for (const node of nodes) if (node.parentId && found.has(node.parentId) && !found.has(node.id)) { found.add(node.id); changed = true; }
  }
  return found;
}

function MemberFields({ node, nodes, nextOrder }: { node?: OrganizationNode; nodes: OrganizationNode[]; nextOrder: number }) {
  const excluded = node ? descendantsOf(nodes, node.id) : new Set<string>();
  const parents = [{ value: "", label: "— Tanpa atasan (puncak struktur) —" }, ...nodes.filter((item) => !excluded.has(item.id)).map((item) => ({ value: item.id, label: `${item.name} · ${item.role}` }))];
  return (
    <>
      {node && <input type="hidden" name="id" value={node.id} />}
      <TextField name="name" label="Nama" defaultValue={node?.name} required maxLength={160} />
      <TextField name="role" label="Jabatan" defaultValue={node?.role} required maxLength={160} />
      <SelectField name="parentId" label="Atasan langsung" defaultValue={node?.parentId ?? ""} options={parents} hint="Menentukan posisi dalam organigram." />
      <TextField name="order" label="Urutan tampil" type="number" min={1} max={9999} defaultValue={node?.order ?? nextOrder} required hint="Angka kecil tampil lebih dulu." />
      <SwitchField name="active" label="Tampilkan di website" defaultChecked={node?.active ?? true} />
    </>
  );
}

export default async function OrganizationAdminPage() {
  await requireAdmin();
  const { organization } = await getSiteContent();
  const byId = new Map(organization.map((node) => [node.id, node]));
  const nextOrder = Math.max(0, ...organization.map((node) => node.order)) + 1;

  return (
    <>
      <PageHeader title="Struktur pengurus" description="Atur nama, jabatan, dan posisi pengurus pada organigram publik.">
        <EntitySheet action={saveOrganizationAction} title="Tambah pengurus" submitLabel="Tambah pengurus" trigger={<Button size="lg"><Plus />Tambah pengurus</Button>}>
          <MemberFields nodes={organization} nextOrder={nextOrder} />
        </EntitySheet>
      </PageHeader>
      <Panel flush title="Daftar pengurus" description={`${organization.filter((node) => node.active).length} tampil · ${organization.length} total`}>
        <Table className={dataTable}>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Jabatan</TableHead><TableHead>Atasan</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {flattenTree(organization).map(({ node, depth }) => (
              <TableRow key={node.id}>
                <TableCell><span className="flex items-center font-medium" style={{ paddingLeft: depth * 20 }}>{depth > 0 && <span className="mr-2 text-muted-foreground" aria-hidden="true">└</span>}{node.name}</span></TableCell>
                <TableCell className="text-muted-foreground">{node.role}</TableCell>
                <TableCell className="text-muted-foreground">{node.parentId ? byId.get(node.parentId)?.name ?? "Tidak ditemukan" : "—"}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{node.order}</TableCell>
                <TableCell><ActiveBadge active={node.active} on="Tampil" off="Disembunyikan" /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <EntitySheet action={saveOrganizationAction} title="Ubah pengurus" description={node.name} submitLabel="Simpan perubahan" trigger={<Button variant="ghost" size="icon" aria-label={`Ubah ${node.name}`}><Pencil /></Button>}>
                      <MemberFields node={node} nodes={organization} nextOrder={nextOrder} />
                    </EntitySheet>
                    <DeleteButton id={node.id} action={deleteOrganizationAction} title="Hapus pengurus?" description={<><b>{node.name}</b> ({node.role}) akan dihapus dari struktur organisasi.</>} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!organization.length && <EmptyRow colSpan={6} title="Belum ada pengurus" description="Tambahkan pengurus pertama untuk membentuk organigram." />}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
}
