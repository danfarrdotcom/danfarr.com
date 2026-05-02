'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function ManageInner() {
  const params = useSearchParams();
  const id = params.get('id');
  const token = params.get('token');
  const initialAction = params.get('action'); // 'cancel' or 'reschedule'

  const [booking, setBooking] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'done' | 'error'>('loading');
  const [message, setMessage] = useState('');

  // Reschedule state
  const [rescheduling, setRescheduling] = useState(initialAction === 'reschedule');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (!id || !token) {
      setStatus('error');
      setMessage('Invalid link');
      return;
    }
    // Fetch booking details
    fetch(`/api/meet/manage/details?id=${id}&token=${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setBooking(d.booking);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Booking not found or already cancelled');
      });
  }, [id, token]);

  useEffect(() => {
    if (!date || !booking) return;
    fetch(`/api/meet/slots?slug=${booking.slug}&date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots ?? []);
        setSelected('');
      });
  }, [date, booking]);

  async function handleCancel() {
    const res = await fetch('/api/meet/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, token, action: 'cancel' }),
    });
    if (res.ok) {
      setStatus('done');
      setMessage('Your booking has been cancelled.');
    } else {
      setMessage('Failed to cancel. It may have already been cancelled.');
    }
  }

  async function handleReschedule() {
    const res = await fetch('/api/meet/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: booking.slug,
        date,
        time: selected,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
      }),
    });

    if (!res.ok) {
      setMessage('Failed to reschedule. Please try again.');
      return;
    }

    await fetch('/api/meet/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: id, token, action: 'cancel' }),
    });

    setStatus('done');
    setMessage('Rescheduled! Check your email for the new confirmation.');
  }

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  if (status === 'error' || status === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-lg">{message}</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col items-center p-8 pt-16">
      <h1 className="text-2xl font-bold mb-2">Manage your booking</h1>
      <p className="text-gray-500 mb-1">{booking.title}</p>
      <p className="text-gray-500 mb-6">
        {new Date(booking.starts_at).toLocaleString()}
      </p>

      {!rescheduling ? (
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="border border-red-400 text-red-500 rounded-lg px-6 py-3"
          >
            Cancel booking
          </button>
          <button
            onClick={() => setRescheduling(true)}
            className="bg-blue-500 text-white rounded-lg px-6 py-3"
          >
            Reschedule
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">New date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>
          {date && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  className={`p-2 rounded-lg border text-sm ${
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
          {date && slots.length === 0 && (
            <p className="text-gray-400">No slots on this date</p>
          )}
          {selected && (
            <button
              onClick={handleReschedule}
              className="bg-blue-500 text-white rounded-lg p-3 font-medium"
            >
              Confirm reschedule
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ManageInner />
    </Suspense>
  );
}
