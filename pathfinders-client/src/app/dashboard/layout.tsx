'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/dashboard/navbar';
import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <Sidebar />
      <main className="pl-64 pt-16">
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
} 