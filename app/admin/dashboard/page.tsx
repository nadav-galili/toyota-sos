'use client';

import { DashboardKPIs } from '@/components/admin/dashboard/DashboardKPIs';

export default function AdminDashboardPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <h1 className="text-xl font-bold text-gray-900">לוח מחוונים</h1>
        <DashboardKPIs />
      </div>
    </div>
  );
}
