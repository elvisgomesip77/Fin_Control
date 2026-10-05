export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) return NextResponse.json([]);

  const members = await prisma.member.findMany({
    where: { householdId: user.householdId },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) return NextResponse.json({ error: 'Sem família' }, { status: 400 });

  const body = await req.json();
  const member = await prisma.member.create({
    data: { householdId: user.householdId, name: body.name },
  });
  return NextResponse.json(member, { status: 201 });
}
