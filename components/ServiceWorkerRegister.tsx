'use client';

import React from 'react';

export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Disable existing service workers + caches for now.
    const controller = new AbortController();
    const cleanup = async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      } catch {
        // ignore
      }
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {
          // ignore
        }
      }
    };

    const t = setTimeout(cleanup, 0);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, []);
  return null;
}


