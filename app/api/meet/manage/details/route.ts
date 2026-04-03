import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/meet/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  if (!id || !token) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from('bookings')
    .select('id, guest_name, guest_email, starts_at, ends_at, google_meet_link, slot_types(title, slug)')
    .eq('id', id)
    .eq('cancel_token', token)
    .eq('status', 'confirmed')
    .single();

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      ...data,
      title: (data.slot_types as any)?.title,
      slug: (data.slot_types as any)?.slug,
    },
  });
}
