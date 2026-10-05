'use client';
import { useState, useEffect, useCallback } from 'react';
import { NumericKeypad } from '@/components/app/numeric-keypad';
import { CategoryIcon } from '@/components/app/category-icon';
import { CURRENCIES, PAYMENT_TYPES, getCurrencySymbol } from '@/lib/constants';
import {
  Smartphone, CreditCard, Wallet, Zap, Banknote,
  Plus, ArrowDownCircle, ArrowUpCircle, ChevronDown, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

const PAYMENT_ICON_MAP: Record<string, LucideIcon> = {
  Smartphone, CreditCard, Wallet, Zap, Banknote,
};

interface Category {
  id: string;
  name: string;
  iconName: string;
  type: string;
}

interface Member {
  id: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

export function QuickEntryClient() {
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [currency, setCurrency] = useState('EUR');
  const [selectedPaymentType, setSelectedPaymentType] = useState('mbway');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [showDesc, setShowDesc] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d ?? [])).catch(() => {});
    fetch('/api/members').then((r) => r.json()).then((d) => setMembers(d ?? [])).catch(() => {});
    fetch('/api/payment-methods').then((r) => r.json()).then((d) => setPaymentMethods(d ?? [])).catch(() => {});
  }, []);

  const filteredCategories = (categories ?? []).filter((c: Category) => c?.type === txType);

  // Find payment method id matching selected type
  const findPaymentMethodId = useCallback(() => {
    const match = (paymentMethods ?? []).find((pm: PaymentMethod) => pm?.type === selectedPaymentType);
    return match?.id ?? null;
  }, [paymentMethods, selectedPaymentType]);

  const handleSave = async () => {
    const numericAmount = parseFloat((amount ?? '').replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Introduza um valor válido');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          currency,
          type: txType,
          categoryId: selectedCategory,
          memberId: selectedMember,
          paymentMethodId: findPaymentMethodId(),
          description: description || null,
        }),
      });

      if (res.ok) {
        toast.success(`${txType === 'expense' ? 'Gasto' : 'Receita'} registado!`);
        setAmount('');
        setDescription('');
        setSelectedCategory(null);
        setShowDesc(false);
      } else {
        toast.error('Erro ao guardar');
      }
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const displayAmount = amount || '0';

  return (
    <div className="space-y-4">
      {/* Type Toggle */}
      <div className="flex rounded-xl bg-muted p-1">
        <button
          onClick={() => setTxType('expense')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all',
            txType === 'expense' ? 'bg-destructive/10 text-destructive shadow-sm' : 'text-muted-foreground'
          )}
        >
          <ArrowDownCircle className="h-4 w-4" />
          Saída
        </button>
        <button
          onClick={() => setTxType('income')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all',
            txType === 'income' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground'
          )}
        >
          <ArrowUpCircle className="h-4 w-4" />
          Entrada
        </button>
      </div>

      {/* Amount Display */}
      <div className="text-center py-4">
        <div className="font-mono text-4xl font-bold tracking-tight">
          <span className="text-muted-foreground text-2xl mr-1">{getCurrencySymbol(currency)}</span>
          {displayAmount.replace('.', ',')}
        </div>
      </div>

      {/* Currency Selector */}
      <div className="flex justify-center gap-2">
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              currency === c.code
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {c.symbol} {c.code}
          </button>
        ))}
      </div>

      {/* Payment Type */}
      {txType === 'expense' && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
          {PAYMENT_TYPES.map((pt) => {
            const PIcon = PAYMENT_ICON_MAP[pt.icon] ?? Wallet;
            return (
              <button
                key={pt.value}
                onClick={() => setSelectedPaymentType(pt.value)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-medium whitespace-nowrap transition-all min-w-[64px]',
                  selectedPaymentType === pt.value
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <PIcon className="h-4 w-4" />
                {pt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Categories */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">Categoria</p>
        <div className="grid grid-cols-5 gap-2">
          {(filteredCategories ?? []).map((cat: Category) => (
            <button
              key={cat?.id}
              onClick={() => setSelectedCategory(selectedCategory === cat?.id ? null : cat?.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all',
                selectedCategory === cat?.id
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <CategoryIcon iconName={cat?.iconName ?? 'HelpCircle'} className="h-5 w-5" />
              <span className="truncate w-full text-center">{cat?.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional: Member & Description */}
      <div className="flex gap-2">
        {(members ?? []).length > 0 && (
          <div className="flex-1">
            <select
              value={selectedMember ?? ''}
              onChange={(e) => setSelectedMember(e.target.value || null)}
              className="w-full h-10 px-3 rounded-xl bg-muted text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Membro (opcional)</option>
              {(members ?? []).map((m: Member) => (
                <option key={m?.id} value={m?.id}>{m?.name}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => setShowDesc(!showDesc)}
          className="h-10 px-3 rounded-xl bg-muted text-muted-foreground text-sm flex items-center gap-1 hover:bg-muted/80 transition"
        >
          <ChevronDown className={cn('h-3 w-3 transition-transform', showDesc && 'rotate-180')} />
          Nota
        </button>
      </div>

      {showDesc && (
        <input
          type="text"
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-muted text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
        />
      )}

      {/* Keypad */}
      <NumericKeypad value={amount} onChange={setAmount} />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || !amount}
        className={cn(
          'w-full h-14 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
          txType === 'expense'
            ? 'bg-destructive text-destructive-foreground hover:opacity-90'
            : 'bg-primary text-primary-foreground hover:opacity-90',
          (saving || !amount) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {saving ? (
          <div className="h-5 w-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <>
            <Plus className="h-5 w-5" />
            {txType === 'expense' ? 'Registar Gasto' : 'Registar Receita'}
          </>
        )}
      </button>
    </div>
  );
}
