import 'dotenv/config'
import { execSync } from 'child_process'

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL

if (!dbUrl) {
    console.error('❌ No valid database connection string found (DATABASE_URL, POSTGRES_URL, or SUPABASE_DB_URL)')
    process.exit(1)
}

console.log('🚀 Pushing schema to database...')

try {
    // Use --accept-data-loss explicitly if needed, but for now just try push.
    // We use npx supabase db push --db-url "..."
    execSync(`npx supabase db push --db-url "${dbUrl}"`, { stdio: 'inherit' })
    console.log('✅ Schema push successful')
} catch (error) {
    console.error('❌ Schema push failed')
    process.exit(1)
}
