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
    <div className="flex flex-col p-4 max-w-[100%] md:max-w-[85%] w-fit overflow-hidden bg-zinc-100 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:shadow-none !max-w-[450px] rounded-[20px] items-start gap-y-4">
      <div className="text-[11px] hover:blue-400 uppercase tracking-[0.28em] text-black">
        {getBraitenbergLabel(entry)}
      </div>
      <div>
        <h2 className="font-serif font-semibold italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Link
            className="hover:text-blue-600"
            href={getBraitenbergPath(entry.slug)}
          >
            {entry.title}
          </Link>
        </h2>
        <p className="mt-2 text-[1.02rem] font-sans leading-7 text-black">
          {entry.hook}
        </p>
        <p className="mt-2 text-[0.95rem] font-sans leading-6 text-black">
          {entry.description}
        </p>
      </div>
      {/* <div className="text-[11px] uppercase tracking-[0.24em] text-black md:pt-1">
        {entry.status}
      </div> */}
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
