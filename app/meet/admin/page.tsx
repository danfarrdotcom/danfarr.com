'use client';

import { useState, useEffect, useCallback } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Rule = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
};

type SlotTypeRow = {
  id?: string;
  title: string;
  duration_minutes: number;
  buffer_minutes: number;
  slug: string;
  description: string;
  active: boolean;
};

type Booking = {
  id: string;
  guest_name: string;
  guest_email: string;
  starts_at: string;
  ends_at: string;
  google_meet_link: string | null;
  slot_types: { title: string } | null;
};

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/meet/admin');
    if (!res.ok) {
      setError('Unauthorized — sign in first');
      return;
    }
    setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function action(body: any) {
    await fetch('/api/meet/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    load();
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <a href="/api/auth/signin" className="text-blue-500 underline">
          Sign in with Google
        </a>
      </div>
    );
  }

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Meet Admin</h1>

      {/* Availability Rules */}
      <Section title="Availability Rules">
        {(data.rules as Rule[]).map((r) => (
          <div key={r.id} className="flex items-center gap-3 text-sm">
            <span className="w-10">{DAYS[r.day_of_week]}</span>
            <span>
              {r.start_time} – {r.end_time}
            </span>
            <button
              onClick={() => action({ action: 'delete_rule', id: r.id })}
              className="text-red-400 text-xs"
            >
              remove
            </button>
          </div>
        ))}
        <AddRuleForm onAdd={(r) => action({ action: 'upsert_rule', ...r })} />
      </Section>

      {/* Slot Types */}
      <Section title="Meeting Types">
        {(data.slotTypes as SlotTypeRow[]).map((st) => (
          <div key={st.id} className="text-sm">
            <span className="font-medium">{st.title}</span> — {st.duration_minutes}min
            {st.buffer_minutes > 0 && ` (+${st.buffer_minutes}min buffer)`}
            — /{st.slug} {!st.active && '(inactive)'}
          </div>
        ))}
        <AddSlotTypeForm
          onAdd={(st) => action({ action: 'upsert_slot_type', ...st })}
        />
      </Section>

      {/* Synced Calendars */}
      <Section title="Synced Calendars">
        <p className="text-xs text-gray-400 mb-1">
          Add Google Calendar IDs to block busy times from. &quot;primary&quot; is always included.
        </p>
        {(data.syncedCalendars ?? []).map((c: any) => (
          <div key={c.id} className="flex items-center gap-3 text-sm">
            <span>{c.label || c.calendar_id}</span>
            <button
              onClick={() => action({ action: 'delete_synced_calendar', id: c.id })}
              className="text-red-400 text-xs"
            >
              remove
            </button>
          </div>
        ))}
        <AddCalendarForm
          onAdd={(c) => action({ action: 'upsert_synced_calendar', ...c })}
        />
      </Section>

      {/* Upcoming Bookings */}
      <Section title="Upcoming Bookings">
        {(data.bookings as Booking[]).length === 0 && (
          <p className="text-gray-400 text-sm">No upcoming bookings</p>
        )}
        {(data.bookings as Booking[]).map((b) => (
          <div key={b.id} className="text-sm flex items-center gap-3">
            <span>
              {new Date(b.starts_at).toLocaleString()} — {b.guest_name} (
              {b.guest_email})
            </span>
            {b.google_meet_link && (
              <a
                href={b.google_meet_link}
                target="_blank"
                className="text-blue-500 text-xs"
              >
                Meet
              </a>
            )}
            <button
              onClick={() => action({ action: 'cancel_booking', id: b.id })}
              className="text-red-400 text-xs"
            >
              cancel
            </button>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function AddRuleForm({ onAdd }: { onAdd: (r: Omit<Rule, 'id'>) => void }) {
  const [day, setDay] = useState(1);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');

  return (
    <div className="flex items-end gap-2 mt-2">
      <select
        value={day}
        onChange={(e) => setDay(Number(e.target.value))}
        className="border rounded p-1 text-sm"
      >
        {DAYS.map((d, i) => (
          <option key={i} value={i}>{d}</option>
        ))}
      </select>
      <input
        type="time"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border rounded p-1 text-sm"
      />
      <input
        type="time"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="border rounded p-1 text-sm"
      />
      <button
        onClick={() =>
          onAdd({
            day_of_week: day,
            start_time: start,
            end_time: end,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
        }
        className="bg-blue-500 text-white rounded px-3 py-1 text-sm"
      >
        Add
      </button>
    </div>
  );
}

function AddSlotTypeForm({
  onAdd,
}: {
  onAdd: (st: Omit<SlotTypeRow, 'id'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [slug, setSlug] = useState('');

  return (
    <div className="flex items-end gap-2 mt-2 flex-wrap">
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
        }}
        className="border rounded p-1 text-sm"
      />
      <input
        type="number"
        placeholder="Min"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="border rounded p-1 text-sm w-16"
      />
      <input
        type="number"
        placeholder="Buffer"
        value={buffer}
        onChange={(e) => setBuffer(Number(e.target.value))}
        className="border rounded p-1 text-sm w-16"
        title="Buffer minutes between meetings"
      />
      <button
        onClick={() => {
          if (!title || !slug) return;
          onAdd({
            title,
            duration_minutes: duration,
            buffer_minutes: buffer,
            slug,
            description: '',
            active: true,
          });
          setTitle('');
          setSlug('');
          setBuffer(0);
        }}
        className="bg-blue-500 text-white rounded px-3 py-1 text-sm"
      >
        Add
      </button>
    </div>
  );
}

function AddCalendarForm({
  onAdd,
}: {
  onAdd: (c: { calendar_id: string; label: string }) => void;
}) {
  const [calId, setCalId] = useState('');
  const [label, setLabel] = useState('');

  return (
    <div className="flex items-end gap-2 mt-2">
      <input
        placeholder="Calendar ID (e.g. user@gmail.com)"
        value={calId}
        onChange={(e) => setCalId(e.target.value)}
        className="border rounded p-1 text-sm flex-1"
      />
      <input
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="border rounded p-1 text-sm w-24"
      />
      <button
        onClick={() => {
          if (!calId) return;
          onAdd({ calendar_id: calId, label });
          setCalId('');
          setLabel('');
        }}
        className="bg-blue-500 text-white rounded px-3 py-1 text-sm"
      >
        Add
      </button>
    </div>
  );
}
