import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/meet/auth';
import { supabaseAdmin } from '@/lib/meet/supabase';

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
    case 'cancel_booking':
      result = await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', payload.id);
      break;
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
