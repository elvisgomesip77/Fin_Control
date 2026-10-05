export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { isDefault: true },
        { householdId: user?.householdId ?? undefined },
      ],
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(categories);
}
