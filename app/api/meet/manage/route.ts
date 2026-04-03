import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/meet/supabase';
import { getAdminAccessToken } from '@/lib/meet/google';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/meet/google';
import { sendCancellation } from '@/lib/meet/email';

export async function POST(req: NextRequest) {
  const { bookingId, token, action } = await req.json();

  if (!bookingId || !token || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Verify cancel token
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, slot_types(title)')
    .eq('id', bookingId)
    .eq('cancel_token', token)
    .eq('status', 'confirmed')
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found or already cancelled' }, { status: 404 });
  }

  if (action === 'cancel') {
    // Cancel in DB
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    // Delete Google Calendar event
    if (booking.google_event_id) {
      const accessToken = await getAdminAccessToken();
      if (accessToken) {
        try {
          const auth = getOAuth2Client();
          auth.setCredentials({ access_token: accessToken });
          const calendar = google.calendar({ version: 'v3', auth });
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: booking.google_event_id,
          });
        } catch (e) {
          console.error('Failed to delete calendar event:', e);
        }
      }
    }

    sendCancellation({
      bookingId,
      guestName: booking.guest_name,
      guestEmail: booking.guest_email,
      title: booking.slot_types?.title ?? 'Meeting',
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
    }).catch((e) => console.error('Email error:', e));

    return NextResponse.json({ ok: true, cancelled: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
