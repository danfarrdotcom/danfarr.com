import { getSlotTypes } from '@/lib/meet/availability';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Meet Dan Farr',
  description: 'Book a meeting with Dan',
};

export default async function MeetPage() {
  const slotTypes = await getSlotTypes();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Meet with Dan</h1>
      <p className="text-gray-500 mb-8">Pick a meeting type to get started</p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {slotTypes.map((st) => (
          <Link
            key={st.id}
            href={`/meet/${st.slug}`}
            className="border rounded-lg p-6 hover:border-blue-500 transition-colors"
          >
            <h2 className="text-lg font-semibold">{st.title}</h2>
            <p className="text-sm text-gray-500">
              {st.duration_minutes} minutes
            </p>
            {st.description && (
              <p className="text-sm text-gray-400 mt-1">{st.description}</p>
            )}
          </Link>
        ))}

        {!slotTypes.length && (
          <p className="text-gray-400 text-center">
            No meeting types available right now.
          </p>
        )}
      </div>
    </div>
  );
}
