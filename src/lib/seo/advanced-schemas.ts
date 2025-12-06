// Advanced SEO Schemas for Premium Google Search Results
import seoConfig from '../../../.seo-config.json';

/**
 * Enhanced Organization Schema with Sitelinks Search Box
 * This enables the search box in Google search results
 */
export function generateEnhancedOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'MedicalBusiness', 'HealthAndBeautyBusiness'],
        '@id': `${seoConfig.site.url}/#organization`,
        name: seoConfig.business.name,
        alternateName: 'DiscreetKit',
        legalName: 'DiscreetKit Ghana',
        description: 'Privacy infrastructure platform for confidential health products and self-test kits in Ghana. We sell dignity, anonymity, and the ability to access healthcare without stigma.',
        url: seoConfig.site.url,
        logo: {
            '@type': 'ImageObject',
            '@id': `${seoConfig.site.url}/#logo`,
            url: seoConfig.site.logo,
            contentUrl: seoConfig.site.logo,
            caption: 'DiscreetKit Ghana Logo',
            inLanguage: 'en-GH',
            width: '512',
            height: '512'
        },
        image: {
            '@type': 'ImageObject',
            url: seoConfig.site.logo,
            width: '1200',
            height: '630'
        },
        foundingDate: '2024',
        founder: {
            '@type': 'Person',
            name: 'DiscreetKit Team'
        },
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: seoConfig.business.phone,
                contactType: 'customer service',
                email: seoConfig.business.email,
                availableLanguage: ['English'],
                areaServed: {
                    '@type': 'Country',
                    name: 'Ghana'
                },
                contactOption: ['TollFree'],
                hoursAvailable: {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    opens: '00:00',
                    closes: '23:59'
                }
            },
            {
                '@type': 'ContactPoint',
                contactType: 'sales',
                email: seoConfig.business.email,
                availableLanguage: ['English'],
                areaServed: 'GH'
            }
        ],
        address: {
            '@type': 'PostalAddress',
            addressLocality: seoConfig.business.address.addressLocality,
            addressRegion: seoConfig.business.address.addressRegion,
            addressCountry: {
                '@type': 'Country',
                name: 'Ghana'
            }
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '5.6037',
            longitude: '-0.1870'
        },
        areaServed: [
            {
                '@type': 'City',
                name: 'Accra',
                '@id': 'https://www.wikidata.org/wiki/Q3761'
            },
            {
                '@type': 'City',
                name: 'Kumasi',
                '@id': 'https://www.wikidata.org/wiki/Q182984'
            },
            {
                '@type': 'City',
                name: 'Cape Coast'
            },
            {
                '@type': 'City',
                name: 'Takoradi'
            },
            {
                '@type': 'City',
                name: 'Tamale'
            }
        ],
        sameAs: [
            `https://twitter.com/${seoConfig.social.twitter.replace('@', '')}`,
            `https://instagram.com/${seoConfig.social.instagram.replace('@', '')}`,
            `https://facebook.com/${seoConfig.social.facebook}`,
            `https://linkedin.com/${seoConfig.social.linkedin}`
        ],
        slogan: 'Skip the awkward. We deliver discreetly.',
        brand: {
            '@type': 'Brand',
            name: 'DiscreetKit',
            logo: seoConfig.site.logo,
            slogan: 'Privacy as a Service'
        },
        priceRange: seoConfig.business.priceRange,
        paymentAccepted: seoConfig.business.paymentAccepted,
        currenciesAccepted: 'GHS',
        openingHours: 'Mo-Su 00:00-23:59',
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Health Products',
            itemListElement: [
                {
                    '@type': 'OfferCatalog',
                    name: 'Self-Test Kits',
                    itemListElement: [
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Product',
                                name: 'HIV Self-Test Kit',
                                description: 'WHO-approved HIV self-test kit with 99% accuracy'
                            }
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Product',
                                name: 'Pregnancy Test Kit',
                                description: 'Reliable pregnancy test for fast and private results'
                            }
                        }
                    ]
                },
                {
                    '@type': 'OfferCatalog',
                    name: 'Emergency Contraception',
                    itemListElement: [
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Product',
                                name: 'Postpill (Emergency Contraception)',
                                description: 'Emergency contraception delivered discreetly'
                            }
                        }
                    ]
                },
                {
                    '@type': 'OfferCatalog',
                    name: 'Wellness Products',
                    itemListElement: [
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Product',
                                name: 'Premium Condoms',
                                description: 'Ultra-thin, lubricated latex condoms'
                            }
                        }
                    ]
                }
            ]
        },
        // Sitelinks Search Box - CRITICAL for Google search box
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${seoConfig.site.url}/products?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        },
        // Service details
        knowsAbout: [
            'Sexual Health',
            'HIV Testing',
            'Pregnancy Testing',
            'Emergency Contraception',
            'Confidential Healthcare',
            'Medical Privacy',
            'Student Health Services'
        ],
        makesOffer: [
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Discreet Delivery Service',
                    description: '100% anonymous delivery in plain packaging'
                }
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Anonymous Ordering',
                    description: 'No account required, complete privacy'
                }
            }
        ]
    };
}

