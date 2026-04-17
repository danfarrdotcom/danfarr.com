import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET() {
  const { data, error } = await supabase
    .from('sand_wizard_scores')
    .select('name, score, created_at')
    .order('score', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, score } = await req.json();
  if (!name || typeof name !== 'string' || name.length > 20) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  if (!score || typeof score !== 'number' || score <= 0) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  const { error } = await supabase
    .from('sand_wizard_scores')
    .insert({ name: name.trim(), score: Math.floor(score) });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
