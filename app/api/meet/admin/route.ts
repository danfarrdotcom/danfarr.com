import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/meet/auth';
import { supabaseAdmin } from '@/lib/meet/supabase';
import { getAdminAccessToken, getOAuth2Client } from '@/lib/meet/google';
import { google } from 'googleapis';
import { sendCancellation } from '@/lib/meet/email';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  // Lock to your email — change this
  if (session.user.email !== process.env.ADMIN_EMAIL) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [rules, slotTypes, overrides, bookings, syncedCalendars] = await Promise.all([
    supabaseAdmin.from('availability_rules').select('*').order('day_of_week'),
    supabaseAdmin.from('slot_types').select('*').order('created_at'),
    supabaseAdmin.from('availability_overrides').select('*').order('date'),
    supabaseAdmin
      .from('bookings')
      .select('*, slot_types(title)')
      .eq('status', 'confirmed')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at'),
    supabaseAdmin.from('synced_calendars').select('*').order('created_at'),
  ]);

  return NextResponse.json({
    rules: rules.data,
    slotTypes: slotTypes.data,
    overrides: overrides.data,
    bookings: bookings.data,
    syncedCalendars: syncedCalendars.data,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, ...payload } = await req.json();

  let result;
  switch (action) {
    case 'upsert_rule':
      result = await supabaseAdmin.from('availability_rules').upsert(payload);
      break;
    case 'delete_rule':
      result = await supabaseAdmin.from('availability_rules').delete().eq('id', payload.id);
      break;
    case 'upsert_slot_type':
      result = await supabaseAdmin.from('slot_types').upsert(payload);
      break;
    case 'upsert_override':
      result = await supabaseAdmin.from('availability_overrides').upsert(payload);
      break;
    case 'cancel_booking': {
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('*, slot_types(title)')
        .eq('id', payload.id)
        .eq('status', 'confirmed')
        .single();

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found or already cancelled' }, { status: 404 });
      }

      result = await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', payload.id);

      if (booking.google_event_id) {
        const accessToken = await getAdminAccessToken();
        if (accessToken) {
          try {
            const oauth = getOAuth2Client();
            oauth.setCredentials({ access_token: accessToken });
            const calendar = google.calendar({ version: 'v3', auth: oauth });
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
        bookingId: payload.id,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        title: booking.slot_types?.title ?? 'Meeting',
        startsAt: booking.starts_at,
        endsAt: booking.ends_at,
      }).catch((e) => console.error('Email error:', e));

      break;
    }
    case 'upsert_synced_calendar':
      result = await supabaseAdmin.from('synced_calendars').upsert(payload);
      break;
    case 'delete_synced_calendar':
      result = await supabaseAdmin.from('synced_calendars').delete().eq('id', payload.id);
      break;
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
