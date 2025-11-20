// components/seo/tracking-scripts.tsx
"use client";

import { useEffect } from 'react';
import Script from 'next/script';
import seoConfig from '../../../.seo-config.json';

interface TrackingScriptsProps {
  googleAnalytics?: string;
  googleTagManager?: string;
  facebookPixel?: string;
  hotjar?: string;
}

export function TrackingScripts(props?: TrackingScriptsProps) {
  // Use props or fall back to environment variables or config
  const googleAnalytics = props?.googleAnalytics || 
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 
    seoConfig.tracking.googleAnalytics;
  
  const googleTagManager = props?.googleTagManager || 
    process.env.NEXT_PUBLIC_GTM_ID || 
    seoConfig.tracking.googleTagManager;
  
  const facebookPixel = props?.facebookPixel || 
    process.env.NEXT_PUBLIC_FB_PIXEL_ID || 
    seoConfig.tracking.facebookPixel;
  
  const hotjar = props?.hotjar || 
    process.env.NEXT_PUBLIC_HOTJAR_ID || 
    seoConfig.tracking.hotjar;

  return (
    <>
      {/* Google Analytics 4 */}
      {googleAnalytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalytics}', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true,
                // Enhanced e-commerce
                allow_enhanced_conversions: true,
                // Privacy settings
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
              
              // Enhanced e-commerce settings
              gtag('set', 'allow_google_signals', true);
              gtag('set', 'allow_ad_personalization_signals', true);
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {googleTagManager && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagManager}');
            `}
          </Script>
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManager}`}
              height="0" 
              width="0" 
              className="hidden"
            />
          </noscript>
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixel && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixel}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Hotjar */}
      {hotjar && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjar},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </>
  );
}