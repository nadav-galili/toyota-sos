jest.mock('mixpanel-browser', () => ({
  init: jest.fn(),
  identify: jest.fn(),
  people: { set: jest.fn() },
  register: jest.fn(),
  track: jest.fn(),
  reset: jest.fn(),
}));

import mp from 'mixpanel-browser';
import { initMixpanel, identify, setSuperProperties, track } from '@/lib/mixpanel';

describe('mixpanel helpers', () => {
  beforeEach(() => {
    (global as any).localStorage = {
      store: {} as any,
      getItem(k: string) { return this.store[k]; },
      setItem(k: string, v: string) { this.store[k] = v; },
      removeItem(k: string) { delete this.store[k]; },
    };
    (global as any).localStorage.setItem('analytics:consent', 'granted');
    jest.clearAllMocks();
  });

  it('initializes and calls identify/people.set/register/track', () => {
    initMixpanel();
    identify('u1', { $email: 'a@b.c' });
    setSuperProperties({ role: 'admin' });
    track('Test', { a: 1 });
    expect((mp.init as any).mock.calls.length).toBeGreaterThan(0);
    expect((mp.identify as any).mock.calls[0][0]).toBe('u1');
    expect((mp.people.set as any).mock.calls[0][0].$email).toBe('a@b.c');
    expect((mp.register as any).mock.calls[0][0].role).toBe('admin');
    expect((mp.track as any).mock.calls[0][0]).toBe('Test');
  });
});


