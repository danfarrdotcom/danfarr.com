import type { ReactNode } from 'react';

export default function BraitenbergLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen text-stone-900"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {children}
    </div>
  );
}
