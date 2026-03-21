import type { Metadata } from 'next';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

import EssayCard, { EssayEntry } from '../../components/essay-card';
import Logo from '../../components/logo';

export const metadata: Metadata = {
  title: 'Essays',
  description: 'A collection of interactive essays and articles.',
};

const entries: EssayEntry[] = [
  {
    slug: 'braitenberg',
    title: 'Vehicles',
    hook: 'Simple mechanisms, emergent behavior.',
    description:
      'A Braitenberg-inspired series of interactive essays about simple sensorimotor loops and synthetic psychology.',
    status: 'published',
    label: 'Series',
  },
  {
    slug: 'memory-without-a-brain',
    title: 'Memory without a brain',
    hook: "Ants don't understand how to read maps.",
    description:
      'Explaining stigmergy: how write-only memory creates complex, adaptive behavior in ant colonies and what it means for AI.',
    status: 'published',
    label: 'Cybernetics',
  },
  {
    slug: 'the-shape-of-a-flock',
    title: 'The shape of a flock',
    hook: 'Choreography without a choreographer.',
    description:
      'How local rules create global patterns in starling murmurations, and why robust systems often lack a central controller.',
    status: 'published',
    label: 'Complexity',
  },
];

export default function EssaysPage() {
  return (
    <div
      className="min-h-screen text-black"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
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
            <h1 className="mt-3 text-3xl font-normal tracking-tight md:text-5xl">
              Essays
            </h1>
            <p className="mt-6 text-lg font-sans text-black md:text-md">
              Writings on cybernetics, distributed systems, and the intersection
              of biology and software engineering.
            </p>
          </header>

          <section className="mt-10 flex flex-col gap-6">
            {entries.map((entry) => (
              <EssayCard key={entry.slug} entry={entry} />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
