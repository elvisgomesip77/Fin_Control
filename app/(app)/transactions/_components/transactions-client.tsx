'use client';
import { useState, useEffect } from 'react';
import { CategoryIcon } from '@/components/app/category-icon';
import { formatMoney } from '@/lib/constants';
import { ChevronLeft, ChevronRight, Trash2, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SafeDate } from '@/components/safe-format';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  description: string | null;
  date: string;
  category: { name: string; iconName: string } | null;
  member: { name: string } | null;
  paymentMethod: { name: string; type: string } | null;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function TransactionsClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTx = () => {
    setLoading(true);
    fetch(`/api/transactions?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then((d) => setTransactions(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTx(); }, [month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apagar esta transação?')) return;
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      toast.success('Transação apagada');
      fetchTx();
    } catch {
      toast.error('Erro ao apagar');
    }
  };

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="font-display font-bold text-lg">
          {MONTHS[month - 1]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {(transactions ?? []).length} transações
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Wallet className="h-8 w-8 text-primary animate-pulse" />
        </div>
      ) : (transactions ?? []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Nenhuma transação neste mês</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(transactions ?? []).map((tx: Transaction) => (
            <div
              key={tx?.id}
              className="bg-card rounded-xl p-3 flex items-center gap-3 group"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                tx?.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
              )}>
                {tx?.type === 'income'
                  ? <ArrowUpCircle className="h-5 w-5 text-green-500" />
                  : <CategoryIcon iconName={tx?.category?.iconName ?? 'MoreHorizontal'} className={cn('h-5 w-5', 'text-red-500')} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {tx?.category?.name ?? tx?.description ?? (tx?.type === 'income' ? 'Receita' : 'Despesa')}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <SafeDate date={tx?.date} options={{ day: '2-digit', month: 'short' }} />
                  {tx?.member?.name && <span>· {tx.member.name}</span>}
                  {tx?.paymentMethod?.name && <span>· {tx.paymentMethod.name}</span>}
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <span className={cn(
                  'font-mono text-sm font-semibold',
                  tx?.type === 'income' ? 'text-green-500' : 'text-red-500'
                )}>
                  {tx?.type === 'income' ? '+' : '-'}{formatMoney(tx?.amount ?? 0, tx?.currency ?? 'EUR')}
                </span>
                <button
                  onClick={() => handleDelete(tx?.id)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
