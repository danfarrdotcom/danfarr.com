import Link from 'next/link';

export type EssayEntry = {
  slug: string;
  title: string;
  hook: string;
  description: string;
  status: 'published' | 'draft' | 'planned';
  label?: string;
};

type EssayCardProps = {
  entry: EssayEntry;
};

export default function EssayCard({ entry }: EssayCardProps) {
  return (
    <Link className="block" href={`/essays/${entry.slug}`}>
      <div className="flex flex-col p-4 max-w-[100%] md:max-w-[85%] w-fit overflow-hidden bg-zinc-100 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:shadow-none !max-w-[450px] rounded-[20px] items-start gap-y-4 transition-colors">
        {/* {entry.label && (
          <div className="text-[11px] hover:blue-400 uppercase tracking-[0.28em] text-black">
            {entry.label}
          </div>
        )} */}
        <div>
          <h2 className="font-serif font-semibold italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link
              className="hover:text-blue-600"
              href={`/essays/${entry.slug}`}
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
      </div>
    </Link>
  );
}
