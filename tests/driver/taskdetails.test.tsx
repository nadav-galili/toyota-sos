import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskDetails } from '@/components/driver/TaskDetails';

// Mock Supabase browser client RPC
const rpcMock = jest.fn();
jest.mock('@/lib/auth', () => {
  return {
    createBrowserClient: () => ({
      rpc: rpcMock,
    }),
  };
});

describe('TaskDetails - Waze deeplink and sections', () => {
  const taskId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    rpcMock.mockReset();
  });

  test('renders Waze deeplink when address exists', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [
        {
          id: taskId,
          title: 'מסירת רכב',
          type: 'pickup_or_dropoff_car',
          priority: 'high',
          status: 'pending',
          details: 'פרטים',
          estimated_start: null,
          estimated_end: null,
          address: 'תל אביב, דיזנגוף 100',
          client_name: 'לקוח בדיקה',
          vehicle_plate: '12-345-67',
          vehicle_model: 'Corolla',
          updated_at: new Date().toISOString(),
        },
      ],
      error: null,
    });

    render(<TaskDetails taskId={taskId} />);

    // Header title
    expect(await screen.findByText('מסירת רכב')).toBeInTheDocument();
    // Waze link
    const wazeLink = await screen.findByRole('link', { name: 'פתיחה ב‑Waze' });
    expect(wazeLink).toHaveAttribute(
      'href',
      `waze://?navigate=yes&q=${encodeURIComponent('תל אביב, דיזנגוף 100')}`
    );
  });

  test('does not render Waze link when address missing', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [
        {
          id: taskId,
          title: 'בדיקה ללא כתובת',
          type: 'other',
          priority: 'low',
          status: 'pending',
          details: null,
          estimated_start: null,
          estimated_end: null,
          address: null,
          client_name: null,
          vehicle_plate: null,
          vehicle_model: null,
          updated_at: new Date().toISOString(),
        },
      ],
      error: null,
    });

    render(<TaskDetails taskId={taskId} />);
    expect(await screen.findByText('בדיקה ללא כתובת')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'פתיחה ב‑Waze' })).toBeNull();
  });
});


