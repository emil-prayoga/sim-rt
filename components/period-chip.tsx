import { formatPeriodeBulan } from "@/lib/format";

export function PeriodChip() {
  return <span>Periode: {formatPeriodeBulan()}</span>;
}
