'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type SlotType = {
  id: string;
  title: string;
  duration_minutes: number;
  slug: string;
  description: string | null;
};

function Calendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (date: string) => void;
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = viewDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function toDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isPast(day: number) {
    return new Date(year, month, day) < today;
  }

  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 text-gray-500 hover:text-gray-800"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 text-gray-500 hover:text-gray-800"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = toDateStr(day);
          const past = isPast(day);
          const isSelected = dateStr === selected;
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => onSelect(dateStr)}
              className={`p-2 rounded-lg text-sm ${
                past
                  ? 'text-gray-300 cursor-not-allowed'
                  : isSelected
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [slotType, setSlotType] = useState<SlotType | null>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ meetLink?: string } | null>(null);

  useEffect(() => {
    if (!date || !slug) return;
    fetch(`/api/meet/slots?slug=${slug}&date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots ?? []);
        setSlotType(d.slotType ?? null);
        setSelected('');
      });
  }, [date, slug]);

  async function handleBook() {
    setLoading(true);
    const res = await fetch('/api/meet/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        date,
        time: selected,
        guestName: name,
        guestEmail: email,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult(data);
    else alert(data.error || 'Booking failed');
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Booking confirmed!</h1>
        <p className="text-gray-500 mb-2">
          {slotType?.title} on {new Date(selected).toLocaleString()}
        </p>
        {result.meetLink && (
          <a
            href={result.meetLink}
            target="_blank"
            className="text-blue-500 underline"
          >
            Join Google Meet
          </a>
        )}
        <p className="text-gray-400 text-sm mt-4">
          Check your email for confirmation and manage links.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8 pt-16">
      <h1 className="text-2xl font-bold mb-1">
        {slotType?.title ?? 'Book a meeting'}
      </h1>
      {slotType && (
        <p className="text-gray-500 mb-6">{slotType.duration_minutes} min</p>
      )}

      <div className="w-full max-w-lg flex flex-col md:flex-row gap-8 items-start justify-center">
        <Calendar selected={date} onSelect={setDate} />

        <div className="flex-1 min-w-0">
          {!date && (
            <p className="text-gray-400 text-sm">Select a date to see times</p>
          )}

          {date && slots.length === 0 && (
            <p className="text-gray-400 text-sm">No slots on this date</p>
          )}

          {date && slots.length > 0 && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  className={`p-2 rounded-lg border text-sm text-left ${
                    selected === s
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'hover:border-blue-400'
                  }`}
                >
                  {new Date(s).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="w-full max-w-md flex flex-col gap-4 mt-8">
          <div>
            <label className="block text-sm font-medium mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Your email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="jane@example.com"
            />
          </div>
          <button
            onClick={handleBook}
            disabled={loading || !name || !email}
            className="bg-blue-500 text-white rounded-lg p-3 font-medium disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Confirm booking'}
          </button>
        </div>
      )}
    </div>
  );
}
