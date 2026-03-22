import type { ReactNode } from 'react';
import Link from 'next/link';

import {
  getBraitenbergEntry,
  getBraitenbergLabel,
} from '../../lib/braitenberg/series';
import SeriesNav from './series-nav';
import VehicleDemonstration from './vehicle-demonstration';

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
      <article className="mx-auto max-w-[42rem]">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.28em] text-stone-700">
          <Link className="hover:text-black" href="/essays">
            Essays
          </Link>
          <Link className="hover:text-black" href="/essays/braitenberg">
            Series index
          </Link>
        </div>

        <header className="mb-14 border-b border-stone-300 pb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-700">
            {getBraitenbergLabel(entry)}
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-normal tracking-tight text-stone-950 md:text-5xl">
            {entry.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-black">
            {dek}
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-stone-700">
            {readingTime}
          </p>
        </header>

        <div className="space-y-14">
          <VehicleDemonstration slug={slug} />
          {children}
        </div>

        <SeriesNav slug={slug} />
      </article>
    </main>
  );
}
