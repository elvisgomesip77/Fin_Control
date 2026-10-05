import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', iconName: 'UtensilsCrossed', type: 'expense' },
  { name: 'Moradia', iconName: 'Home', type: 'expense' },
  { name: 'Transporte', iconName: 'Car', type: 'expense' },
  { name: 'Lazer', iconName: 'Gamepad2', type: 'expense' },
  { name: 'Saúde', iconName: 'HeartPulse', type: 'expense' },
  { name: 'Educação', iconName: 'GraduationCap', type: 'expense' },
  { name: 'Vestuário', iconName: 'Shirt', type: 'expense' },
  { name: 'Viagem', iconName: 'Plane', type: 'expense' },
  { name: 'Tecnologia', iconName: 'Laptop', type: 'expense' },
  { name: 'Outros', iconName: 'MoreHorizontal', type: 'expense' },
  { name: 'Salário', iconName: 'Banknote', type: 'income' },
  { name: 'Freelance', iconName: 'Briefcase', type: 'income' },
  { name: 'Investimentos', iconName: 'TrendingUp', type: 'income' },
  { name: 'Outros (Receita)', iconName: 'PlusCircle', type: 'income' },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: `default-${cat.name.toLowerCase().replace(/[^a-z]/g, '')}` },
      update: {},
      create: {
        id: `default-${cat.name.toLowerCase().replace(/[^a-z]/g, '')}`,
        name: cat.name,
        iconName: cat.iconName,
        type: cat.type,
        isDefault: true,
      },
    });
  }

  console.log('Seeding test user...');
  const hashed = await bcrypt.hash('bb#1Q7iv0U', 12);
  const household = await prisma.household.upsert({
    where: { id: 'test-household' },
    update: {},
    create: {
      id: 'test-household',
      name: 'Família Teste',
      baseCurrency: 'EUR',
    },
  });

  await prisma.user.upsert({
    where: { email: 'abacus-7be76fa8@example.com' },
    update: {},
    create: {
      email: 'abacus-7be76fa8@example.com',
      password: hashed,
      name: 'Admin Teste',
      householdId: household.id,
    },
  });

  await prisma.member.upsert({
    where: { id: 'test-member-1' },
    update: {},
    create: {
      id: 'test-member-1',
      householdId: household.id,
      name: 'Admin',
    },
  });

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
