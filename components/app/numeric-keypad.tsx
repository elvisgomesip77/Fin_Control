'use client';
import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
}

export function NumericKeypad({ value, onChange }: NumericKeypadProps) {
  const handleKey = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === ',' || key === '.') {
      if (value.includes(',')) return;
      onChange(value + ',');
      return;
    }
    // Max 2 decimal places
    const parts = value.split(',');
    if (parts.length === 2 && (parts[1]?.length ?? 0) >= 2) return;
    // Max length
    if (value.replace(',', '').length >= 10) return;
    onChange(value + key);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'];

  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          className={cn(
            'h-14 rounded-xl text-xl font-mono font-semibold transition-all active:scale-95',
            key === 'backspace'
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
          )}
        >
          {key === 'backspace' ? <Delete className="h-5 w-5" /> : key}
        </button>
      ))}
    </div>
  );
}
