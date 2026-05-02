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

function toUTCIso(date: string, localTime: string, timezone: string): string {
  const dt = new Date(
    new Date(`${date}T${localTime}`).toLocaleString('en-US', { timeZone: 'UTC' })
  );
  const inTz = new Date(
    new Date(`${date}T${localTime}`).toLocaleString('en-US', { timeZone: timezone })
  );
  const utcDate = new Date(`${date}T${localTime}:00Z`);
  const offsetMs = inTz.getTime() - dt.getTime();
  return new Date(utcDate.getTime() - offsetMs).toISOString();
}

function getTimezoneOffsetMs(date: string, timezone: string): number {
  const utcStr = new Date(`${date}T12:00:00Z`).toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = new Date(`${date}T12:00:00Z`).toLocaleString('en-US', { timeZone: timezone });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

export async function getAvailableSlots(
  date: string, // YYYY-MM-DD
  durationMinutes: number,
  bufferMinutes: number = 0
): Promise<string[]> {
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('day_of_week, start_time, end_time, timezone')
    .order('start_time');

  if (!rules?.length) return [];

  const timezone = rules[0].timezone || 'Europe/London';
  const offsetMs = getTimezoneOffsetMs(date, timezone);

  const dateMidnightUtc = new Date(`${date}T12:00:00Z`);
  const dateMidnightLocal = new Date(dateMidnightUtc.getTime() + offsetMs);
  const dayOfWeek = dateMidnightLocal.getUTCDay();

  const dayRules = rules.filter((r) => r.day_of_week === dayOfWeek);
  if (!dayRules.length) return [];

  const { data: overrides } = await supabase
    .from('availability_overrides')
    .select('start_time, end_time')
    .eq('date', date);

  if (overrides?.some((o) => !o.start_time)) return [];

  const dayStart = `${date}T00:00:00Z`;
  const dayEnd = `${date}T23:59:59Z`;
  const { data: bookings } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('status', 'confirmed')
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd);

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

  const windows = (overrides?.length ? overrides : dayRules).filter(
    (w) => w.start_time && w.end_time
  ) as { start_time: string; end_time: string }[];

  const slots: string[] = [];
  const now = new Date();

  for (const window of windows) {
    let cursor = toMinutes(window.start_time);
    const end = toMinutes(window.end_time);

    while (cursor + durationMinutes <= end) {
      const localTimeStr = fromMinutes(cursor);
      const slotStartUtc = new Date(`${date}T${localTimeStr}:00Z`);
      slotStartUtc.setTime(slotStartUtc.getTime() - offsetMs);
      const slotEndUtc = new Date(slotStartUtc.getTime() + durationMinutes * 60000);

      const slotStart = slotStartUtc.toISOString();
      const slotEnd = slotEndUtc.toISOString();

      if (slotStartUtc <= now) {
        cursor += durationMinutes;
        continue;
      }

      const bufferMs = bufferMinutes * 60000;

      const bookingConflict = (bookings ?? []).some((b: Booking) => {
        const bStart = new Date(b.starts_at).getTime() - bufferMs;
        const bEnd = new Date(b.ends_at).getTime() + bufferMs;
        return slotStartUtc.getTime() < bEnd && slotEndUtc.getTime() > bStart;
      });

      const calendarConflict = busyTimes.some(
        (b) => b.start && b.end && slotStart < b.end && slotEnd > b.start
      );

      if (!bookingConflict && !calendarConflict) slots.push(slotStart);
      cursor += durationMinutes;
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
