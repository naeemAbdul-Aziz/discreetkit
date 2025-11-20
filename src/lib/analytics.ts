// lib/analytics.ts
/**
 * Analytics utility functions for tracking user interactions and conversions
 * Supports Google Analytics 4, Google Tag Manager, and custom events
 */

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

/**
 * Send a custom event to Google Analytics
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventParams);
    }
}

/**
 * Track page views
 */
export function trackPageView(url: string, title?: string) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
            page_path: url,
            page_title: title,
        });
    }
}

/**
 * E-commerce tracking: View item
 */
export function trackViewItem(item: {
    id: string;
    name: string;
    category: string;
    price: number;
    currency?: string;
}) {
    trackEvent('view_item', {
        currency: item.currency || 'GHS',
        value: item.price,
        items: [
            {
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                price: item.price,
            },
        ],
    });
}

/**
 * E-commerce tracking: Add to cart
 */
export function trackAddToCart(item: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    currency?: string;
}) {
    trackEvent('add_to_cart', {
        currency: item.currency || 'GHS',
        value: item.price * item.quantity,
        items: [
            {
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                price: item.price,
                quantity: item.quantity,
            },
        ],
    });
}

/**
 * E-commerce tracking: Remove from cart
 */
export function trackRemoveFromCart(item: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    currency?: string;
}) {
    trackEvent('remove_from_cart', {
        currency: item.currency || 'GHS',
        value: item.price * item.quantity,
        items: [
            {
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                price: item.price,
                quantity: item.quantity,
            },
        ],
    });
}

/**
 * E-commerce tracking: Begin checkout
 */
export function trackBeginCheckout(items: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
}>, totalValue: number, currency = 'GHS') {
    trackEvent('begin_checkout', {
        currency,
        value: totalValue,
        items: items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity,
        })),
    });
}

/**
 * E-commerce tracking: Purchase
 */
export function trackPurchase({
    transactionId,
    value,
    currency = 'GHS',
    tax,
    shipping,
    items,
    paymentMethod,
}: {
    transactionId: string;
    value: number;
    currency?: string;
    tax?: number;
    shipping?: number;
    items: Array<{
        id: string;
        name: string;
        category: string;
        price: number;
        quantity: number;
    }>;
    paymentMethod?: string;
}) {
    trackEvent('purchase', {
        transaction_id: transactionId,
        value,
        currency,
        tax,
        shipping,
        payment_method: paymentMethod,
        items: items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity,
        })),
    });
}

/**
 * Track search queries
 */
export function trackSearch(searchTerm: string) {
    trackEvent('search', {
        search_term: searchTerm,
    });
}

/**
 * Track user engagement
 */
export function trackEngagement(engagementType: string, details?: Record<string, any>) {
    trackEvent('user_engagement', {
        engagement_type: engagementType,
        ...details,
    });
}

/**
 * Track outbound links
 */
export function trackOutboundLink(url: string, linkText?: string) {
    trackEvent('click', {
        event_category: 'outbound',
        event_label: url,
        link_text: linkText,
    });
}

/**
 * Track form submissions
 */
export function trackFormSubmission(formName: string, formData?: Record<string, any>) {
    trackEvent('form_submit', {
        form_name: formName,
        ...formData,
    });
}

/**
 * Track video interactions
 */
export function trackVideoInteraction(action: 'play' | 'pause' | 'complete', videoName: string, progress?: number) {
    trackEvent('video_' + action, {
        video_name: videoName,
        video_progress: progress,
    });
}

/**
 * Track file downloads
 */
export function trackFileDownload(fileName: string, fileType: string) {
    trackEvent('file_download', {
        file_name: fileName,
        file_type: fileType,
    });
}

/**
 * Track social shares
 */
export function trackSocialShare(platform: string, contentType: string, contentId?: string) {
    trackEvent('share', {
        method: platform,
        content_type: contentType,
        content_id: contentId,
    });
}

/**
 * Track newsletter signups
 */
export function trackNewsletterSignup(source?: string) {
    trackEvent('newsletter_signup', {
        source,
    });
}

/**
 * Track custom conversions
 */
export function trackConversion(conversionName: string, value?: number, currency = 'GHS') {
    trackEvent('conversion', {
        conversion_name: conversionName,
        value,
        currency,
    });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('set', 'user_properties', properties);
    }
}

/**
 * Set user ID for cross-device tracking
 */
export function setUserId(userId: string) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
            user_id: userId,
        });
    }
}
