// components/seo/performance-monitoring.tsx
'use client';

import { useEffect } from 'react';

/**
 * Performance monitoring component for Core Web Vitals
 * Tracks LCP, FID, CLS, FCP, and TTFB
 */
export function PerformanceMonitoring() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Report Web Vitals to analytics
    const reportWebVitals = (metric: any) => {
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
      }
    };

    // Import web-vitals dynamically
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportWebVitals);
      onFID(reportWebVitals);
      onFCP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
      onINP(reportWebVitals);
    });
  }, []);

  return null;
}

/**
 * Custom performance metrics
 */
export function trackCustomPerformance(metricName: string, value: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'custom_performance', {
      event_category: 'Performance',
      metric_name: metricName,
      value: Math.round(value),
      non_interaction: true,
    });
  }
}

/**
 * Track resource loading times
 */
export function trackResourceTiming() {
  if (typeof window === 'undefined' || !window.performance) return;

  const resources = window.performance.getEntriesByType('resource');
  
  resources.forEach((resource: any) => {
    if (resource.initiatorType === 'img' || resource.initiatorType === 'script' || resource.initiatorType === 'css') {
      trackCustomPerformance(`${resource.initiatorType}_load_time`, resource.duration);
    }
  });
}
