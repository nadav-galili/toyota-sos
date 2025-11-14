'use client';

import React from 'react';

type ConnectivityState = {
  isOnline: boolean;
  lastOnlineAt: number | null;
};

const ConnectivityContext = React.createContext<ConnectivityState>({
  isOnline: true,
  lastOnlineAt: null,
});

export function useConnectivity() {
  return React.useContext(ConnectivityContext);
}

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  // Start as "online" by default to avoid false offline state on initial load.
  // We'll rely on real 'online' / 'offline' events to update this.
  const [isOnline, setIsOnline] = React.useState<boolean>(true);
  const [lastOnlineAt, setLastOnlineAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => {
      setIsOnline(true);
      setLastOnlineAt(Date.now());
    };
    const onOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline, lastOnlineAt }}>
      {children}
    </ConnectivityContext.Provider>
  );
}