/**
 * Local Business Schema optimized for Ghana
 */
export function generateLocalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${seoConfig.site.url}/#localbusiness`,
        name: seoConfig.business.name,
        image: seoConfig.site.logo,
        url: seoConfig.site.url,
        telephone: seoConfig.business.phone,
        email: seoConfig.business.email,
        priceRange: seoConfig.business.priceRange,
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Accra',
            addressRegion: 'Greater Accra',
            addressCountry: 'GH'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 5.6037,
            longitude: -0.1870
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ],
            opens: '00:00',
            closes: '23:59'
        },
        sameAs: [
            `https://twitter.com/${seoConfig.social.twitter.replace('@', '')}`,
            `https://instagram.com/${seoConfig.social.instagram.replace('@', '')}`,
            `https://facebook.com/${seoConfig.social.facebook}`
        ]
    };
}

/**
 * Medical Business Schema for health-related services
 */
export function generateMedicalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        '@id': `${seoConfig.site.url}/#medicalbusiness`,
        name: seoConfig.business.name,
        description: 'Confidential health products and self-test kits delivered discreetly across Ghana',
        url: seoConfig.site.url,
        logo: seoConfig.site.logo,
        image: seoConfig.site.logo,
        telephone: seoConfig.business.phone,
        email: seoConfig.business.email,
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Accra',
            addressRegion: 'Greater Accra',
            addressCountry: 'GH'
        },
        areaServed: {
            '@type': 'Country',
            name: 'Ghana'
        },
        medicalSpecialty: [
            'Sexual Health',
            'Preventive Medicine',
            'Public Health'
        ],
        availableService: [
            {
                '@type': 'MedicalTest',
                name: 'HIV Self-Testing',
                description: 'WHO-approved HIV self-test kits for private testing'
            },
            {
                '@type': 'MedicalTest',
                name: 'Pregnancy Testing',
                description: 'Reliable pregnancy test kits for home use'
            }
        ]
    };
}

/**
 * Service Schema for main offerings
 */
export function generateServiceSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${seoConfig.site.url}/#service`,
        name: 'Confidential Health Product Delivery',
        description: 'Anonymous delivery of health products, self-test kits, and wellness items across Ghana',
        provider: {
            '@type': 'Organization',
            name: seoConfig.business.name,
            url: seoConfig.site.url
        },
        areaServed: {
            '@type': 'Country',
            name: 'Ghana'
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Health Products',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'HIV Self-Test Kits'
                    }
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'Pregnancy Test Kits'
                    }
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'Emergency Contraception'
                    }
                }
            ]
        },
        serviceType: 'Health Product Delivery',
        providerMobility: 'dynamic',
        category: 'Healthcare',
        termsOfService: `${seoConfig.site.url}/terms`,
        slogan: 'Skip the awkward. We deliver discreetly.'
    };
}

