import { updateSettingsAction } from "@/app/admin/actions";
import { AdminForm, ImageField, SocialLinksField, SubmitButton, TextField, TextareaField } from "@/components/admin/form";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";

export default async function SettingsAdminPage() {
  await requireAdmin();
  const { settings } = await getSiteContent();

  return (
    <>
      <PageHeader title="Pengaturan website" description="Identitas lembaga, kontak publik, tautan sosial, dan widget WhatsApp di seluruh halaman." />
      <AdminForm action={updateSettingsAction} className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Identitas" description="Nama dan logo yang tampil di header serta footer">
            <div className="grid gap-4">
              <TextField name="organizationName" label="Nama organisasi" defaultValue={settings.organizationName} required minLength={2} maxLength={120} />
              <TextField name="shortName" label="Nama pendek" defaultValue={settings.shortName} required minLength={2} maxLength={80} />
              <ImageField name="logoPrimary" label="Logo utama" defaultValue={settings.logoPrimary} required />
              <ImageField name="logoSecondary" label="Logo sekunder" defaultValue={settings.logoSecondary} hint="Opsional. Kosongkan bila tidak dipakai." />
              <TextareaField name="footerDescription" label="Deskripsi footer" defaultValue={settings.footerDescription} rows={3} required maxLength={3000} hint="Juga dipakai sebagai deskripsi saat website dibagikan." />
            </div>
          </Panel>
          <Panel title="Kontak" description="Tampil di halaman kontak dan footer">
            <div className="grid gap-4">
              <TextareaField name="address" label="Alamat" defaultValue={settings.address} rows={3} required minLength={5} maxLength={300} />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name="phone" label="Telepon" defaultValue={settings.phone} required minLength={6} maxLength={30} />
                <TextField name="email" label="Email" type="email" defaultValue={settings.email} required />
              </div>
              <TextField name="mapUrl" label="URL Google Maps" type="url" defaultValue={settings.mapUrl} required />
            </div>
          </Panel>
          <Panel title="Widget WhatsApp" description="Tombol chat mengambang di semua halaman publik">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name="whatsappNumber" label="Nomor WhatsApp" defaultValue={settings.whatsappNumber} required inputMode="numeric" hint="Format internasional tanpa +, contoh 628123456789." />
                <TextField name="whatsappAgentName" label="Nama admin" defaultValue={settings.whatsappAgentName} required minLength={2} maxLength={80} />
              </div>
              <TextField name="whatsappResponseTime" label="Keterangan respons" defaultValue={settings.whatsappResponseTime} required minLength={2} maxLength={120} />
              <TextareaField name="whatsappGreeting" label="Pesan pembuka" defaultValue={settings.whatsappGreeting} rows={3} required minLength={2} maxLength={300} />
              <TextareaField name="whatsappMessage" label="Pesan otomatis pengunjung" defaultValue={settings.whatsappMessage} rows={3} required minLength={2} maxLength={500} hint="Teks yang sudah terisi saat pengunjung membuka WhatsApp." />
            </div>
          </Panel>
          <Panel title="Tautan sosial" description="Tampil di footer website, maksimal 20 tautan">
            <SocialLinksField defaultValue={settings.socialLinks} />
          </Panel>
        </div>
        <div className="sticky bottom-4 z-10 flex justify-end">
          <SubmitButton className="shadow-lg">Simpan pengaturan</SubmitButton>
        </div>
      </AdminForm>
    </>
  );
}
