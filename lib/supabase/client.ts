import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

/**
 * Singleton Supabase browser client.
 * Mengembalikan `null` ketika NEXT_PUBLIC_SUPABASE_URL / ANON_KEY belum diisi,
 * sehingga aplikasi dapat berjalan dalam mode demo.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(env.url, env.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
}
