export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) return NextResponse.json([]);

  const url = new URL(req.url);
  const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1));
  const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      householdId: user.householdId,
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true, member: true, paymentMethod: true },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) return NextResponse.json({ error: 'Sem família associada' }, { status: 400 });

  try {
    const body = await req.json();
    const tx = await prisma.transaction.create({
      data: {
        householdId: user.householdId,
        memberId: body.memberId || null,
        paymentMethodId: body.paymentMethodId || null,
        categoryId: body.categoryId || null,
        description: body.description || null,
        amount: parseFloat(body.amount),
        currency: body.currency || 'EUR',
        type: body.type || 'expense',
        date: body.date ? new Date(body.date) : new Date(),
        installments: body.installments || 1,
        status: body.status || 'confirmed',
      },
      include: { category: true, member: true, paymentMethod: true },
    });
    return NextResponse.json(tx, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar transação' }, { status: 500 });
  }
}
