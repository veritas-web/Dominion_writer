import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yoeiaonvowsktnluphlo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZWlhb252b3dza3RubHVwaGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMTcxMCwiZXhwIjoyMTAwMzg3NzEwfQ.SrBVNT_GlzYeRZAly1HmYxfaPEHX82gJUVOZWxJ6Nr8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase.from('User').select('*').limit(1)
  console.log('User schema:', data?.[0] ? Object.keys(data[0]) : error)

  const { data: admin, error: adminErr } = await supabase.from('User').select('*').eq('email', 'admin@veritasdocs.com').limit(1)
  console.log('Admin user:', admin, adminErr)
}
main()
