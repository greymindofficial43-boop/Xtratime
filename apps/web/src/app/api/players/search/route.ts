import { searchPlayers } from '@/lib/cricapi';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const players = await searchPlayers(q);
  return NextResponse.json(players);
}
