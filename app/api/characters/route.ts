import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: characters, error } = await supabase
      .from('character')
      .select('*')
      .order('"order"', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      );
    }

    return NextResponse.json({ characters });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}