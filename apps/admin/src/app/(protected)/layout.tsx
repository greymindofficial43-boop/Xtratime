'use client';

import { AdminShell } from '@/components/AdminShell';
import { AuthGuard } from '@/components/AuthGuard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
