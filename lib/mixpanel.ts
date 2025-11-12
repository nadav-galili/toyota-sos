'use client';

import mixpanel from 'mixpanel-browser';

let inited = false;
const token =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'dbe6cb24df9f2ad1c563a71acd174b9e';

const hasConsent = () => {
  if (typeof window === 'undefined') return false;
  try {
    return (localStorage.getItem('analytics:consent') || 'granted') === 'granted';
  } catch {
    return true;
  }
};

export function initMixpanel() {
  if (inited || typeof window === 'undefined') return;
  mixpanel.init(token, {
    track_pageview: true,
    persistence: 'localStorage',
    autocapture: true,
    record_sessions_percent: 100,
  });
  inited = true;
}

export function identify(userId: string, props?: Record<string, any>) {
  if (!hasConsent()) return;
  initMixpanel();
  mixpanel.identify(userId);
  if (props) mixpanel.people.set(props);
}

export function setSuperProperties(props: Record<string, any>) {
  if (!hasConsent()) return;
  initMixpanel();
  mixpanel.register(props);
}

export function track(event: string, props?: Record<string, any>) {
  if (!hasConsent()) return;
  initMixpanel();
  mixpanel.track(event, props || {});
}

export function reset() {
  try {
    mixpanel.reset();
  } catch {
    // ignore
  }
}


