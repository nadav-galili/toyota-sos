'use client';

import React from 'react';

export function InstallAppButton({ className }: { className?: string }) {
  const [deferred, setDeferred] = React.useState<any>(null);
  const [installed, setInstalled] = React.useState(false);
  const [supportsPrompt, setSupportsPrompt] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  const DISMISS_KEY = 'pwa.install.dismissedAt';
  const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsIOS(
      /iphone|ipad|ipod/i.test(navigator.userAgent) && !!(window as any).webkit
    );
    // Respect recent dismissal
    try {
      const last = Number(window.localStorage.getItem(DISMISS_KEY) || '0');
      if (last && Date.now() - last < DISMISS_COOLDOWN_MS) {
        setHidden(true);
      }
    } catch {
      // ignore
    }
    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setSupportsPrompt(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setSupportsPrompt(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt as any);
    window.addEventListener('appinstalled', onInstalled as any);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as any);
      window.removeEventListener('appinstalled', onInstalled as any);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice && choice.outcome !== 'accepted') {
      try {
        window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      setHidden(true);
    }
    setDeferred(null);
    setSupportsPrompt(false);
  };

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setHidden(true);
  };

  if (installed || hidden) return null;

  // iOS Safari: no programmatic prompt
  if (isIOS) {
    return (
      <div
        className={`flex items-center gap-2 rounded border border-gray-200 bg-white/90 px-2 py-1 text-xs text-gray-700 shadow ${
          className ?? ''
        }`}
      >
        <span>להוספה למסך הבית: שתף → הוסף למסך הבית</span>
        <button onClick={dismiss} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>
    );
  }

  if (!supportsPrompt) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded bg-white/90 px-2 py-1 shadow border border-gray-200 ${
        className ?? ''
      }`}
    >
      <button
        onClick={install}
        className="rounded bg-primary px-3 py-1 text-sm font-semibold text-white hover:bg-primary/90"
      >
        התקן אפליקציה
      </button>
      <button
        onClick={dismiss}
        className="text-xs text-gray-600 hover:text-gray-800"
      >
        לא עכשיו
      </button>
    </div>
  );
}
