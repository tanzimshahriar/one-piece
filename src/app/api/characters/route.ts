import { NextResponse } from 'next/server';
import { CHARACTERS_PER_PAGE, fetchCharacters } from '@/lib/characters';

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageValue = searchParams.get('page') ?? '1';
  const query = searchParams.get('q')?.trim();
  const page = Number(pageValue);

  if (!Number.isSafeInteger(page) || page < 1) {
    return NextResponse.json({ error: 'Page must be a positive integer.' }, { status: 400 });
  }
  if (query && query.length > 100) {
    return NextResponse.json({ error: 'Search must be 100 characters or fewer.' }, { status: 400 });
  }

  try {
    const characters = await fetchCharacters(page, query);
    return NextResponse.json({
      characters,
      hasNextPage: characters.length === CHARACTERS_PER_PAGE,
    });
  } catch (error) {
    console.error('Unable to fetch One Piece characters.', error);
    const message = error instanceof Error ? error.message : 'Unable to load character records.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
