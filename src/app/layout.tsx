
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { Chatbot } from '@/components/chatbot';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DiscreetKit Ghana - Confidential Self-Test Kits',
  description: 'Anonymous self-test kit ordering and delivery in Ghana. Private, fast, and reliable service for students and young professionals.',
  keywords: ['self-test kit', 'HIV test', 'pregnancy test', 'Ghana', 'anonymous testing', 'discreet delivery'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
       <head>
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', inter.variable)}>
        <div className="relative flex min-h-dvh flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Chatbot />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
