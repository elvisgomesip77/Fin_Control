export const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'BRL', symbol: 'R$', label: 'Real' },
  { code: 'USD', symbol: '$', label: 'Dólar' },
] as const;

export const PAYMENT_TYPES = [
  { value: 'mbway', label: 'MB WAY', icon: 'Smartphone' },
  { value: 'credit', label: 'Cartão Crédito', icon: 'CreditCard' },
  { value: 'debit', label: 'Débito', icon: 'Wallet' },
  { value: 'pix', label: 'PIX', icon: 'Zap' },
  { value: 'cash', label: 'Dinheiro', icon: 'Banknote' },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  UtensilsCrossed: 'UtensilsCrossed',
  Home: 'Home',
  Car: 'Car',
  Gamepad2: 'Gamepad2',
  HeartPulse: 'HeartPulse',
  GraduationCap: 'GraduationCap',
  Shirt: 'Shirt',
  Plane: 'Plane',
  Laptop: 'Laptop',
  MoreHorizontal: 'MoreHorizontal',
  Banknote: 'Banknote',
  Briefcase: 'Briefcase',
  TrendingUp: 'TrendingUp',
  PlusCircle: 'PlusCircle',
};

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatMoney(amount: number, currency: string = 'EUR'): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = Math.abs(amount)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}${formatted} ${symbol}`;
}
