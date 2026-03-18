import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🗣️ Seeding Community Voices / Reviews...\n')

  const reviews = [
    {
      title: 'Completely unbranded',
      content: 'The packaging was completely unbranded, exactly as promised. Delivered to my hostel without any weird looks. Highly recommend.',
      author_name: 'Anonymous Student',
      is_approved: true
    },
    {
      title: 'Fastest delivery ever',
      content: 'Fastest emergency delivery in Accra. Placed the order at 9am, had it by 10am. 100% confidential and stress-free.',
      author_name: 'Anonymous',
      is_approved: true
    },
    {
      title: 'Zero judgment',
      content: 'I was really nervous about ordering these items online, but their privacy policy is solid. The rider didn\'t even know what was in the bag.',
      author_name: 'Anonymous Professional',
      is_approved: true
    },
    {
      title: 'Great bundles',
      content: 'The value bundles are incredibly cost-effective. Everything I need in one private package. Will definitely be using this service again.',
      author_name: 'Anonymous User',
      is_approved: true
    },
    {
      title: 'Super helpful support',
      content: 'Great selection of enhancement products. Totally discreet, and customer service was surprisingly helpful and non-judgmental.',
      author_name: 'Anonymous',
      is_approved: true
    },
    {
      title: 'Life Saver',
      content: 'Needed a refill urgently over the weekend and they delivered instantly with zero hassle. Total life saver.',
      author_name: 'Anonymous',
      is_approved: true
    }
  ]

  for (const review of reviews) {
    const { error } = await supabase.from('reviews').insert(review)
    if (error) {
      console.error(`❌ Failed to insert review "${review.title}":`, error.message)
    } else {
      console.log(`✅ Inserted review: "${review.title}"`)
    }
  }

  console.log('\n✨ Community Voices Seeding Complete!')
}

main().catch(console.error)
