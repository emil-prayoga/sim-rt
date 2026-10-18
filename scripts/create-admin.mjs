import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function readLocalEnv() {
  let content = "";
  try { content = readFileSync(resolve(process.cwd(), ".env.local"), "utf8"); } catch { return {}; }
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SIRT_ADMIN_EMAIL|SIRT_ADMIN_PASSWORD)\s*=\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return values;
}

const local = readLocalEnv();
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? local.SUPABASE_URL ?? local.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? local.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SIRT_ADMIN_EMAIL ?? local.SIRT_ADMIN_EMAIL ?? "admin@sirt.demo";
const password = process.env.SIRT_ADMIN_PASSWORD ?? local.SIRT_ADMIN_PASSWORD ?? "SirtDemo04!";

if (!url || !serviceKey) {
  console.error("Konfigurasi server belum lengkap. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("SIRT_ADMIN_PASSWORD harus minimal 8 karakter.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) {
  console.error(`Tidak dapat memeriksa pengguna Supabase Auth: ${listError.message}`);
  process.exit(1);
}
const existing = listed.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
const result = existing
  ? await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true })
  : await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nama: "Administrator SiRT" } });

if (result.error) {
  console.error(`Akun admin gagal disiapkan: ${result.error.message}`);
  process.exit(1);
}
console.log(`Akun Supabase Auth siap untuk ${email}. Kata sandi diambil dari konfigurasi lokal.`);
