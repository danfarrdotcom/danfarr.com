import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Games — Dan Farr',
};

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black pb-32 pt-10 px-4 md:px-0 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <h1 className="font-serif italic text-2xl text-gray-900 dark:text-gray-100">
          Games
        </h1>
        <div className="flex flex-col gap-6">
          <Link
            href="/games/sand-wizard"
            className="group block transition-all relative pl-3 border-l-2 border-transparent hover:border-amber-400"
          >
            <div className="font-serif italic text-lg text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Sand Wizard
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Walk through the desert. Place sand. Survive.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
