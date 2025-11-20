import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://discreetkit.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',           // Hide admin portal
          '/login/',           // Hide login
          '/cart/',            // Hide cart (no SEO value)
          '/order/',           // Hide checkout flow
          '/api/',             // Hide API routes
          '/dashboard/',       // Hide dashboard
          '/*?*',              // Hide query parameters
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/products/',        // Allow all product pages
          '/partner-care/',    // Allow service pages
          '/track/',           // Allow order tracking (public info)
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/login/',
          '/cart/',
          '/order/',
        ],
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}