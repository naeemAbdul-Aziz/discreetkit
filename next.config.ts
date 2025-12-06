import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint config removed (unsupported in Next.js 16)
  // Next.js 15: serverComponentsExternalPackages moved to serverExternalPackages
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/core',
    '@genkit-ai/googleai',
    '@opentelemetry/sdk-node',
    'handlebars',
    'dotprompt',
    'react-joyride'
  ],
  // Turbopack configuration (Next.js 15+)
  turbopack: {
    resolveAlias: {
      // Polyfill or ignore node modules for client-side if needed
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }

    // Exclude problematic packages from bundling
    config.externals = config.externals || [];
    config.externals.push({
      'react-joyride': 'react-joyride',
      '@genkit-ai/core': '@genkit-ai/core',
      '@genkit-ai/googleai': '@genkit-ai/googleai',
      'genkit': 'genkit',
      '@opentelemetry/sdk-node': 'commonjs @opentelemetry/sdk-node',
      'handlebars': 'commonjs handlebars',
      'dotprompt': 'commonjs dotprompt',
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.paystack.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          // Keep conservative to avoid breaking embeds; extend as needed
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
      // Common icon aliases browsers request
      {
        source: '/apple-touch-icon.png',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
      {
        source: '/apple-touch-icon-precomposed.png',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
      {
        source: '/android-chrome-192x192.png',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
      {
        source: '/android-chrome-512x512.png',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
      {
        source: '/icon-192x192.png',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
      {
        source: '/icon-512x512.png',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
      {
        source: '/mstile-150x150.png',
        destination: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png',
      },
    ];
  },
};

export default nextConfig;
