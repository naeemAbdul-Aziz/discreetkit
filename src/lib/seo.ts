// lib/seo.ts
import type { Metadata } from 'next';

// Import the SEO config - we'll use dynamic import to avoid type issues
const getSEOConfig = () => {
  try {
    return require('../../.seo-config.json');
  } catch (e) {
    // Fallback config if file doesn't exist
    return {
      site: {
        name: "DiscreetKit Ghana",
        title: "DiscreetKit Ghana: Confidential Health Products Delivered",
        description: "Order confidential self-test kits for HIV, pregnancy, and more. Get Postpill and wellness products delivered discreetly to your door in Ghana.",
        url: "https://discreetkit.shop",
        logo: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png",
        themeColor: "#187f76",
        language: "en",
        region: "GH",
        currency: "GHS"
      },
      business: {
        name: "DiscreetKit Ghana",
        serviceArea: ["Accra", "Kumasi", "University of Ghana"],
        priceRange: "₵₵"
      },
      social: {
        twitter: "@DiscreetKitGH"
      },
      keywords: {
        primary: ["discreet health products Ghana", "confidential self-test kits"]
      }
    };
  }
};

const seoConfig = getSEOConfig();

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  price?: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  price,
  currency = 'GHS',
  availability = 'InStock'
}: SEOProps): Metadata {
  const fullTitle = title 
    ? `${title} | ${seoConfig.site.name}`
    : seoConfig.site.title;
  
  const fullDescription = description || seoConfig.site.description;
  const fullUrl = `${seoConfig.site.url}${url}`;
  const socialImage = image || seoConfig.site.logo;
  
  const allKeywords = [
    ...keywords,
    ...seoConfig.keywords.primary,
    ...seoConfig.keywords.secondary
  ];

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    
    openGraph: {
      type: type as any,
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      siteName: seoConfig.site.name,
      locale: 'en_GH',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [socialImage],
      creator: seoConfig.social.twitter,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    alternates: {
      canonical: fullUrl,
    },
    
    other: {
      ...(price && { 'price:amount': price }),
      'price:currency': currency,
      'product:availability': availability,
      ...(url.split('/').pop() && { 'product:retailer_item_id': url.split('/').pop() }),
    },
  };

  // Remove undefined values from other metadata
  if (metadata.other) {
    Object.keys(metadata.other).forEach(key => {
      if (metadata.other && metadata.other[key] === undefined) {
        delete metadata.other[key];
      }
    });
  }

  return metadata;
}

// Structured Data Generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.business.name,
    description: seoConfig.business.description,
    url: seoConfig.site.url,
    logo: seoConfig.site.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: seoConfig.business.phone,
      contactType: 'customer service',
      email: seoConfig.business.email,
      availableLanguage: 'English',
      areaServed: 'GH'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: seoConfig.business.address.addressLocality,
      addressRegion: seoConfig.business.address.addressRegion,
      addressCountry: seoConfig.business.address.addressCountry
    },
    sameAs: [
      `https://twitter.com/${seoConfig.social.twitter}`,
      `https://instagram.com/${seoConfig.social.instagram}`,
      `https://facebook.com/${seoConfig.social.facebook}`,
      `https://linkedin.com/company/${seoConfig.social.linkedin}`
    ],
    serviceArea: seoConfig.business.serviceArea?.map((area: string) => ({
      '@type': 'GeoCircle',
      name: area
    })) || [],
    priceRange: seoConfig.business.priceRange,
    paymentAccepted: seoConfig.business.paymentAccepted
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.site.name,
    url: seoConfig.site.url,
    description: seoConfig.site.description,
    publisher: {
      '@type': 'Organization',
      name: seoConfig.business.name
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${seoConfig.site.url}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = 'GHS',
  availability = 'InStock',
  category,
  sku,
  brand = seoConfig.business.name
}: {
  name: string;
  description: string;
  image: string;
  price?: string;
  currency?: string;
  availability?: string;
  category?: string;
  sku?: string;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    category,
    sku,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: seoConfig.business.name
      }
    }
  };
}

export function generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: `${seoConfig.site.url}${breadcrumb.url}`
    }))
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// SEO Hook for easy usage
export function useSEO(props: SEOProps) {
  return generateMetadata(props);
}