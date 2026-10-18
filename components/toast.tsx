import { UiIcon } from "@/components/ui-icon";

type ToastProps = {
  message: string;
  icon?: string;
  tone?: "success" | "error";
  onDismiss?: () => void;
};

/**
 * Notifikasi toast melayang di kanan bawah layar.
 * Dirender secara kondisional oleh komponen induk (state + timer).
 */
export function Toast({ message, icon, tone = "success", onDismiss }: ToastProps) {
  return (
    <div className={`toast ${tone === "error" ? "toast-error" : "toast-success"}`} role="status">
      <UiIcon name={icon ?? (tone === "error" ? "error" : "task_alt")} />
      <span>{message}</span>
      {onDismiss && <button aria-label="Tutup notifikasi" onClick={onDismiss}><UiIcon name="close" size={17}/></button>}
    </div>
  );
}
