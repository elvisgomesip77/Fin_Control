export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { household: true } });
  return NextResponse.json(user?.household ?? null);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) return NextResponse.json({ error: 'Sem família' }, { status: 400 });

  const body = await req.json();
  const updated = await prisma.household.update({
    where: { id: user.householdId },
    data: {
      name: body.name ?? undefined,
      baseCurrency: body.baseCurrency ?? undefined,
    },
  });
  return NextResponse.json(updated);
}
