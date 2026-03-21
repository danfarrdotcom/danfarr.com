import Link from 'next/link';

import {
  type BraitenbergSeriesEntry,
  getBraitenbergLabel,
  getBraitenbergPath,
} from '../../lib/braitenberg/series';

type SeriesCardProps = {
  entry: BraitenbergSeriesEntry;
};

export default function SeriesCard({ entry }: SeriesCardProps) {
  const content = (
    <div className="border-t border-stone-300 py-5">
      <div className="grid gap-3 md:grid-cols-[8rem_minmax(0,1fr)_6rem] md:items-start">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-700">
          {getBraitenbergLabel(entry)}
        </p>
        <div>
          <h2 className="text-[1.5rem] font-normal tracking-tight text-stone-950">
            {entry.status === 'published' ? (
              <Link
                className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-stone-400"
                href={getBraitenbergPath(entry.slug)}
              >
                {entry.title}
              </Link>
            ) : (
              entry.title
            )}
          </h2>
          <p className="mt-2 text-[1.02rem] leading-7 text-black">
            {entry.hook}
          </p>
          <p className="mt-2 text-[0.98rem] leading-7 text-stone-700">
            {entry.description}
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700 md:pt-1 md:text-right">
          {entry.status === 'published' ? 'Read' : 'Planned'}
        </p>
      </div>
    </div>
  );

  if (entry.status !== 'published') {
    return content;
  }

  return content;
}
