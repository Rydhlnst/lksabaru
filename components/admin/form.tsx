"use client";

import Image from "next/image";
import { ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { createContext, useContext, useId, useRef, useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import { galleryUploadAccept, getGalleryUploadError } from "@/lib/gallery-upload";
import { cn } from "@/lib/utils";

export type AdminAction = (formData: FormData) => Promise<ActionResult>;

const FormContext = createContext<{ errors: Record<string, string>; pending: boolean }>({ errors: {}, pending: false });
export const useAdminForm = () => useContext(FormContext);

const control = "h-9 border-border bg-background shadow-xs";

type AdminFormProps = Omit<ComponentProps<"form">, "action" | "onSubmit"> & {
  action: AdminAction;
  onSuccess?: () => void;
  resetOnSuccess?: boolean;
};

/**
 * Memanggil server action tanpa navigasi: isian tetap utuh saat validasi gagal,
 * error tampil di field terkait, dan hasilnya diumumkan lewat toast.
 */
export function AdminForm({ action, onSuccess, resetOnSuccess, children, ...props }: AdminFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const formData = new FormData(form, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(async () => {
      let result: ActionResult | undefined;
      try {
        result = await action(formData);
      } catch {
        result = { ok: false, message: "Permintaan gagal dikirim. Periksa koneksi, lalu coba lagi." };
      }
      if (!result) return;
      if (result.ok) {
        setErrors({});
        toast.success(result.message);
        if (resetOnSuccess) form.reset();
        onSuccess?.();
        return;
      }
      setErrors(result.fieldErrors ?? {});
      toast.error(result.message);
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
    });
  }

  return (
    <FormContext.Provider value={{ errors, pending }}>
      <form onSubmit={handleSubmit} {...props}>{children}</form>
    </FormContext.Provider>
  );
}

function FieldShell({ id, name, label, hint, required, className, children }: { id: string; name: string; label: ReactNode; hint?: ReactNode; required?: boolean; className?: string; children: ReactNode }) {
  const error = useAdminForm().errors[name];
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <Label htmlFor={id}>{label}{required && <span className="text-destructive" aria-hidden="true">*</span>}</Label>
      {children}
      {error ? <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">{error}</p> : hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

type FieldProps = { name: string; label: ReactNode; hint?: ReactNode; className?: string };

function useField(name: string) {
  const id = useId();
  const invalid = Boolean(useAdminForm().errors[name]);
  return { id, aria: { "aria-invalid": invalid || undefined, "aria-describedby": invalid ? `${id}-error` : undefined } };
}

export function TextField({ name, label, hint, className, ...props }: FieldProps & Omit<ComponentProps<"input">, "name" | "className">) {
  const { id, aria } = useField(name);
  return <FieldShell id={id} name={name} label={label} hint={hint} required={props.required} className={className}><Input id={id} name={name} className={control} {...aria} {...props} /></FieldShell>;
}

export function TextareaField({ name, label, hint, className, ...props }: FieldProps & Omit<ComponentProps<"textarea">, "name" | "className">) {
  const { id, aria } = useField(name);
  return <FieldShell id={id} name={name} label={label} hint={hint} required={props.required} className={className}><Textarea id={id} name={name} className="border-border bg-background shadow-xs" style={{ minHeight: `calc(${Number(props.rows ?? 3)} * 1.5em + 1rem)` }} {...aria} {...props} /></FieldShell>;
}

export function SelectField({ name, label, hint, className, options, ...props }: FieldProps & Omit<ComponentProps<"select">, "name" | "className" | "size"> & { options: readonly { value: string; label: string }[] }) {
  const { id, aria } = useField(name);
  return (
    <FieldShell id={id} name={name} label={label} hint={hint} required={props.required} className={className}>
      <NativeSelect id={id} name={name} className="w-full *:data-[slot=native-select]:h-9 *:data-[slot=native-select]:border-border *:data-[slot=native-select]:bg-background *:data-[slot=native-select]:shadow-xs" {...aria} {...props}>
        {options.map((option) => <NativeSelectOption key={option.value} value={option.value}>{option.label}</NativeSelectOption>)}
      </NativeSelect>
    </FieldShell>
  );
}

export function SwitchField({ name, label, hint, defaultChecked, className }: FieldProps & { defaultChecked?: boolean }) {
  const id = useId();
  return (
    <div className={cn("flex items-center justify-between gap-4 rounded-lg border bg-background px-3 py-2.5", className)}>
      <div className="grid gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} name={name} defaultChecked={defaultChecked} />
    </div>
  );
}

export function SubmitButton({ children, ...props }: ComponentProps<typeof Button>) {
  const { pending } = useAdminForm();
  return <Button type="submit" size="lg" disabled={pending} {...props}>{pending && <Loader2 className="animate-spin" />}{children}</Button>;
}

/** URL gambar yang bisa diketik, ditempel dari Media Library, atau diisi lewat upload langsung. */
export function ImageField({ name, label, hint, className, defaultValue = "", required }: FieldProps & { defaultValue?: string; required?: boolean }) {
  const { id, aria } = useField(name);
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const previewable = /^(\/(?!\/)|https?:\/\/)\S+$/.test(url);

  async function upload(file: File) {
    const error = getGalleryUploadError(file);
    if (error) { toast.error(error); return; }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) { toast.error(data.error ?? "Upload gagal. Silakan coba lagi."); return; }
      setUrl(data.url);
      toast.success("Gambar diunggah. Simpan form untuk menerapkannya.");
    } catch {
      toast.error("Upload gagal. Periksa koneksi, lalu coba lagi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <FieldShell id={id} name={name} label={label} hint={hint ?? "Unggah gambar baru atau tempel URL dari Media Library."} required={required} className={className}>
      <div className="flex items-center gap-2">
        <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground">
          {/* Pratinjau memakai <img> biasa karena URL yang sedang diketik belum tentu host yang diizinkan next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {previewable ? <img src={url} alt="" className="size-full object-cover" /> : <ImageIcon className="size-4" />}
        </span>
        <Input id={id} name={name} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/uploads/gambar.jpg" required={required} className={control} {...aria} />
        <input ref={fileRef} type="file" accept={galleryUploadAccept} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
        <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <Upload />}Unggah</Button>
      </div>
    </FieldShell>
  );
}

export function SocialLinksField({ defaultValue }: { defaultValue: { label: string; href: string }[] }) {
  const { errors } = useAdminForm();
  const nextKey = useRef(defaultValue.length);
  const [rows, setRows] = useState(() => defaultValue.map((link, index) => ({ ...link, key: index })));
  const update = (key: number, patch: Partial<{ label: string; href: string }>) => setRows((current) => current.map((row) => row.key === key ? { ...row, ...patch } : row));

  return (
    <div className="grid gap-3">
      <input type="hidden" name="socialLinksPresent" value="1" />
      {rows.length === 0 && <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">Belum ada tautan. Tambahkan Instagram, YouTube, atau kanal lain.</p>}
      {rows.map((row, index) => {
        const labelError = errors[`socialLinks.${index}.label`];
        const hrefError = errors[`socialLinks.${index}.href`];
        return (
          <div key={row.key} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-start">
            <div className="grid gap-1">
              <Input name="socialLabel" value={row.label} onChange={(event) => update(row.key, { label: event.target.value })} placeholder="Instagram" aria-label={`Nama tautan ${index + 1}`} aria-invalid={labelError ? true : undefined} className={control} />
              {labelError && <p role="alert" className="text-xs font-medium text-destructive">{labelError}</p>}
            </div>
            <div className="grid gap-1">
              <Input name="socialHref" value={row.href} onChange={(event) => update(row.key, { href: event.target.value })} placeholder="https://instagram.com/..." aria-label={`URL tautan ${index + 1}`} aria-invalid={hrefError ? true : undefined} className={control} />
              {hrefError && <p role="alert" className="text-xs font-medium text-destructive">{hrefError}</p>}
            </div>
            <Button type="button" variant="ghost" size="icon-lg" aria-label={`Hapus tautan ${index + 1}`} onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}><Trash2 /></Button>
          </div>
        );
      })}
      <Button type="button" variant="outline" className="w-fit" disabled={rows.length >= 20} onClick={() => setRows((current) => [...current, { label: "", href: "", key: nextKey.current++ }])}><Plus />Tambah tautan</Button>
    </div>
  );
}

export function FormPreviewImage({ src, alt }: { src: string; alt: string }) {
  return <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"><Image src={src} alt={alt} fill sizes="480px" className="object-cover" /></div>;
}
