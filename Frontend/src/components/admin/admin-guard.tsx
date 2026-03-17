'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      router.replace('/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
    }
  }, [user, isLoading, router]);

  if (isLoading || !checked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
