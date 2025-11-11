'use client';

import React from 'react';
import { subscribeToPush } from '@/lib/push';

export function PermissionPrompt() {
  const [status, setStatus] = React.useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [message, setMessage] = React.useState<string>('');

  const onEnable = async () => {
    try {
      setStatus('requesting');
      setMessage('');
      const res = await subscribeToPush();
      if (res.ok) {
        setStatus('granted');
        setMessage('התראות הופעלו בהצלחה');
      } else {
        setStatus(res.reason === 'granted' ? 'granted' : res.reason === 'denied' ? 'denied' : 'error');
        setMessage(res.reason === 'denied' ? 'בקשת ההתראות נדחתה' : 'ארעה שגיאה בהפעלת התראות');
      }
    } catch {
      setStatus('error');
      setMessage('ארעה שגיאה בהפעלת התראות');
    }
  };

  return (
    <div dir="rtl" className="rounded-md border p-3 bg-white">
      <h3 className="text-sm font-medium">התראות</h3>
      <p className="mt-1 text-xs text-gray-700">קבל התראות על משימות חדשות ועדכונים בזמן אמת.</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onEnable}
          disabled={status === 'requesting' || status === 'granted'}
          className="rounded-md bg-toyota-primary px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
          aria-busy={status === 'requesting' ? 'true' : undefined}
        >
          הפעל התראות
        </button>
        {message ? <span className="text-xs text-gray-700">{message}</span> : null}
      </div>
    </div>
  );
}


