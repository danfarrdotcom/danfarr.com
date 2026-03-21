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
  const card = (
    <div className="grid gap-2 border-b border-stone-300 py-5 md:grid-cols-[8rem_1fr_auto] md:items-start md:gap-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-black">
        {getBraitenbergLabel(entry)}
      </div>
      <div>
        <h2 className="text-[1.6rem] font-normal tracking-tight text-stone-950">
          {entry.title}
        </h2>
        <p className="mt-2 text-[1.02rem] leading-7 text-black">{entry.hook}</p>
        <p className="mt-2 text-[0.95rem] leading-6 text-black">
          {entry.description}
        </p>
      </div>
      <div className="text-[11px] uppercase tracking-[0.24em] text-black md:pt-1">
        {entry.status}
      </div>
    </div>
  );

  if (entry.status !== 'published') {
    return card;
  }

  return (
    <Link className="block" href={getBraitenbergPath(entry.slug)}>
      {card}
    </Link>
  );
}