/**
 * Website Schema with enhanced sitelinks
 */
export function generateEnhancedWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${seoConfig.site.url}/#website`,
        url: seoConfig.site.url,
        name: seoConfig.site.name,
        description: seoConfig.site.description,
        publisher: {
            '@id': `${seoConfig.site.url}/#organization`
        },
        inLanguage: 'en-GH',
        // Sitelinks Search Box
        potentialAction: [
            {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${seoConfig.site.url}/products?search={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
            }
        ],
        // Main navigation for sitelinks
        hasPart: [
            {
                '@type': 'WebPage',
                '@id': `${seoConfig.site.url}/products`,
                url: `${seoConfig.site.url}/products`,
                name: 'Products',
                description: 'Browse confidential health products and self-test kits'
            },
            {
                '@type': 'WebPage',
                '@id': `${seoConfig.site.url}/products/test-kits`,
                url: `${seoConfig.site.url}/products/test-kits`,
                name: 'Self-Test Kits',
                description: 'HIV, pregnancy, and other self-test kits'
            },
            {
                '@type': 'WebPage',
                '@id': `${seoConfig.site.url}/products/medication`,
                url: `${seoConfig.site.url}/products/medication`,
                name: 'Medication',
                description: 'Emergency contraception and medications'
            },
            {
                '@type': 'WebPage',
                '@id': `${seoConfig.site.url}/partner-care`,
                url: `${seoConfig.site.url}/partner-care`,
                name: 'Partner Care',
                description: 'Support services and couple testing'
            },
            {
                '@type': 'WebPage',
                '@id': `${seoConfig.site.url}/track`,
                url: `${seoConfig.site.url}/track`,
                name: 'Track Order',
                description: 'Track your anonymous order'
            }
        ]
    };
}

/**
 * FAQ Schema for rich snippets
 */
export function generateMainFAQSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${seoConfig.site.url}/#faq`,
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Is my order completely anonymous?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! We do not require accounts, names, or emails. We only collect a delivery location and phone number for the rider, which is masked and deleted 7 days after delivery. Your privacy is our core product.'
                }
            },
            {
                '@type': 'Question',
                name: 'How discreet is the packaging?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'All products are delivered in 100% plain, unbranded packaging. No logos, no health stickers, no indication of contents. It could be anything.'
                }
            },
            {
                '@type': 'Question',
                name: 'Do you deliver to university campuses?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! We deliver to University of Ghana (Legon), KNUST, UCC, UPSA, GIMPA, and other major campuses across Ghana. Students get special pricing and free delivery.'
                }
            },
            {
                '@type': 'Question',
                name: 'How accurate are the HIV self-test kits?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our HIV self-test kits are WHO-approved with 99% accuracy. They provide results in under 20 minutes and are the same kits used in clinics.'
                }
            },
            {
                '@type': 'Question',
                name: 'How long does delivery take?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Orders in Accra are typically delivered within 24-48 hours. Other regions may take 2-3 days. All deliveries are tracked anonymously.'
                }
            },
            {
                '@type': 'Question',
                name: 'What payment methods do you accept?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We accept Mobile Money (MTN, Vodafone, AirtelTigo) and credit/debit cards via Paystack. All payments are secure and private.'
                }
            },
            {
                '@type': 'Question',
                name: 'Can I return products?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Due to the medical and personal nature of our products, all sales are final. If a product arrives damaged, contact us with your order code for a replacement.'
                }
            },
            {
                '@type': 'Question',
                name: 'Do you sell prescription medications?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No, we do not sell prescription medications. We focus on over-the-counter health products, self-test kits, and wellness items that do not require prescriptions.'
                }
            }
        ]
    };
}

/**
 * Breadcrumb List Schema for navigation
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${seoConfig.site.url}${item.url}`
        }))
    };
}

/**
 * ItemList Schema for product categories
 */
export function generateItemListSchema(items: Array<{ name: string; url: string; image?: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: `${seoConfig.site.url}${item.url}`,
            ...(item.image && { image: item.image })
        }))
    };
}
