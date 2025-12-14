import React from 'react';
import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed top-4 left-4 z-[60]">
        <AdminNotificationBell />
      </div>
      {children}
    </>
  );
}

