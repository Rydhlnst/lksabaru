"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminForm, SubmitButton, type AdminAction } from "@/components/admin/form";

type EntitySheetProps = {
  trigger: ReactNode;
  title: string;
  description?: string;
  action: AdminAction;
  submitLabel?: string;
  defaultOpen?: boolean;
  /** Alamat tujuan saat panel ditutup; dipakai untuk membuang query yang membuka panel ini secara otomatis. */
  closeHref?: string;
  children: ReactNode;
};

/** Panel samping untuk membuat atau mengubah satu data. Isinya di-mount ulang setiap dibuka, jadi selalu berangkat dari nilai tersimpan. */
export function EntitySheet({ trigger, title, description, action, submitLabel = "Simpan", defaultOpen = false, closeHref, children }: EntitySheetProps) {
  const router = useRouter();
  const [open, setOpenState] = useState(defaultOpen);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next && closeHref) router.replace(closeHref, { scroll: false });
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <AdminForm action={action} onSuccess={() => setOpen(false)} className="flex min-h-0 flex-1 flex-col">
          <div className="grid flex-1 content-start gap-4 overflow-y-auto p-6">{children}</div>
          <SheetFooter className="flex-row justify-end border-t py-4">
            <SheetClose asChild><Button type="button" variant="outline" size="lg">Batal</Button></SheetClose>
            <SubmitButton>{submitLabel}</SubmitButton>
          </SheetFooter>
        </AdminForm>
      </SheetContent>
    </Sheet>
  );
}

export function DeleteButton({ id, action, title, description }: { id: string; action: AdminAction; title: string; description: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      let result;
      try {
        result = await action(formData);
      } catch {
        result = { ok: false, message: "Permintaan gagal dikirim. Periksa koneksi, lalu coba lagi." };
      }
      if (!result) return;
      if (result.ok) toast.success(result.message); else toast.error(result.message);
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={title} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={(event) => { event.preventDefault(); confirm(); }}>
            {pending && <Loader2 className="animate-spin" />}Ya, hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
