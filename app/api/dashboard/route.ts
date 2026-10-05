export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { household: true } });
  if (!user?.householdId) return NextResponse.json({ error: 'Sem família' }, { status: 400 });

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
    include: { category: true, paymentMethod: true },
  });

  const income = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const directExpenses = transactions
    .filter((t: any) => t.type === 'expense' && t.paymentMethod?.type !== 'credit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const creditExpenses = transactions
    .filter((t: any) => t.type === 'expense' && t.paymentMethod?.type === 'credit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpenses = directExpenses + creditExpenses;
  const balance = income - totalExpenses;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  const creditRate = income > 0 ? (creditExpenses / income) * 100 : 0;

  let status: 'green' | 'yellow' | 'red' = 'green';
  if (balance < 0) status = 'red';
  else if (savingsRate < 15 || creditRate > 35) status = 'yellow';

  // Top categories
  const categoryMap: Record<string, { name: string; total: number }> = {};
  transactions
    .filter((t: any) => t.type === 'expense')
    .forEach((t: any) => {
      const catName = t.category?.name ?? 'Outros';
      if (!categoryMap[catName]) categoryMap[catName] = { name: catName, total: 0 };
      categoryMap[catName].total += t.amount;
    });

  const topCategories = Object.values(categoryMap)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5);

  return NextResponse.json({
    income,
    directExpenses,
    creditExpenses,
    totalExpenses,
    balance,
    savingsRate,
    creditRate,
    status,
    topCategories,
    baseCurrency: user.household?.baseCurrency ?? 'EUR',
    transactionCount: transactions.length,
  });
}
