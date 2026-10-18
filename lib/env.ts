import { z } from "zod";

/**
 * Validasi environment variable publik SiRT dengan Zod.
 * Hanya variatif dengan prefix NEXT_PUBLIC_ yang dibundel ke browser.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),
});

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

let cachedEnv: SupabaseEnv | null | undefined;

/**
 * Mengembalikan kredensial Supabase jika keduanya tersedia dan valid,
 * atau `null` bila belum dikonfigurasi (mode demo).
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  if (cachedEnv !== undefined) {
    return cachedEnv;
  }

  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    console.warn(
      "Variabel environment Supabase tidak valid:",
      parsed.error.issues.map((issue) => issue.path.join(".")).join(", "),
    );
    cachedEnv = null;
    return cachedEnv;
  }

  const url = parsed.data.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cachedEnv = url && anonKey ? { url, anonKey } : null;
  return cachedEnv;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
