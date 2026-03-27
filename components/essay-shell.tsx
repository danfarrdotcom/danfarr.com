import type { ReactNode } from 'react';
import Link from 'next/link';

type EssayShellProps = {
  title: string;
  dek: string;
  readingTime?: string;
  children: ReactNode;
};

export default function EssayShell({
  title,
  dek,
  readingTime,
  children,
}: EssayShellProps) {
  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-12">
      <article className="mx-auto max-w-[42rem]">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.28em] text-stone-700">
          <Link className="hover:text-black" href="/">
            Home
          </Link>
          <Link className="hover:text-black" href="/essays">
            Essays
          </Link>
        </div>

        <header className="mb-14 border-b border-stone-300 pb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-700">
            Essay
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-normal tracking-tight text-stone-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-black">
            {dek}
          </p>
          {readingTime ? (
            <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-stone-700">
              {readingTime}
            </p>
          ) : null}
        </header>

        <div className="space-y-14">{children}</div>
      </article>
    </main>
  );
}
