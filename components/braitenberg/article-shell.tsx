import type { ReactNode } from 'react';
import Link from 'next/link';

import {
  getBraitenbergEntry,
  getBraitenbergLabel,
  getBraitenbergPath,
} from '../../lib/braitenberg/series';
import SeriesNav from './series-nav';

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
        <div className="mb-12 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-stone-500">
          <Link className="hover:text-stone-900" href="/">
            Dan Farr
          </Link>
          <span>/</span>
          <Link className="hover:text-stone-900" href="/scribbles/braitenberg">
            Vehicles, Translated
          </Link>
        </div>

        <header className="mb-14 border-b border-stone-300 pb-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-stone-500">
            {getBraitenbergLabel(entry)}
          </p>
          <h1 className="max-w-2xl text-4xl font-normal tracking-tight text-stone-950">
            {entry.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[1.38rem] leading-9 text-stone-700 md:text-[1.55rem]">
            {dek}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span>{readingTime}</span>
            <span>·</span>
            <span>Interactive figure essay</span>
            <Link
              className="text-stone-700 underline decoration-stone-300 underline-offset-4 hover:text-stone-950"
              href={getBraitenbergPath(slug)}
            >
              Permalink
            </Link>
          </div>
        </header>

        <div className="space-y-14">{children}</div>

        <SeriesNav slug={slug} />
      </article>
    </main>
  );
}
