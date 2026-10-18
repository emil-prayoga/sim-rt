import { createClient } from '@supabase/supabase-js'

// Client ini berjalan khusus di Server & Bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  // Contoh: Menghapus user dari Supabase Auth
  const { userId } = await request.json()
  
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ message: 'User berhasil dihapus oleh Admin' })
}