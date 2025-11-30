// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getSupabaseAdminClient } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://discreetkit.com';
  const now = new Date();

  // 1. Get all dynamic product pages
  const supabase = await getSupabaseAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at, category, featured');

  const productEntries: MetadataRoute.Sitemap = products?.map(({ id, updated_at, featured }) => ({
    url: `${siteUrl}/products/${id}`,
    lastModified: new Date(updated_at),
    changeFrequency: 'monthly',
    priority: featured ? 0.9 : 0.7, // Higher priority for featured products
  })) ?? [];

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
    {
      url: `${siteUrl}/products/test-kits`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${siteUrl}/products/medication`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${siteUrl}/products/wellness`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${siteUrl}/products/bundles`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    },

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

    // Location-specific landing pages (for local SEO)
    {
      url: `${siteUrl}/locations/accra`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${siteUrl}/locations/kumasi`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${siteUrl}/locations/university-of-ghana`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    },
  ];

  // 3. Combine and return
  return [...staticEntries, ...productEntries];
}