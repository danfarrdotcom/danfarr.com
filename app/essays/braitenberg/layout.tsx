import type { ReactNode } from 'react';

export default function BraitenbergLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="min-h-screen font-sans text-black">{children}</div>;
}
