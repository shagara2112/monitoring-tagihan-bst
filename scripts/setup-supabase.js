import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lnrkfmcsrzcmjfewlxyz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucmtmbWNzcnpjbWpmZXdseHl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ2MjAzMSwiZXhwIjoyMDc1MDM4MDMxfQ.WkTxvTtzgWdVRJ1JnhF5_JIvKiSI8UT43y9v9WxMZjE'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test connection by checking if we can access the API
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1)
    
    if (error) {
      console.error('Connection error:', error)
      return
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('API is working. You can now use the Supabase client directly.')
    
  } catch (error) {
    console.error('Setup error:', error)
  }
}

setupDatabase()