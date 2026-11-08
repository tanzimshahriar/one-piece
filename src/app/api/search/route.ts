import { NextResponse } from 'next/server';
import { search } from '@/lib/data/search';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.slice(0, 80) ?? '';
  try {
    const results = await search(q);
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } });
  } catch (error) {
    console.error('search failed', error);
    return NextResponse.json({ results: [], error: 'Search is temporarily unavailable.' }, { status: 502 });
  }
}
