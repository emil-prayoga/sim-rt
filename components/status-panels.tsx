type LoadingPanelProps = {
  label?: string;
  baris?: number;
};

/** Panel skeleton saat data sedang dimuat (kondisi loading). */
export function LoadingPanel({ label = "Memuat data…", baris = 4 }: LoadingPanelProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm"
    >
      <div className="flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md">
        <UiIcon name="loading" size={18} className="animate-spin" />
        <span>{label}</span>
      </div>
      {Array.from({ length: baris }).map((_, index) => (
        <div
          className="h-10 rounded-lg bg-surface-container animate-pulse"
          key={index}
        />
      ))}
    </div>
  );
}

type ErrorPanelProps = {
  message: string;
  onRetry?: () => void;
};

/** Panel kesalahan dengan tombol muat ulang (kondisi error). */
export function ErrorPanel({ message, onRetry }: ErrorPanelProps) {
  return (
    <div className="bg-error-container/60 rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-sm text-on-error-container font-label-lg text-label-lg font-bold">
        <UiIcon name="error" />
        <span>Data gagal dimuat</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{message}</p>
      {onRetry && (
        <button
          className="self-start px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm hover:bg-primary transition-colors"
          onClick={onRetry}
          type="button"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

type EmptyPanelProps = {
  message: string;
  hint?: string;
  icon?: string;
};

/** Panel kosong (kondisi data tidak tersedia). */
export function EmptyPanel({ message, hint, icon = "inbox" }: EmptyPanelProps) {
  return (
    <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col items-center gap-space-sm text-center">
      <UiIcon name={icon} size={28} className="text-outline" />
      <span className="font-label-lg text-label-lg text-on-surface font-bold">
        {message}
      </span>
      {hint && (
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {hint}
        </span>
      )}
    </div>
  );
}
import { UiIcon } from "@/components/ui-icon";

