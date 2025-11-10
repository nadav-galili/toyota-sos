import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/driver/TaskCard';

describe('TaskCard', () => {
  const baseProps = {
    id: 't-1',
    title: 'מסירת רכב ללקוח',
    type: 'pickup_or_dropoff_car',
    priority: 'high' as const,
    status: 'pending' as const,
    estimatedStart: new Date('2025-01-01T10:00:00Z'),
    estimatedEnd: new Date('2025-01-01T12:30:00Z'),
    address: 'תל אביב, דיזנגוף 100',
    clientName: 'לקוח א',
    vehicle: { licensePlate: '12-345-67', model: 'Corolla' },
  };

  test('renders badges and title/type', () => {
    render(<TaskCard {...baseProps} />);
    expect(screen.getByText(baseProps.title)).toBeInTheDocument();
    expect(screen.getByText(baseProps.type)).toBeInTheDocument();

    // Priority and status pills present with expected classes
    const priorityPill = screen.getByText('high');
    expect(priorityPill).toBeInTheDocument();
    expect(priorityPill.className).toMatch(/bg-red-600/);

    const statusPill = screen.getByText('pending');
    expect(statusPill).toBeInTheDocument();
    expect(statusPill.className).toMatch(/bg-gray-500/);
  });

  test('formats time window (DD/MM/YYYY HH:mm – DD/MM/YYYY HH:mm)', () => {
    render(<TaskCard {...baseProps} />);
    const timeRow = screen.getByText(/חלון זמן:/);
    // Verify generic pattern irrespective of timezone specifics
    expect(timeRow.textContent).toMatch(
      /חלון זמן:\s*\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}\s–\s\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}/
    );
  });

  test('creates Waze deeplink with encoded address', () => {
    render(<TaskCard {...baseProps} />);
    const link = screen.getByRole('link', { name: 'פתיחה ב-Waze' }) as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href.startsWith('waze://?navigate=yes&q=')).toBe(true);
    const encoded = link.href.split('q=')[1];
    expect(decodeURIComponent(encoded)).toContain(baseProps.address);
  });

  test('matches snapshot', () => {
    const { container } = render(<TaskCard {...baseProps} />);
    expect(container).toMatchSnapshot();
  });
});


