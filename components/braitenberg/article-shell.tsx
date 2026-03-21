import type { ReactNode } from 'react';
import Link from 'next/link';

import {
  getBraitenbergEntry,
  getBraitenbergLabel,
  getBraitenbergPath,
} from '../../lib/braitenberg/series';
import SeriesNav from './series-nav';
import Logo from '../logo';

type ArticleShellProps = {
  slug: string;
  dek: string;
  readingTime: string;
  children: ReactNode;
};

export default function ArticleShell({
  slug,
  dek,
  readingTime,
  children,
}: ArticleShellProps) {
  const entry = getBraitenbergEntry(slug);

  if (!entry) {
    throw new Error(`Unknown Braitenberg entry: ${slug}`);
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-12">
      <article className="mx-auto max-w-[44rem]">
        <div className="mb-12 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black">
          <Link className="hover:text-black" href="/">
            {'< back'}
            <Logo />
          </Link>
          <span>/</span>
          <Link className="hover:text-black" href="/essays/braitenberg">
            Vehicles, Translated
          </Link>
        </div>

        <header className="mb-14 border-b border-stone-300 pb-10">
          <h1 className="max-w-2xl text-4xl font-normal tracking-tight text-stone-950">
            {entry.title}
          </h1>
          <p className="mt-6 max-w-2xl leading-9 text-black text-md">{dek}</p>
        </header>

        <div className="space-y-14">{children}</div>

        <SeriesNav slug={slug} />
      </article>
    </main>
  );
}
