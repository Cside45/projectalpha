import './globals.css';
import type { Metadata } from 'next';
import { ClientProviders } from '@/components/providers/client-providers';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SessionProvider } from '@/components/SessionProvider';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'YouTube Title Tool - Generate Algorithm-Friendly Video Titles',
    template: '%s | YouTube Title Tool'
  },
  description: 'Generate engaging, algorithm-friendly titles for your YouTube, Instagram, and TikTok videos using AI. Boost your content visibility and engagement.',
  keywords: ['youtube titles', 'video titles', 'title generator', 'SEO titles', 'social media optimization', 'content creation', 'AI title generator'],
  authors: [{ name: 'YouTube Title Tool' }],
  creator: 'YouTube Title Tool',
  publisher: 'YouTube Title Tool',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://youtubetitle.tool',
    siteName: 'YouTube Title Tool',
    title: 'YouTube Title Tool - Generate Algorithm-Friendly Video Titles',
    description: 'Generate engaging, algorithm-friendly titles for your YouTube, Instagram, and TikTok videos using AI. Boost your content visibility and engagement.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YouTube Title Tool Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Title Tool - Generate Algorithm-Friendly Video Titles',
    description: 'Generate engaging, algorithm-friendly titles for your YouTube, Instagram, and TikTok videos using AI.',
    images: ['/twitter-image.png'],
    creator: '@youtubetitletool',
  },
  alternates: {
    canonical: 'https://youtubetitle.tool',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ClientProviders>
            {children}
            <Navigation />
            <Toaster />
          </ClientProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
