import Link from 'next/link';

import {
  type BraitenbergSeriesEntry,
  getBraitenbergLabel,
  getBraitenbergNeighbors,
  getBraitenbergPath,
} from '../../lib/braitenberg/series';

type SeriesNavProps = {
  slug: string;
};

function NavCard({
  label,
  entry,
}: {
  label: string;
  entry?: BraitenbergSeriesEntry;
}) {
  if (!entry) {
    return (
      <div className="border-t border-stone-300 pt-4 text-sm text-black">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
          {label}
        </p>
        <p className="mt-3 text-[0.98rem] leading-7 text-stone-700">
          No entry here yet.
        </p>
      </div>
    );
  }

  const content = (
    <div className="border-t border-stone-300 pt-4 transition-colors">
      <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
        {label}
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-stone-700">
        {getBraitenbergLabel(entry)}
      </p>
      <p className="mt-3 text-2xl font-normal tracking-tight text-stone-950">
        {entry.title}
      </p>
      <p className="mt-2 text-[0.98rem] leading-7 text-stone-700">
        {entry.hook}
      </p>
      <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-stone-700">
        {entry.status === 'published' ? 'Open entry' : 'Coming soon'}
      </p>
    </div>
  );

  if (entry.status !== 'published') {
    return content;
  }

  return <Link href={getBraitenbergPath(entry.slug)}>{content}</Link>;
}

export default function SeriesNav({ slug }: SeriesNavProps) {
  const { previous, next } = getBraitenbergNeighbors(slug);

  return (
    <nav className="mt-16 border-t border-stone-300 pt-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-black">
          Continue the series
        </p>
        <Link
          className="text-sm text-black underline decoration-stone-300 underline-offset-4 hover:text-stone-950"
          href="/essays/braitenberg"
        >
          Series index
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <NavCard entry={previous} label="Previous" />
        <NavCard entry={next} label="Next" />
      </div>
    </nav>
  );
}
