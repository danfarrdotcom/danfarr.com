import { supabase } from './supabase';
import { getAdminAccessToken, getCalendarBusyTimes } from './google';

export type SlotType = {
  id: string;
  title: string;
  duration_minutes: number;
  buffer_minutes: number;
  slug: string;
  description: string | null;
};

export type AvailabilityRule = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
};

export type AvailabilityOverride = {
  date: string;
  start_time: string | null;
  end_time: string | null;
};

type Booking = {
  starts_at: string;
  ends_at: string;
};

export async function getSlotTypes(): Promise<SlotType[]> {
  const { data } = await supabase
    .from('slot_types')
    .select('id, title, duration_minutes, buffer_minutes, slug, description')
    .eq('active', true);
  return data ?? [];
}

export async function getSlotTypeBySlug(slug: string): Promise<SlotType | null> {
  const { data } = await supabase
    .from('slot_types')
    .select('id, title, duration_minutes, buffer_minutes, slug, description')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  return data;
}

export async function getAvailableSlots(
  date: string, // YYYY-MM-DD
  durationMinutes: number,
  bufferMinutes: number = 0
): Promise<string[]> {
  const dayOfWeek = new Date(date + 'T00:00:00').getDay();

  // Get rules for this day
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('start_time, end_time, timezone')
    .eq('day_of_week', dayOfWeek);

  if (!rules?.length) return [];

  // Check for overrides
  const { data: overrides } = await supabase
    .from('availability_overrides')
    .select('start_time, end_time')
    .eq('date', date);

  // If override with null times = day blocked
  if (overrides?.some((o) => !o.start_time)) return [];

  // Get existing bookings for this date
  const dayStart = `${date}T00:00:00Z`;
  const dayEnd = `${date}T23:59:59Z`;
  const { data: bookings } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('status', 'confirmed')
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd);

  // Fetch Google Calendar busy times (multi-calendar)
  let busyTimes: { start?: string | null; end?: string | null }[] = [];
  const accessToken = await getAdminAccessToken();
  if (accessToken) {
    try {
      const { data: syncedCals } = await supabase
        .from('synced_calendars')
        .select('calendar_id');
      const calIds = syncedCals?.map((c) => c.calendar_id) ?? [];
      if (!calIds.includes('primary')) calIds.push('primary');
      busyTimes = await getCalendarBusyTimes(accessToken, dayStart, dayEnd, calIds);
    } catch {
      // Gracefully degrade
    }
  }

  // Build available windows from rules (or overrides if present)
  const windows = (overrides?.length ? overrides : rules).filter(
    (w) => w.start_time && w.end_time
  ) as { start_time: string; end_time: string }[];

  const slots: string[] = [];

  for (const window of windows) {
    let cursor = toMinutes(window.start_time);
    const end = toMinutes(window.end_time);

    while (cursor + durationMinutes <= end) {
      const slotStart = `${date}T${fromMinutes(cursor)}:00Z`;
      const slotEnd = `${date}T${fromMinutes(cursor + durationMinutes)}:00Z`;

      // Buffer extends the blocked zone around existing bookings
      const bufferMs = bufferMinutes * 60000;

      const bookingConflict = (bookings ?? []).some((b: Booking) => {
        const bStart = new Date(b.starts_at).getTime() - bufferMs;
        const bEnd = new Date(b.ends_at).getTime() + bufferMs;
        return (
          new Date(slotStart).getTime() < bEnd &&
          new Date(slotEnd).getTime() > bStart
        );
      });

      const calendarConflict = busyTimes.some(
        (b) => b.start && b.end && slotStart < b.end && slotEnd > b.start
      );

      if (!bookingConflict && !calendarConflict) slots.push(slotStart);
      cursor += 30; // 30-min increments
    }
  }

  return slots;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(mins: number): string {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
}
