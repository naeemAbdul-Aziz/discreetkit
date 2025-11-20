// lib/seo/advanced-schemas.ts
import seoConfig from '../../../.seo-config.json';

/**
 * LocalBusiness Schema for enhanced local SEO
 * Helps Google understand your business location and services
 */
export function generateLocalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${seoConfig.site.url}/#localbusiness`,
        name: seoConfig.business.name,
        description: seoConfig.business.description,
        url: seoConfig.site.url,
        logo: seoConfig.site.logo,
        image: seoConfig.site.logo,
        telephone: seoConfig.business.phone,
        email: seoConfig.business.email,
        priceRange: seoConfig.business.priceRange,
        address: {
            '@type': 'PostalAddress',
            addressLocality: seoConfig.business.address.addressLocality,
            addressRegion: seoConfig.business.address.addressRegion,
            addressCountry: seoConfig.business.address.addressCountry,
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '5.6037',  // Accra coordinates
            longitude: '-0.1870'
        },
        areaServed: seoConfig.business.serviceArea?.map((area: string) => ({
            '@type': 'City',
            name: area
        })),
        paymentAccepted: seoConfig.business.paymentAccepted,
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '00:00',
                closes: '23:59'
            }
        ],
        sameAs: [
            `https://twitter.com/${seoConfig.social.twitter.replace('@', '')}`,
            `https://instagram.com/${seoConfig.social.instagram.replace('@', '')}`,
            `https://facebook.com/${seoConfig.social.facebook}`,
            `https://linkedin.com/${seoConfig.social.linkedin}`
        ]
    };
}

/**
 * MedicalBusiness Schema for health-related businesses
 * Signals to Google that you're in the healthcare industry
 */
export function generateMedicalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        '@id': `${seoConfig.site.url}/#medicalbusiness`,
        name: seoConfig.business.name,
        description: seoConfig.business.description,
        url: seoConfig.site.url,
        logo: seoConfig.site.logo,
        medicalSpecialty: [
            'Sexual Health',
            'Preventive Medicine',
            'Public Health'
        ],
        availableService: [
            {
                '@type': 'MedicalTest',
                name: 'HIV Self-Test Kit',
                description: 'Confidential at-home HIV testing'
            },
            {
                '@type': 'MedicalTest',
                name: 'Pregnancy Test Kit',
                description: 'Private pregnancy testing at home'
            }
        ]
    };
}

/**
 * Enhanced Product Schema with reviews and offers
 */
export function generateEnhancedProductSchema({
    name,
    description,
    image,
    price,
    currency = 'GHS',
    availability = 'InStock',
    category,
    sku,
    brand = seoConfig.business.name,
    ratingValue,
    reviewCount,
    shippingDetails
}: {
    name: string;
    description: string;
    image: string;
    price: string;
    currency?: string;
    availability?: string;
    category?: string;
    sku?: string;
    brand?: string;
    ratingValue?: number;
    reviewCount?: number;
    shippingDetails?: {
        deliveryTime: string;
        shippingRate: string;
    };
}) {
    const schema: any = {
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
            url: seoConfig.site.url,
            seller: {
                '@type': 'Organization',
                name: seoConfig.business.name
            },
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            itemCondition: 'https://schema.org/NewCondition'
        }
    };

    // Add shipping details if provided
    if (shippingDetails) {
        schema.offers.shippingDetails = {
            '@type': 'OfferShippingDetails',
            shippingRate: {
                '@type': 'MonetaryAmount',
                value: shippingDetails.shippingRate,
                currency: currency
            },
            deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
                    unitCode: 'DAY'
                },
                transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 2,
                    unitCode: 'DAY'
                }
            }
        };
    }

    // Add aggregate rating if provided
    if (ratingValue && reviewCount) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: ratingValue.toString(),
            reviewCount: reviewCount.toString(),
            bestRating: '5',
            worstRating: '1'
        };
    }

    return schema;
}

/**
 * ItemList Schema for product collections
 */
export function generateItemListSchema(items: Array<{
    name: string;
    url: string;
    image: string;
    position: number;
}>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map(item => ({
            '@type': 'ListItem',
            position: item.position,
            item: {
                '@type': 'Product',
                name: item.name,
                url: item.url,
                image: item.image
            }
        }))
    };
}

/**
 * HowTo Schema for product usage instructions
 */
export function generateHowToSchema({
    name,
    description,
    steps,
    totalTime,
    image
}: {
    name: string;
    description: string;
    steps: Array<{ name: string; text: string; image?: string }>;
    totalTime?: string;
    image?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        image,
        totalTime,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            image: step.image
        }))
    };
}

/**
 * SpecialAnnouncement Schema for promotions and important updates
 */
export function generateSpecialAnnouncementSchema({
    name,
    text,
    datePosted,
    expires,
    category = 'https://www.wikidata.org/wiki/Q3249551' // Promotion
}: {
    name: string;
    text: string;
    datePosted: string;
    expires?: string;
    category?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SpecialAnnouncement',
        name,
        text,
        datePosted,
        expires,
        category,
        spatialCoverage: {
            '@type': 'Country',
            name: 'Ghana'
        },
        publisher: {
            '@type': 'Organization',
            name: seoConfig.business.name,
            url: seoConfig.site.url
        }
    };
}

/**
 * VideoObject Schema for product videos
 */
export function generateVideoSchema({
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl
}: {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration: string;
    contentUrl: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name,
        description,
        thumbnailUrl,
        uploadDate,
        duration,
        contentUrl,
        embedUrl: contentUrl,
        publisher: {
            '@type': 'Organization',
            name: seoConfig.business.name,
            logo: {
                '@type': 'ImageObject',
                url: seoConfig.site.logo
            }
        }
    };
}

/**
 * Review Schema for customer reviews
 */
export function generateReviewSchema({
    itemName,
    ratingValue,
    reviewBody,
    author,
    datePublished
}: {
    itemName: string;
    ratingValue: number;
    reviewBody: string;
    author: string;
    datePublished: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: {
            '@type': 'Product',
            name: itemName
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: ratingValue.toString(),
            bestRating: '5',
            worstRating: '1'
        },
        reviewBody,
        author: {
            '@type': 'Person',
            name: author
        },
        datePublished,
        publisher: {
            '@type': 'Organization',
            name: seoConfig.business.name
        }
    };
}
