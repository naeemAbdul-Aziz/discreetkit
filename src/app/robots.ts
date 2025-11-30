import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://discreetkit.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products/',
          '/partner-care/',
          '/track/',
          '/privacy/',
          '/terms/',
        ],
        disallow: [
          '/admin/',           // Hide admin portal
          '/pharmacy/',        // Hide pharmacy portal
          '/login/',           // Hide login
          '/cart/',            // Hide cart (no SEO value)
          '/order/',           // Hide checkout flow
          '/api/',             // Hide API routes
          '/dashboard/',       // Hide dashboard
          '/unauthorized/',    // Hide error pages
          '/*?*',              // Hide query parameters
          '/*.json$',          // Hide JSON files
          '/test/',            // Hide test pages
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/products/',        // Allow all product pages
          '/partner-care/',    // Allow service pages
          '/track/',           // Allow order tracking (public info)
          '/privacy/',         // Allow privacy policy
          '/terms/',           // Allow terms of service
        ],
        disallow: [
          '/admin/',
          '/pharmacy/',
          '/dashboard/',
          '/api/',
          '/login/',
          '/cart/',
          '/order/',
          '/unauthorized/',
        ],
        crawlDelay: 1,        // Be nice to Google
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/products/',
          '/partner-care/',
          '/privacy/',
          '/terms/',
        ],
        disallow: [
          '/admin/',
          '/pharmacy/',
          '/api/',
          '/cart/',
          '/order/',
        ],
        crawlDelay: 2,
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}