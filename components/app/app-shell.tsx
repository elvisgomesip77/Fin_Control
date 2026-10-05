'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BottomNav } from './bottom-nav';
import { LogOut, Wallet } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Wallet className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-lg tracking-tight">FinFam</span>
          </div>
          <button
            onClick={() => signOut({ redirectTo: '/auth' })}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
