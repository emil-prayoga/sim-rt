import { demoKas, demoWarga } from "@/lib/demo-data";
import type { KasTransaksi, Warga } from "@/lib/types";

function read<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const saved = window.localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch {
    window.localStorage.removeItem(key);
  }
  return initial;
}

function write<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getDemoWarga(): Warga[] { return read("sirt-demo-warga", demoWarga); }
export function saveDemoWarga(value: Warga[]): void { write("sirt-demo-warga", value); }
export function getDemoKas(): KasTransaksi[] { return read("sirt-demo-kas", demoKas); }
export function saveDemoKas(value: KasTransaksi[]): void { write("sirt-demo-kas", value); }
