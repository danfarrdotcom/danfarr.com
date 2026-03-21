import type { Metadata } from 'next';
import Link from 'next/link';

import SeriesCard from '../../../components/braitenberg/series-card';
import { getBraitenbergSeries } from '../../../lib/braitenberg/series';

export const metadata: Metadata = {
  title: 'Vehicles, Translated',
  description:
    'A Braitenberg-inspired series of interactive essays about simple mechanisms, emergent behavior, and synthetic psychology.',
};

export default function BraitenbergSeriesPage() {
  const entries = getBraitenbergSeries();

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-[48rem]">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.28em] text-stone-700">
          <Link className="hover:text-black" href="/essays">
            Essays
          </Link>
          <Link className="hover:text-black" href="/">
            Home
          </Link>
        </div>

        <header className="max-w-3xl border-b border-stone-300 pb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-700">
            Vehicles, Translated
          </p>
          <h1 className="mt-4 text-3xl font-normal tracking-tight md:text-6xl">
            Vehicles
          </h1>
          <p className="mt-4 text-[1.05rem] italic leading-8 text-stone-700">
            Notes toward an interactive translation of{' '}
            <span className="not-italic">
              Valentino Braitenberg&apos;s 1984 book.
            </span>
          </p>
          <p className="mt-6 text-[1.08rem] leading-8 text-black">
            <i>Vehicles: Experiments in Synthetic Psychology</i>, written by
            Valentino Braitenberg in 1984, has had a lasting influence on how we
            think about the relationship between simplicity and complexity.
          </p>
          <p className="mt-6 text-[1.08rem] leading-8 text-black">
            Braitenberg’s deceptively simple “vehicles” revealed how intricate,
            lifelike behaviors can emerge from minimal underlying mechanisms and
            how readily we project intention, emotion or intelligence onto them.
          </p>
          <p className="mt-6 text-[1.08rem] leading-8 text-black">
            This article series revisits that foundational work. It aims to
            reconstruct and explore several of Braitenberg’s core experiments,
            not just as historical artifacts, but as living ideas that continue
            to shape fields like robotics, cognitive science and artificial
            intelligence. By restaging these mechanisms, we can better
            understand both their original insight and their enduring relevance
            today.
          </p>
        </header>

        <section className="mt-10 flex flex-col">
          {entries.map((entry) => (
            <SeriesCard entry={entry} key={entry.slug} />
          ))}
        </section>
      </div>
    </main>
  );
}
