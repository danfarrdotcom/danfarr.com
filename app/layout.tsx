import '../styles/globals.css';

import { Lexend } from 'next/font/google';

const schibsted = Lexend({ subsets: ['latin'] });

export const metadata = {
  title: 'Dan Farr',
  description:
    'Developer, skeptical optimist, Currently working as a tech lead at Bluecrest Wellness I like empowering teams, sharing knowledge, and driving innovation.',
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
