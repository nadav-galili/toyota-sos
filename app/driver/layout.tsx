'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { ClipboardList, Bell, User } from 'lucide-react';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tabs = [
    { href: '/driver', label: 'משימות', icon: ClipboardList }, // Tasks
    { href: '/driver/notifications', label: 'התראות', icon: Bell }, // Notifications
    { href: '/driver/profile', label: 'פרופיל', icon: User }, // Profile
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      {/* Content */}
      <div className="max-w-xl mx-auto w-full px-4 pt-20 pb-[calc(env(safe-area-inset-bottom)+88px)]">
        {children}
      </div>

      {/* Bottom navigation (sticky) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 bg-white/95 border-t border-gray-200 backdrop-blur supports-backdrop-filter:bg-white/80 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-xl mx-auto grid grid-cols-3 gap-1 p-2">
          {tabs.map((t) => {
            // Only mark '/driver' as active on exact match.
            // Other tabs are active on exact or nested paths.
            const active =
              t.href === '/driver'
                ? pathname === '/driver'
                : pathname === t.href || pathname.startsWith(t.href + '/');
            return (
              <Link
                key={t.href}
                href={t.href}
                className={[
                  'flex flex-col items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors duration-150 select-none min-h-[56px] py-2',
                  active
                    ? 'bg-toyota-blue-gradient text-white ring-1 ring-primary shadow-inner'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <t.icon className="w-5 h-5" />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
