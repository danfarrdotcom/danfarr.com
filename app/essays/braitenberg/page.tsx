import type { Metadata } from 'next';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

import SeriesCard from '../../../components/braitenberg/series-card';
import { getBraitenbergSeries } from '../../../lib/braitenberg/series';
import Logo from '../../../components/logo';

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
          <Link
            className="group flex items-center gap-2 hover:text-black"
            href="/"
          >
            <FaArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />
            <Logo />
          </Link>
        </div>

        <header className="max-w-3xl border-b border-stone-300 pb-10">
          <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-6xl">
            Vehicles
          </h1>
          <p className="mt-6 text-lg font-sans text-black md:text-md">
            <i>Vehicles: Experiments in Synthetic Psychology</i>, written by
            Valentino Braitenberg in 1984, has had a lasting influence on how we
            think about the elationship between simplicity and complexity.
          </p>
          <p className="mt-6 text-lg font-sans text-black md:text-md">
            Braitenberg’s deceptively simple “vehicles” revealed how intricate,
            lifelike behaviors can emerge from minimal underlying mechanisms and
            how readily we project intention, emotion or intelligence onto them.
          </p>
          <p className="mt-6 text-lg font-sans text-black md:text-md">
            This article series revisits that foundational work. It aims to
            reconstruct and explore several of Braitenberg’s core experiments,
            not just as historical artifacts, but as living ideas that continue
            to shape fields like robotics, cognitive science and artificial
            intelligence. By restaging these mechanisms, we can better
            understand both their original insight and their enduring relevance
            today.
          </p>
        </header>

        <section className="mt-10 gap-y-4 flex flex-col">
          {entries.map((entry) => (
            <SeriesCard entry={entry} key={entry.slug} />
          ))}
        </section>
      </div>
    </main>
  );
}
