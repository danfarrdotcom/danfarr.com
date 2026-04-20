import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ScrumBananas — Banana Throwing Game',
  description:
    'Hurl bananas at unsuspecting office workers in this pixel-art slingshot game. Dodge obstacles, rack up combos, and survive the open-plan office.',
  openGraph: {
    title: 'ScrumBananas',
    description:
      'Hurl bananas at unsuspecting office workers in this pixel-art slingshot game.',
    images: [
      {
        url: '/games/bananas/og.png',
        width: 1536,
        height: 1024,
        alt: 'ScrumBananas — banana throwing game',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScrumBananas',
    description:
      'Hurl bananas at unsuspecting office workers in this pixel-art slingshot game.',
    images: ['/games/bananas/og.png'],
  },
};

export default function BananasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
