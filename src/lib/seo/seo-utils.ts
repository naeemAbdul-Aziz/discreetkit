// lib/seo/seo-utils.ts
/**
 * SEO utility functions for URL canonicalization, slug generation, and more
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Canonicalize a URL (remove trailing slashes, normalize)
 */
export function canonicalizeUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        // Remove trailing slash except for root
        if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
            urlObj.pathname = urlObj.pathname.slice(0, -1);
        }
        // Remove default ports
        if (
            (urlObj.protocol === 'http:' && urlObj.port === '80') ||
            (urlObj.protocol === 'https:' && urlObj.port === '443')
        ) {
            urlObj.port = '';
        }
        return urlObj.toString();
    } catch {
        return url;
    }
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, maxKeywords = 10): string[] {
    // Remove common stop words
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);

    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count word frequency
    const frequency: Record<string, number> = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(([word]) => word);
}

/**
 * Generate meta description from text
 */
export function generateMetaDescription(text: string, maxLength = 160): string {
    const cleaned = text.replace(/\s+/g, ' ').trim();

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    // Try to cut at a sentence boundary
    const sentences = cleaned.split(/[.!?]+/);
    let description = '';

    for (const sentence of sentences) {
        if ((description + sentence).length > maxLength - 3) {
            break;
        }
        description += sentence + '. ';
    }

    if (description.length > 0) {
        return description.trim();
    }

    // Fall back to cutting at word boundary
    return cleaned.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Validate structured data schema
 */
export function validateSchema(schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema['@context']) {
        errors.push('Missing @context property');
    }

    if (!schema['@type']) {
        errors.push('Missing @type property');
    }

    // Add more validation rules as needed

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Generate Open Graph image URL
 */
export function generateOgImageUrl(params: {
    title: string;
    description?: string;
    logo?: string;
}): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com';
    const searchParams = new URLSearchParams({
        title: params.title,
        ...(params.description && { description: params.description }),
        ...(params.logo && { logo: params.logo })
    });

    return `${baseUrl}/api/og?${searchParams.toString()}`;
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(text: string, wordsPerMinute = 200): number {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate title with optimal length for SEO
 */
export function generateSEOTitle(title: string, siteName: string, maxLength = 60): string {
    const fullTitle = `${title} | ${siteName}`;

    if (fullTitle.length <= maxLength) {
        return fullTitle;
    }

    // Try without site name
    if (title.length <= maxLength) {
        return title;
    }

    // Truncate title
    return title.substring(0, maxLength - 3) + '...';
}

/**
 * Check if URL is internal
 */
export function isInternalUrl(url: string, siteUrl: string): boolean {
    try {
        const urlObj = new URL(url, siteUrl);
        const siteUrlObj = new URL(siteUrl);
        return urlObj.hostname === siteUrlObj.hostname;
    } catch {
        return false;
    }
}

/**
 * Generate hreflang tags for multi-language support
 */
export function generateHreflangTags(currentUrl: string, languages: Array<{ code: string; url: string }>) {
    return languages.map(lang => ({
        rel: 'alternate',
        hreflang: lang.code,
        href: lang.url
    }));
}

/**
 * Sanitize text for SEO (remove HTML, special chars)
 */
export function sanitizeForSEO(text: string): string {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[^;]+;/g, '') // Remove HTML entities
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}
