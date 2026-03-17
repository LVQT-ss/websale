'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    fetchMe().finally(() => setHasMounted(true));
  }, [fetchMe]);

  // Don't render children until the initial auth check is complete
  if (!hasMounted || isLoading) {
    return null;
  }

  return <>{children}</>;
}
