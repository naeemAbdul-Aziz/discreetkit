// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com';
  const now = new Date();

  // 1. Get all dynamic product pages (best-effort, fail-open if env is missing)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      const { getSupabaseAdminClient } = await import('@/lib/supabase');
      const supabase = await getSupabaseAdminClient();
      const { data: products } = await supabase
        .from('products')
        .select('id, updated_at, featured');

      productEntries = products?.map(({ id, updated_at, featured }) => ({
        url: `${siteUrl}/products/${id}`,
        lastModified: updated_at ? new Date(updated_at) : now,
        changeFrequency: 'monthly',
        priority: featured ? 0.9 : 0.7,
      })) ?? [];
    }
  } catch {
    // If Supabase is unavailable during build, proceed with static entries only
  }

  // 2. Add all static pages with SEO priorities
  const staticEntries: MetadataRoute.Sitemap = [
    // High priority pages (main landing pages)
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },

    // Product category pages (medium-high priority)
    { url: `${siteUrl}/products/test-kits`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/products/medication-refills`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/products/condoms`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/products/lubricants`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/products/male-enhancement`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/products/emergency-contraceptives`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/products/value-bundles`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },

    // Legal and info pages (important for trust/SEO)
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4
    },

    // Service pages
    {
      url: `${siteUrl}/partner-care`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${siteUrl}/track`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5
    },


  ];

  // 3. Combine and return
  return [...staticEntries, ...productEntries];
}