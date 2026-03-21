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
        <div className="mb-12 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black">
          <Link className="hover:text-black" href="/">
            Dan Farr
          </Link>
          <span>/</span>
          <span>Vehicles, Translated</span>
        </div>

        <header className="max-w-3xl border-b border-stone-300 pb-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-black">
            Notes after Braitenberg
          </p>
          <h1 className="mt-3 text-5xl font-normal tracking-tight md:text-6xl">
            Vehicles, Translated
          </h1>
          <p className="mt-6 text-[1.28rem] leading-9 text-black md:text-[1.45rem]">
            A series of interactive plates and essays that restage the core
            mechanisms from{' '}
            <em>Vehicles: Experiments in Synthetic Psychology</em> in a browser,
            with as little visual noise as possible.
          </p>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-7 text-black">
            The aim is not summary but reconstruction: simple loops, crossed
            wires, and the speed with which observers mistake mechanism for
            motive.
          </p>
        </header>

        <section className="mt-10">
          {entries.map((entry) => (
            <SeriesCard entry={entry} key={entry.slug} />
          ))}
        </section>
      </div>
    </main>
  );
}
