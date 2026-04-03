import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/meet/supabase';
import { getSlotTypeBySlug, getAvailableSlots } from '@/lib/meet/availability';
import { createCalendarEvent, getAdminAccessToken } from '@/lib/meet/google';
import { sendConfirmation } from '@/lib/meet/email';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, date, time, guestName, guestEmail } = body;

  if (!slug || !date || !time || !guestName || !guestEmail) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const slotType = await getSlotTypeBySlug(slug);
  if (!slotType) {
    return NextResponse.json({ error: 'Invalid slot type' }, { status: 404 });
  }

  const available = await getAvailableSlots(date, slotType.duration_minutes, slotType.buffer_minutes);
  if (!available.includes(time)) {
    return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
  }

  const startsAt = time;
  const endsAt = new Date(
    new Date(time).getTime() + slotType.duration_minutes * 60000
  ).toISOString();

  let googleEventId: string | null = null;
  let meetLink: string | null = null;

  const accessToken = await getAdminAccessToken();
  if (accessToken) {
    try {
      const result = await createCalendarEvent(accessToken, {
        summary: `${slotType.title} with ${guestName}`,
        description: `Booked via meet.danfarr.com\nGuest: ${guestName} (${guestEmail})`,
        startTime: startsAt,
        endTime: endsAt,
        attendeeEmail: guestEmail,
      });
      googleEventId = result.eventId;
      meetLink = result.meetLink;
    } catch (e) {
      console.error('Google Calendar error:', e);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert({
      slot_type_id: slotType.id,
      guest_name: guestName,
      guest_email: guestEmail,
      starts_at: startsAt,
      ends_at: endsAt,
      google_event_id: googleEventId,
      google_meet_link: meetLink,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email (non-blocking)
  sendConfirmation({
    bookingId: data.id,
    cancelToken: data.cancel_token,
    guestName,
    guestEmail,
    title: slotType.title,
    startsAt,
    endsAt,
    meetLink,
  }).catch((e) => console.error('Email error:', e));

  return NextResponse.json({ booking: data, meetLink });
}
