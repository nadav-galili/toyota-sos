'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardKPIs } from '@/components/admin/dashboard/DashboardKPIs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { logout, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      try {
        // Best-effort client cleanup
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = 'toyota_role=; path=/; max-age=0';
      } catch {}
    } finally {
      router.replace('/auth/login');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Navbar */}
        <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/tasks/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 underline decoration-dotted"
            >
              מעבר למשימות
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-sm"
              onClick={handleSignOut}
              disabled={loading}
            >
              יציאה
            </Button>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900">לוח מחוונים</h1>
        <DashboardKPIs />
      </div>
    </div>
  );
}
