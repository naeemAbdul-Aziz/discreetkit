import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const testimonials = [
    {
        quote: "The entire process was so simple and private. I got my package the next day in a plain box. It's a huge relief to have a service like this in Ghana.",
        name: "Ama Konadu",
        role: "University of Ghana Student",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
    },
    {
        quote: "DiscreetKit is a game-changer. I was worried about going to a pharmacy, but this was completely anonymous. The tracking code gave me peace of mind.",
        name: "David Adjei",
        role: "Young Professional, Osu",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
    },
    {
        quote: "As a student leader, I see the need for this every day. It's a responsible, safe, and judgment-free way for young people to take control of their health.",
        name: "Fatima Seidu",
        role: "Student Rep, UPSA",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString()
    },
    {
        quote: "The instructions were so easy to follow. I had my result in 15 minutes. Knowing my status privately has lifted a huge weight off my shoulders.",
        name: "Michael Boateng",
        role: "GIMPA Graduate",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString()
    },
    {
        quote: "I ordered the couple's bundle with my partner. It helped us have an open conversation and support each other through the process. Highly recommend.",
        name: "Esi & Kofi",
        role: "Couple, Accra",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    },
    {
        quote: "Fast, professional, and exactly as advertised. The package was so discreet, even I wasn't sure what it was at first. 10/10 service.",
        name: "Josephine Owusu",
        role: "Entrepreneur, East Legon",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
    },
];

async function migrate() {
    console.log('📦 Migrating testimonials to reviews...')

    for (const t of testimonials) {
        // Construct a combined author string like "Ama Konadu (University of Ghana Student)" to preserve context
        // OR just use name. Let's use name and put role in content or just name.
        // The Review component displays author_name.
        // Let's format it: "Name - Role"
        const author_name = `${t.name} • ${t.role}`;

        const { error } = await supabase.from('reviews').insert({
            content: t.quote,
            author_name: author_name,
            is_approved: true,
            created_at: t.created_at
        })

        if (error) {
            console.error(`❌ Failed to insert ${t.name}:`, error.message)
        } else {
            console.log(`✅ Migrated: ${t.name}`)
        }
    }
    console.log('🎉 Migration complete!')
}

migrate()
