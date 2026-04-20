import '../styles/globals.css';

import { Lexend } from 'next/font/google';

const schibsted = Lexend({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Dan Farr',
    template: '%s | Dan Farr',
  },
  description:
    'Dan Farr — technical lead, developer, and skeptical optimist. Writing about cybernetics, distributed systems, and bionics applied to software engineering.',
  keywords: [
    'Dan Farr',
    'software engineer',
    'technical lead',
    'cybernetics',
    'distributed systems',
    'bionics',
    'Bluecrest Wellness',
  ],
  authors: [{ name: 'Dan Farr', url: 'https://danfarr.com' }],
  metadataBase: new URL('https://danfarr.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://danfarr.com',
    siteName: 'Dan Farr',
    title: 'Dan Farr',
    description:
      'Technical lead, developer, and skeptical optimist. Writing about cybernetics, distributed systems, and emergent behaviour in software.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Dan Farr' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dan Farr',
    description:
      'Technical lead, developer, and skeptical optimist. Writing about cybernetics, distributed systems, and emergent behaviour in software.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${schibsted.className} w-full flex flex-col`}>
        {children}
        <footer className="text-center w-full h-16"></footer>
      </body>
    </html>
  );
}
