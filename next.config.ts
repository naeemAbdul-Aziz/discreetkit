
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
      }
    ],
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
