export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) return NextResponse.json([]);

  const methods = await prisma.paymentMethod.findMany({
    where: { householdId: user.householdId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(methods);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) return NextResponse.json({ error: 'Sem família' }, { status: 400 });

  const body = await req.json();
  const method = await prisma.paymentMethod.create({
    data: {
      householdId: user.householdId,
      name: body.name,
      type: body.type,
      cardLimit: body.cardLimit ? parseFloat(body.cardLimit) : null,
      closingDay: body.closingDay ? parseInt(body.closingDay) : null,
      dueDay: body.dueDay ? parseInt(body.dueDay) : null,
    },
  });
  return NextResponse.json(method, { status: 201 });
}
