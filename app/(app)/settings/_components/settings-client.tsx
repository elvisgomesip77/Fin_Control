'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users, CreditCard, Home, Plus, Trash2, Wallet,
  Settings as SettingsIcon, ChevronRight
} from 'lucide-react';
import { CURRENCIES, PAYMENT_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Household {
  id: string;
  name: string;
  baseCurrency: string;
}

interface Member {
  id: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  cardLimit: number | null;
  closingDay: number | null;
  dueDay: number | null;
}

export function SettingsClient() {
  const { data: session } = useSession();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // New member form
  const [newMember, setNewMember] = useState('');
  // New payment method form
  const [showPmForm, setShowPmForm] = useState(false);
  const [pmName, setPmName] = useState('');
  const [pmType, setPmType] = useState('debit');
  const [pmLimit, setPmLimit] = useState('');
  const [pmClosing, setPmClosing] = useState('');
  const [pmDue, setPmDue] = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/household').then((r) => r.json()),
      fetch('/api/members').then((r) => r.json()),
      fetch('/api/payment-methods').then((r) => r.json()),
    ])
      .then(([h, m, p]) => {
        setHousehold(h);
        setMembers(m ?? []);
        setPaymentMethods(p ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const updateHousehold = async (data: Partial<Household>) => {
    try {
      const res = await fetch('/api/household', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setHousehold(updated);
        toast.success('Família atualizada');
      }
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const addMember = async () => {
    if (!newMember.trim()) return;
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMember.trim() }),
      });
      if (res.ok) {
        toast.success('Membro adicionado');
        setNewMember('');
        fetchAll();
      }
    } catch {
      toast.error('Erro ao adicionar membro');
    }
  };

  const addPaymentMethod = async () => {
    if (!pmName.trim()) return;
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pmName.trim(),
          type: pmType,
          cardLimit: pmLimit || null,
          closingDay: pmClosing || null,
          dueDay: pmDue || null,
        }),
      });
      if (res.ok) {
        toast.success('Método adicionado');
        setPmName('');
        setPmLimit('');
        setPmClosing('');
        setPmDue('');
        setShowPmForm(false);
        fetchAll();
      }
    } catch {
      toast.error('Erro ao adicionar');
    }
  };

  const deletePaymentMethod = async (id: string) => {
    if (!confirm('Apagar este método de pagamento?')) return;
    try {
      await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      toast.success('Apagado');
      fetchAll();
    } catch {
      toast.error('Erro ao apagar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Wallet className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-xl flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-primary" />
        Configurações
      </h1>

      {/* Household */}
      <section className="bg-card rounded-xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Família</h2>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Nome da família</label>
          <input
            type="text"
            value={household?.name ?? ''}
            onChange={(e) => setHousehold(household ? { ...household, name: e.target.value } : null)}
            onBlur={() => household?.name && updateHousehold({ name: household.name })}
            className="w-full h-10 px-3 rounded-lg bg-secondary text-sm border-0 focus:ring-2 focus:ring-primary outline-none mt-1"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Moeda base</label>
          <div className="flex gap-2 mt-1">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => updateHousehold({ baseCurrency: c.code })}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium transition',
                  household?.baseCurrency === c.code
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="bg-card rounded-xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Membros</h2>
        </div>

        <div className="space-y-2">
          {(members ?? []).map((m: Member) => (
            <div key={m?.id} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
              <span>{m?.name}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome do novo membro"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
            className="flex-1 h-10 px-3 rounded-lg bg-secondary text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
          />
          <button
            onClick={addMember}
            className="h-10 px-3 rounded-lg bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-card rounded-xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Meios de Pagamento</h2>
          </div>
          <button
            onClick={() => setShowPmForm(!showPmForm)}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Existing methods */}
        <div className="space-y-2">
          {(paymentMethods ?? []).map((pm: PaymentMethod) => (
            <div key={pm?.id} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">{pm?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {PAYMENT_TYPES.find((pt) => pt.value === pm?.type)?.label ?? pm?.type}
                  {pm?.cardLimit ? ` · Limite: ${pm.cardLimit}` : ''}
                  {pm?.closingDay ? ` · Fecho: dia ${pm.closingDay}` : ''}
                  {pm?.dueDay ? ` · Venc: dia ${pm.dueDay}` : ''}
                </p>
              </div>
              <button
                onClick={() => deletePaymentMethod(pm?.id)}
                className="p-1 text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showPmForm && (
          <div className="space-y-2 bg-muted rounded-lg p-3">
            <input
              type="text"
              placeholder="Nome (ex: Visa Gold)"
              value={pmName}
              onChange={(e) => setPmName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-card text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
            />

            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setPmType(pt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition',
                    pmType === pt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground'
                  )}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            {pmType === 'credit' && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Limite"
                  value={pmLimit}
                  onChange={(e) => setPmLimit(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-card text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="number"
                  placeholder="Dia fecho"
                  value={pmClosing}
                  onChange={(e) => setPmClosing(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-card text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
                  min={1}
                  max={31}
                />
                <input
                  type="number"
                  placeholder="Dia venc."
                  value={pmDue}
                  onChange={(e) => setPmDue(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-card text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
                  min={1}
                  max={31}
                />
              </div>
            )}

            <button
              onClick={addPaymentMethod}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Adicionar Método
            </button>
          </div>
        )}
      </section>

      {/* User Info */}
      <section className="bg-card rounded-xl p-4 space-y-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-xs text-muted-foreground">Conta</p>
        <p className="text-sm font-medium" suppressHydrationWarning>{session?.user?.name ?? ''}</p>
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>{session?.user?.email ?? ''}</p>
      </section>
    </div>
  );
}
