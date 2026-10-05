'use client';
import { useState, useEffect } from 'react';
import { formatMoney } from '@/lib/constants';
import {
  TrendingUp, TrendingDown, CreditCard, PiggyBank,
  ChevronLeft, ChevronRight, Copy, FileDown, CheckCircle2,
  AlertTriangle, XCircle, Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardData {
  income: number;
  directExpenses: number;
  creditExpenses: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  creditRate: number;
  status: 'green' | 'yellow' | 'red';
  topCategories: { name: string; total: number }[];
  baseCurrency: string;
  transactionCount: number;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function DashboardClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const getStatusInfo = (s: string) => {
    switch (s) {
      case 'green': return { label: 'Saudável', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', emoji: '🟢' };
      case 'yellow': return { label: 'Atenção', icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', emoji: '🟡' };
      case 'red': return { label: 'Déficit', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', emoji: '🔴' };
      default: return { label: '-', icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted', emoji: '⚪' };
    }
  };

  const generateReport = () => {
    if (!data) return '';
    const cur = data.baseCurrency ?? 'EUR';
    const statusInfo = getStatusInfo(data.status);
    const sobra = data.savingsRate?.toFixed?.(0) ?? '0';
    let lines = [
      `📊 RESUMO FINANCEIRO FAMILIAR — ${MONTHS[month - 1]}/${year}`,
      `${statusInfo.emoji} Status: ${statusInfo.label} (Sobra de ${sobra}%)`,
      `💰 Entradas Totais: ${formatMoney(data.income, cur)}`,
      `💸 Saídas Diretas (MB WAY / Débito): ${formatMoney(data.directExpenses, cur)}`,
      `💳 Faturas de Cartão do Mês: ${formatMoney(data.creditExpenses, cur)}`,
      `⚖️ Resultado Líquido: ${data.balance >= 0 ? '+' : ''}${formatMoney(data.balance, cur)}`,
    ];
    if ((data.topCategories ?? []).length > 0) {
      lines.push(`📌 Top Gastos do Mês:`);
      (data.topCategories ?? []).forEach((c: any) => {
        lines.push(`  ${c?.name ?? 'Outros'}: ${formatMoney(c?.total ?? 0, cur)}`);
      });
    }
    lines.push('', 'Gerado via FinFam PWA');
    return lines.join('\n');
  };

  const copyReport = async () => {
    const text = generateReport();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Relatório copiado!');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const downloadPdf = async () => {
    const text = generateReport();
    if (!text) return;
    // Simple text-based PDF download as blob
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinFam_Relatorio_${MONTHS[month - 1]}_${year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório transferido!');
  };

  const statusInfo = data ? getStatusInfo(data.status) : null;
  const StatusIcon = statusInfo?.icon ?? CheckCircle2;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Wallet className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

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

      {/* Status Badge */}
      {data && statusInfo && (
        <div className={cn('flex items-center gap-2 px-4 py-3 rounded-xl', statusInfo.bg)}>
          <StatusIcon className={cn('h-5 w-5', statusInfo.color)} />
          <div>
            <p className={cn('font-semibold text-sm', statusInfo.color)}>{statusInfo.label}</p>
            <p className="text-xs text-muted-foreground">
              {data.status === 'green' && `Sobra de ${data.savingsRate?.toFixed?.(0) ?? '0'}% das receitas`}
              {data.status === 'yellow' && (data.creditRate > 35
                ? `Cartão representa ${data.creditRate?.toFixed?.(0) ?? '0'}% das receitas`
                : `Sobra de apenas ${data.savingsRate?.toFixed?.(0) ?? '0'}%`)}
              {data.status === 'red' && 'As despesas superaram as receitas'}
            </p>
          </div>
        </div>
      )}

      {/* Cards */}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Entradas</span>
            </div>
            <p className="font-mono font-bold text-lg text-green-500">
              {formatMoney(data.income, data.baseCurrency)}
            </p>
          </div>

          <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Saídas Diretas</span>
            </div>
            <p className="font-mono font-bold text-lg text-red-500">
              {formatMoney(data.directExpenses, data.baseCurrency)}
            </p>
          </div>

          <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Faturas Cartão</span>
            </div>
            <p className="font-mono font-bold text-lg text-orange-500">
              {formatMoney(data.creditExpenses, data.baseCurrency)}
            </p>
          </div>

          <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Resultado</span>
            </div>
            <p className={cn(
              'font-mono font-bold text-lg',
              (data.balance ?? 0) >= 0 ? 'text-primary' : 'text-red-500'
            )}>
              {(data.balance ?? 0) >= 0 ? '+' : ''}{formatMoney(data.balance, data.baseCurrency)}
            </p>
          </div>
        </div>
      )}

      {/* Top Categories */}
      {data && (data.topCategories ?? []).length > 0 && (
        <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="font-semibold text-sm mb-3">Top Gastos</h3>
          <div className="space-y-2">
            {(data.topCategories ?? []).map((cat: any, i: number) => {
              const pct = data.totalExpenses > 0 ? ((cat?.total ?? 0) / data.totalExpenses * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat?.name ?? 'Outros'}</span>
                    <span className="font-mono text-muted-foreground">
                      {formatMoney(cat?.total ?? 0, data.baseCurrency)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Buttons */}
      <div className="flex gap-2">
        <button
          onClick={copyReport}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98]"
        >
          <Copy className="h-4 w-4" />
          Copiar Relatório
        </button>
        <button
          onClick={downloadPdf}
          className="flex-1 h-12 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98]"
        >
          <FileDown className="h-4 w-4" />
          Baixar TXT
        </button>
      </div>
    </div>
  );
}
