import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardKPIs } from '@/components/admin/dashboard/DashboardKPIs';
import { PeriodProvider } from '@/components/admin/dashboard/PeriodContext';
import { ConnectivityProvider } from '@/components/ConnectivityProvider';
import { OfflineBanner } from '@/components/OfflineBanner';

function setOnline(val: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    value: val,
    configurable: true,
  });
}

describe('Connectivity + DashboardKPIs', () => {
  beforeEach(() => {
    setOnline(true);
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { summary: { tasksCreated: 1, tasksCompleted: 1, overdueCount: 0, onTimeRatePct: 100 }, datasets: { createdCompletedSeries: [], overdueByDriver: [], onTimeVsLate: { onTime: 1, late: 0 }, funnel: [] } } }),
      text: async () => '',
    });
  });

  it('skips fetch when offline and shows banner', async () => {
    setOnline(false);
    window.dispatchEvent(new Event('offline'));
    render(
      <ConnectivityProvider>
        <OfflineBanner />
        <PeriodProvider>
          <DashboardKPIs />
        </PeriodProvider>
      </ConnectivityProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches when online', async () => {
    setOnline(true);
    window.dispatchEvent(new Event('online'));
    render(
      <ConnectivityProvider>
        <PeriodProvider>
          <DashboardKPIs />
        </PeriodProvider>
      </ConnectivityProvider>
    );
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});


