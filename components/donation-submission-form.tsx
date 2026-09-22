"use client";

import { CheckCircle2, Upload } from "lucide-react";
import { useState } from "react";

export function DonationSubmissionForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const response = await fetch("/api/donations", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Pengiriman donasi gagal.");
      event.currentTarget.reset();
      setSuccess(true);
      setMessage("Bukti donasi sudah terkirim. Admin akan memverifikasi transfer Anda.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pengiriman donasi gagal. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-line bg-[#f8fafc] p-5 md:p-6">
    <div className="grid gap-5 md:grid-cols-2">
      <label className="text-sm font-semibold text-ink">Nama donatur<input className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm" name="donorName" required maxLength={160} /></label>
      <label className="text-sm font-semibold text-ink">Nomor WhatsApp <span className="font-normal text-muted">(opsional)</span><input className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm" name="donorPhone" type="tel" maxLength={30} /></label>
      <label className="text-sm font-semibold text-ink">Nominal transfer<input className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm" name="amount" type="number" min="1000" required /></label>
      <label className="text-sm font-semibold text-ink">Tanggal transfer<input className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm" name="transferDate" type="date" required /></label>
    </div>
    <label className="block text-sm font-semibold text-ink">Bukti transfer<input className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange/10 file:px-3 file:py-2 file:font-semibold file:text-orange" name="proof" type="file" accept="image/jpeg,image/png,image/webp" required /><span className="mt-2 block text-xs font-normal text-muted">JPG, PNG, atau WebP. Maksimal 5 MB.</span></label>
    <label className="block text-sm font-semibold text-ink">Catatan <span className="font-normal text-muted">(opsional)</span><textarea className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm" name="note" rows={3} maxLength={500} /></label>
    {message && <p className={`flex items-start gap-2 text-sm ${success ? "text-green" : "text-red-600"}`} role={success ? "status" : "alert"}>{success && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}{message}</p>}
    <button className="button-primary" disabled={busy} type="submit"><Upload className="mr-2 h-4 w-4" />{busy ? "Mengirim..." : "Kirim bukti donasi"}</button>
  </form>;
}
