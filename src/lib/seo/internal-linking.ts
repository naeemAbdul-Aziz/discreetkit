// lib/seo/internal-linking.ts
/**
 * Internal linking strategy utilities
 * Helps improve SEO by creating contextual links between related content
 */

export interface LinkSuggestion {
    text: string;
    url: string;
    relevance: number;
}

/**
 * Product categories for internal linking
 */
export const productCategories = {
    'test-kits': {
        name: 'Self-Test Kits',
        url: '/products/test-kits',
        keywords: ['hiv test', 'pregnancy test', 'self-test', 'testing kit', 'at-home test']
    },
    'medication': {
        name: 'Emergency Contraception & Medication',
        url: '/products/medication',
        keywords: ['postpill', 'emergency contraception', 'medication', 'contraceptive', 'morning after pill']
    },
    'wellness': {
        name: 'Wellness Products',
        url: '/products/wellness',
        keywords: ['wellness', 'supplements', 'health products', 'vitamins', 'nutrition']
    },
    'bundles': {
        name: 'Product Bundles',
        url: '/products/bundles',
        keywords: ['bundle', 'package', 'combo', 'set', 'collection']
    },
    'partner-care': {
        name: 'Partner Care',
        url: '/partner-care',
        keywords: ['partner', 'couple', 'relationship', 'together', 'duo']
    }
};

/**
 * Service area pages for local SEO
 */
export const serviceAreas = [
    { name: 'Accra', url: '/locations/accra', keywords: ['accra', 'greater accra'] },
    { name: 'Kumasi', url: '/locations/kumasi', keywords: ['kumasi', 'ashanti'] },
    { name: 'University of Ghana', url: '/universities/ug-legon', keywords: ['ug', 'legon', 'university of ghana'] },
    { name: 'KNUST', url: '/universities/knust', keywords: ['knust', 'kwame nkrumah'] },
];

/**
 * Generate internal link suggestions based on content
 */
export function generateLinkSuggestions(content: string, currentUrl: string): LinkSuggestion[] {
    const suggestions: LinkSuggestion[] = [];
    const contentLower = content.toLowerCase();

    // Check product categories
    Object.entries(productCategories).forEach(([key, category]) => {
        if (category.url === currentUrl) return; // Don't link to current page

        let relevance = 0;
        category.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = contentLower.match(regex);
            if (matches) {
                relevance += matches.length;
            }
        });

        if (relevance > 0) {
            suggestions.push({
                text: category.name,
                url: category.url,
                relevance
            });
        }
    });

    // Check service areas
    serviceAreas.forEach(area => {
        if (area.url === currentUrl) return;

        let relevance = 0;
        area.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = contentLower.match(regex);
            if (matches) {
                relevance += matches.length * 2; // Higher weight for location keywords
            }
        });

        if (relevance > 0) {
            suggestions.push({
                text: `Delivery to ${area.name}`,
                url: area.url,
                relevance
            });
        }
    });

    // Sort by relevance
    return suggestions.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Get related products based on category
 */
export function getRelatedProductLinks(category: string): Array<{ text: string; url: string }> {
    const related: Array<{ text: string; url: string }> = [];

    switch (category) {
        case 'test-kits':
            related.push(
                { text: 'Emergency Contraception', url: '/products/medication' },
                { text: 'Wellness Products', url: '/products/wellness' },
                { text: 'Partner Care Services', url: '/partner-care' }
            );
            break;
        case 'medication':
            related.push(
                { text: 'Self-Test Kits', url: '/products/test-kits' },
                { text: 'Wellness Products', url: '/products/wellness' },
                { text: 'Product Bundles', url: '/products/bundles' }
            );
            break;
        case 'wellness':
            related.push(
                { text: 'Self-Test Kits', url: '/products/test-kits' },
                { text: 'Emergency Contraception', url: '/products/medication' },
                { text: 'Product Bundles', url: '/products/bundles' }
            );
            break;
        default:
            related.push(
                { text: 'All Products', url: '/products' },
                { text: 'Self-Test Kits', url: '/products/test-kits' },
                { text: 'Emergency Contraception', url: '/products/medication' }
            );
    }

    return related;
}

/**
 * Generate contextual footer links
 */
export function getContextualFooterLinks(pathname: string): Array<{ text: string; url: string }> {
    const links: Array<{ text: string; url: string }> = [];

    // Always include main categories
    links.push(
        { text: 'Self-Test Kits', url: '/products/test-kits' },
        { text: 'Emergency Contraception', url: '/products/medication' },
        { text: 'Wellness Products', url: '/products/wellness' }
    );

    // Add location-specific links if not on location page
    if (!pathname.includes('/locations/')) {
        links.push(
            { text: 'Delivery in Accra', url: '/locations/accra' },
            { text: 'Delivery in Kumasi', url: '/locations/kumasi' }
        );
    }

    // Add university links if not on university page
    if (!pathname.includes('/universities/')) {
        links.push(
            { text: 'UG Legon Delivery', url: '/universities/ug-legon' },
            { text: 'KNUST Delivery', url: '/universities/knust' }
        );
    }

    return links;
}
