'use client';

import React from 'react';
import { useConnectivity } from './ConnectivityProvider';

export function OfflineBanner() {
  const { isOnline, lastOnlineAt } = useConnectivity();
  const [dismissed, setDismissed] = React.useState(false);
  if (isOnline || dismissed) return null;
  return (
    <div dir="rtl" role="status" aria-live="polite" className="fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto max-w-screen-2xl bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 flex items-center justify-between shadow">
        <span className="text-sm">
          מצב לא מקוון. חלק מהפעולות הושבתו. {lastOnlineAt ? `חיבור אחרון: ${new Date(lastOnlineAt).toLocaleTimeString()}` : ''}
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs rounded border border-yellow-400 px-2 py-1 hover:bg-yellow-200"
        >
          סגור
        </button>
      </div>
    </div>
  );
}


