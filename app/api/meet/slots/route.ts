import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, getSlotTypeBySlug } from '@/lib/meet/availability';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get('slug');
  const date = searchParams.get('date'); // YYYY-MM-DD

  if (!slug || !date) {
    return NextResponse.json({ error: 'slug and date required' }, { status: 400 });
  }

  const slotType = await getSlotTypeBySlug(slug);
  if (!slotType) {
    return NextResponse.json({ error: 'slot type not found' }, { status: 404 });
  }

  const slots = await getAvailableSlots(date, slotType.duration_minutes, slotType.buffer_minutes);
  return NextResponse.json({ slots, slotType });
}
