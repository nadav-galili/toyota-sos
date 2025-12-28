import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('TaskDetails a11y and collapsible behavior', () => {
  const taskId = '00000000-0000-0000-0000-000000000002';

  beforeEach(() => {
    rpcMock.mockReset();
    rpcMock.mockResolvedValue({
      data: [
        {
          id: taskId,
          title: 'תיקון צמיג',
          type: 'other',
          priority: 'medium',
          status: 'pending',
          details: 'פרטי עבודה',
          estimated_start: null,
          estimated_end: null,
          address: 'רחוב הבנים 10, הרצליה',
          client_name: 'ישראל ישראלי',
          vehicle_plate: '77-888-99',
          vehicle_model: 'Yaris',
          updated_at: new Date().toISOString(),
        },
      ],
      error: null,
    });
  });

  test('details section is displayed when details exist', async () => {
    const { container } = render(<TaskDetails taskId={taskId} />);
    // Wait for header text
    expect(await screen.findByText('תיקון צמיג')).toBeInTheDocument();

    // Details section should be displayed directly (not collapsible)
    expect(screen.getByText('תיאור המשימה:')).toBeInTheDocument();
    expect(screen.getByText('פרטי עבודה')).toBeInTheDocument();
  });

  test('details are always visible when present', async () => {
    render(<TaskDetails taskId={taskId} />);

    // Wait for content to load
    expect(await screen.findByText('תיקון צמיג')).toBeInTheDocument();

    // Details should always be visible (not collapsible)
    expect(screen.getByText('תיאור המשימה:')).toBeInTheDocument();
    expect(screen.getByText('פרטי עבודה')).toBeInTheDocument();
  });
});


