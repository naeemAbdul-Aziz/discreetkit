import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🌱 Starting Non-Destructive KPI Seed...\n')

  // 1. Categories
  console.log('\n📂 Upserting KPI Categories...')
  const categories = [
    { name: 'Test Kits', slug: 'test-kits', description: 'Private, WHO-approved self-test kits.', image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png' },
    { name: 'Condoms', slug: 'condoms', description: 'Premium protection delivered in 100% plain packaging.', image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/w_800,h_800,c_fill,f_auto,q_auto/v1764757042/personal_care_ygnnrq.jpg' },
    { name: 'Lubricants', slug: 'lubricants', description: 'Enhance comfort and intimacy safely.', image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/w_800,h_800,c_fill,f_auto,q_auto/v1764757042/personal_care_ygnnrq.jpg' },
    { name: 'Male enhancement drugs', slug: 'male-enhancement', description: 'Boost confidence and performance with privacy.', image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/w_800,h_800,c_fill,f_auto,q_auto/v1764757042/personal_care_ygnnrq.jpg' },
    { name: 'Emergency Contraceptive', slug: 'emergency-contraceptives', description: 'Fast, discreet delivery of emergency contraception.', image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png' },
  ]
  
  for (const cat of categories) {
      await supabase.from('categories').upsert(cat, { onConflict: 'slug' })
  }

  // 2. Products
  console.log('\n💊 Upserting KPI Products...')
  
  const condomsList = ['Durex', 'Kiss', 'Flames', 'Fiesta', 'Ebony', 'Unidus', 'Pasante', 'Rough Rider'];
  const lubeList = ['K-Y Gel Lubricant', 'Lubrica Strawberry', 'Durex play', 'Levon – 2', 'Lubrimax Jelly', 'D & E Lubricant gel', 'Funtime Orgasm gel', 'Fiesta lubricant gel'];
  const enhancementList = ['Dragon spray/lozenges/tab', 'Red Sun', 'Procomil spray and tab', 'Viagra tablet 100mg/50mg', 'Imax Delay Spray', 'Talgentis-5', 'Kamagra 100mg', 'Comit-50', 'Cialis 20mg', 'Kamagra 50mg oral jelly', 'Sildenafil 100mg/50mg/25mg', 'Mr. Q', 'Adams Se'];
  const emergencyList = ['Postinor 2', 'Lydia Postpill', 'Primolut N', 'NorLevo', 'Escapelle', 'Microgynon 30'];

  const products: any[] = [];
  
  condomsList.forEach(name => {
      products.push({
          name: name + ' Condoms',
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-condoms',
          category: 'Condoms',
          price_ghs: 25.00,
          stock_level: 100,
          description: `Premium ${name} condoms for safe and confident intimacy.`,
          image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/w_800,h_800,c_fill,f_auto,q_auto/v1764757042/personal_care_ygnnrq.jpg',
          requires_prescription: false
      });
  });

  lubeList.forEach(name => {
      products.push({
          name: name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: 'Lubricants',
          price_ghs: 40.00,
          stock_level: 80,
          description: `${name} for ultimate comfort and enhanced pleasure.`,
          image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/w_800,h_800,c_fill,f_auto,q_auto/v1764757042/personal_care_ygnnrq.jpg',
          requires_prescription: false
      });
  });

  enhancementList.forEach(name => {
      // Check if requires prescription based on name
      const requires_rx = /viagra|cialis|sildenafil|kamagra|talgentis/i.test(name);
      products.push({
          name: name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: 'Male enhancement drugs', 
          price_ghs: 80.00,
          stock_level: 50,
          description: `${name} - Boost your confidence playfully and safely.`,
          image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/w_800,h_800,c_fill,f_auto,q_auto/v1764757042/personal_care_ygnnrq.jpg',
          requires_prescription: requires_rx
      });
  });

  emergencyList.forEach(name => {
      products.push({
          name: name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: 'Emergency Contraceptive',
          price_ghs: 35.00,
          stock_level: 50,
          description: `${name} - An emergency contraception option.`,
          image_url: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png',
          requires_prescription: true
      });
  });

  for (const p of products) {
      const { slug, ...productData } = p 
      
      const { data: prod } = await supabase.from('products').select('id').eq('name', p.name).maybeSingle()
      let pid = prod?.id
      
      if (!pid) {
        const { data: newP, error } = await supabase.from('products').insert(productData).select('id').single()
        if (error) {
            console.error(`❌ Failed to insert ${p.name}:`, error.message)
            continue
        }
        console.log(`✅ Inserted ${p.name}`)
      } else {
         await supabase.from('products').update(productData).eq('id', pid)
         console.log(`🔄 Updated ${p.name}`)
      }
  }

  console.log('\n✨ Custom KPI Seed Complete without deletion!')
}

main().catch(console.error)
