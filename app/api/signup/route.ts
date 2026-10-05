export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Este email já está registado' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Create household for new user
    const household = await prisma.household.create({
      data: {
        name: name ? `Família de ${name}` : 'Minha Família',
        baseCurrency: 'EUR',
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name ?? '',
        householdId: household.id,
      },
    });

    // Create a default member for the user
    await prisma.member.create({
      data: {
        householdId: household.id,
        name: name ?? 'Eu',
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
