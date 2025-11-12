'use client';

import React from 'react';
import { initMixpanel, setSuperProperties } from '@/lib/mixpanel';

export function MixpanelInit() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).__mixpanel_inited) return;
    initMixpanel();
    setSuperProperties({ app_version: 'web', device_type: 'web' });
    (window as any).__mixpanel_inited = true;
  }, []);
  return null;
}


