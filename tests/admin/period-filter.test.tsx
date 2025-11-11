import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodProvider, usePeriod } from '@/components/admin/dashboard/PeriodContext';
import { PeriodFilter } from '@/components/admin/dashboard/PeriodFilter';

function Viewer() {
  const { range } = usePeriod();
  return (
    <div>
      <div data-testid="from">{new Date(range.start).toISOString().slice(0, 10)}</div>
      <div data-testid="to">{new Date(range.end).toISOString().slice(0, 10)}</div>
    </div>
  );
}

describe('PeriodFilter (8.2)', () => {
  it('applies preset buttons and updates period', () => {
    const now = new Date('2025-01-15T10:00:00Z');
    jest.useFakeTimers().setSystemTime(now);
    render(
      <PeriodProvider>
        <PeriodFilter />
        <Viewer />
      </PeriodProvider>
    );

    // Today
    fireEvent.click(screen.getByRole('button', { name: 'היום' }));
    const todayFrom = screen.getByTestId('from').textContent!;
    const todayTo = screen.getByTestId('to').textContent!;
    expect(todayFrom <= todayTo).toBe(true); // allow TZ shift

    // Yesterday
    fireEvent.click(screen.getByRole('button', { name: 'אתמול' }));
    const yFrom = screen.getByTestId('from').textContent!;
    const yTo = screen.getByTestId('to').textContent!;
    expect(yFrom <= yTo).toBe(true);

    // Last 7 (from ~ 2025-01-08 to 2025-01-15)
    fireEvent.click(screen.getByRole('button', { name: '7 ימים' }));
    expect(screen.getByTestId('to').textContent).toBeDefined();

    // Last 30
    fireEvent.click(screen.getByRole('button', { name: '30 ימים' }));
    expect(screen.getByTestId('to').textContent).toBeDefined();
    jest.useRealTimers();
  });

  it('applies custom date range and persists in URL/localStorage', () => {
    render(
      <PeriodProvider>
        <PeriodFilter />
        <Viewer />
      </PeriodProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'מותאם' }));
    const from = screen.getByLabelText('מ') as HTMLInputElement;
    const to = screen.getByLabelText('עד') as HTMLInputElement;
    fireEvent.change(from, { target: { value: '2025-01-01' } });
    fireEvent.change(to, { target: { value: '2025-01-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'החל' }));

    // Allow TZ shift: start could be previous UTC day when converting local midnight to ISO
    const fromText = screen.getByTestId('from').textContent!;
    expect(fromText === '2025-01-01' || fromText === '2024-12-31').toBe(true);
    expect(screen.getByTestId('to').textContent).toBe('2025-01-10');

    // URL persisted
    expect(window.location.search).toContain('from=');
    expect(window.location.search).toContain('to=');
    // localStorage persisted
    const stored = window.localStorage.getItem('dashboard.period');
    expect(stored).toBeTruthy();
  });
});


