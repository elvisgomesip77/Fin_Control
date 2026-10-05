export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Use the NextAuth signIn flow' }, { status: 200 });
}
