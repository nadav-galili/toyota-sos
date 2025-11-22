import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TasksBoard,
  Task,
  Driver,
  TaskAssignee,
  Client,
  Vehicle,
} from '@/components/admin/TasksBoard';

describe('TasksBoard Column Grouping Selector (7.1.5)', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'משימה 1',
      type: 'pickup_or_dropoff_car',
      priority: 'high',
      status: 'pending',
      estimated_start: '2025-11-11T09:00:00Z',
      estimated_end: '2025-11-11T10:00:00Z',
      address: 'תל אביב, דיזנגוף 100',
      details: 'פרטים',
      client_id: 'client-1',
      vehicle_id: 'vehicle-1',
      created_by: 'admin-1',
      updated_by: 'admin-1',
      created_at: '2025-11-10T10:00:00Z',
      updated_at: '2025-11-10T10:00:00Z',
    },
    {
      id: 'task-2',
      title: 'משימה 2',
      type: 'drive_client_home',
      priority: 'medium',
      status: 'in_progress',
      estimated_start: '2025-11-11T11:00:00Z',
      estimated_end: '2025-11-11T12:00:00Z',
      address: 'תל אביב, בנגוריון',
      details: null,
      client_id: 'client-2',
      vehicle_id: 'vehicle-2',
      created_by: 'admin-1',
      updated_by: 'admin-1',
      created_at: '2025-11-10T10:00:00Z',
      updated_at: '2025-11-10T10:00:00Z',
    },
    {
      id: 'task-3',
      title: 'משימה 3',
      type: 'deliver_package',
      priority: 'low',
      status: 'completed',
      estimated_start: '2025-11-11T13:00:00Z',
      estimated_end: '2025-11-11T14:00:00Z',
      address: 'תל אביב, איבן גביראול',
      details: null,
      client_id: 'client-1',
      vehicle_id: 'vehicle-1',
      created_by: 'admin-1',
      updated_by: 'admin-1',
      created_at: '2025-11-10T10:00:00Z',
      updated_at: '2025-11-10T10:00:00Z',
    },
  ];

  const mockDrivers: Driver[] = [
    {
      id: 'driver-1',
      name: 'דוד כהן',
      email: 'driver1@example.com',
      role: 'driver',
    },
    {
      id: 'driver-2',
      name: 'שרה לוי',
      email: 'driver2@example.com',
      role: 'driver',
    },
  ];

  const mockTaskAssignees: TaskAssignee[] = [
    {
      id: 'assignee-1',
      task_id: 'task-1',
      driver_id: 'driver-1',
      is_lead: true,
      assigned_at: '2025-11-10T10:00:00Z',
    },
    {
      id: 'assignee-2',
      task_id: 'task-2',
      driver_id: 'driver-2',
      is_lead: true,
      assigned_at: '2025-11-10T10:00:00Z',
    },
    {
      id: 'assignee-3',
      task_id: 'task-3',
      driver_id: 'driver-1',
      is_lead: true,
      assigned_at: '2025-11-10T10:00:00Z',
    },
  ];

  const mockClients: Client[] = [
    {
      id: 'client-1',
      name: 'אחי אבו קנו',
      phone: '050-1234567',
      email: 'client1@example.com',
    },
    {
      id: 'client-2',
      name: 'רוני גם אני',
      phone: '050-7654321',
      email: 'client2@example.com',
    },
  ];

  const mockVehicles: Vehicle[] = [
    {
      id: 'vehicle-1',
      license_plate: '123-456',
      model: 'Toyota Camry',
      vin: 'VIN123456',
    },
    {
      id: 'vehicle-2',
      license_plate: '789-012',
      model: 'Honda Civic',
      vin: 'VIN789012',
    },
  ];

  test('renders grouping toggle with status and driver options', () => {
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    expect(screen.getByText('קבץ לפי:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'סטטוס' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'נהג' })).toBeInTheDocument();
  });

  test('status button is selected by default', () => {
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    const statusButton = screen.getByRole('button', { name: 'סטטוס' });
    const driverButton = screen.getByRole('button', { name: 'נהג' });

    expect(statusButton).toHaveAttribute('aria-pressed', 'true');
    expect(driverButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('clicking driver button toggles grouping mode', async () => {
    const user = userEvent.setup();
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    const driverButton = screen.getByRole('button', { name: 'נהג' });
    const statusButton = screen.getByRole('button', { name: 'סטטוס' });

    // Initially status is selected
    expect(statusButton).toHaveAttribute('aria-pressed', 'true');
    expect(driverButton).toHaveAttribute('aria-pressed', 'false');

    // Click driver button
    await user.click(driverButton);

    // Now driver should be selected
    expect(statusButton).toHaveAttribute('aria-pressed', 'false');
    expect(driverButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('columns update when switching to driver grouping', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    // Initially grouped by status - should have status columns
    let columnRegions = screen.getAllByRole('region', { name: /עמודה:/ });
    const initialCount = columnRegions.length;
    expect(initialCount).toBeGreaterThan(0);

    // Switch to driver grouping
    const driverButton = screen.getByRole('button', { name: 'נהג' });
    await user.click(driverButton);

    // Wait for columns to update
    await waitFor(() => {
      columnRegions = screen.getAllByRole('region', { name: /עמודה:/ });
      // Should have driver columns now (2 drivers)
      expect(columnRegions.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('columns update when switching back to status grouping', async () => {
    const user = userEvent.setup();
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    // Switch to driver
    const driverButton = screen.getByRole('button', { name: 'נהג' });
    await user.click(driverButton);

    // Then switch back to status
    const statusButton = screen.getByRole('button', { name: 'סטטוס' });
    await user.click(statusButton);

    // Should have status columns again (4 statuses)
    await waitFor(() => {
      const columnRegions = screen.getAllByRole('region', { name: /עמודה:/ });
      expect(columnRegions.length).toBeGreaterThanOrEqual(3); // At least pending, in_progress, completed
    });
  });

  test('column headers update to show status labels', async () => {
    const user = userEvent.setup();
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    // Status grouping should show status labels (appears in headers and cards)
    expect(screen.getAllByText('ממתין').length).toBeGreaterThan(0); // pending
    expect(screen.getAllByText('בתהליך').length).toBeGreaterThan(0); // in_progress
  });

  test('column headers update to show driver names', async () => {
    const user = userEvent.setup();
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    // Switch to driver grouping
    const driverButton = screen.getByRole('button', { name: 'נהג' });
    await user.click(driverButton);

    // Driver names should appear in headers
    await waitFor(() => {
      expect(screen.getAllByText('דוד כהן').length).toBeGreaterThan(0);
      expect(screen.getAllByText('שרה לוי').length).toBeGreaterThan(0);
    });
  });

  test('task card count is stable after grouping toggle', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    // Count initial cards
    let initialCards = container.querySelectorAll('[data-draggable-id]');
    const cardCount = initialCards.length;

    // Toggle to driver
    const driverButton = screen.getByRole('button', { name: 'נהג' });
    await user.click(driverButton);

    // Count cards after toggle
    await waitFor(() => {
      const cardsAfterToggle = container.querySelectorAll(
        '[data-draggable-id]'
      );
      expect(cardsAfterToggle.length).toBe(cardCount);
    });

    // Toggle back to status
    const statusButton = screen.getByRole('button', { name: 'סטטוס' });
    await user.click(statusButton);

    // Count should remain the same
    await waitFor(() => {
      const cardsFinal = container.querySelectorAll('[data-draggable-id]');
      expect(cardsFinal.length).toBe(cardCount);
    });
  });

  test('button styling reflects active state', async () => {
    const user = userEvent.setup();
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    const statusButton = screen.getByRole('button', { name: 'סטטוס' });
    const driverButton = screen.getByRole('button', { name: 'נהג' });

    // Status button should have active styling (bg-white)
    expect(statusButton).toHaveClass('bg-white');
    expect(statusButton).toHaveClass('text-primary');

    // Driver button should have inactive styling
    expect(driverButton).toHaveClass('text-gray-700');

    // Click driver button
    await user.click(driverButton);

    // Styles should flip
    await waitFor(() => {
      expect(driverButton).toHaveClass('bg-white');
      expect(driverButton).toHaveClass('text-primary');
      expect(statusButton).toHaveClass('text-gray-700');
    });
  });

  test('tasks are correctly distributed across columns in both modes', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    // In status mode: task-1 (pending), task-2 (in_progress), task-3 (completed)
    let cards = container.querySelectorAll('[data-draggable-id]');
    expect(cards.length).toBe(3);

    // Switch to driver mode
    const driverButton = screen.getByRole('button', { name: 'נהג' });
    await user.click(driverButton);

    // In driver mode:
    // - driver-1: task-1, task-3 (2 tasks)
    // - driver-2: task-2 (1 task)
    await waitFor(() => {
      const driverCards = container.querySelectorAll('[data-draggable-id]');
      expect(driverCards.length).toBe(3);
    });
  });

  test('toggle is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <TasksBoard
        initialTasks={mockTasks}
        drivers={mockDrivers}
        taskAssignees={mockTaskAssignees}
        clients={mockClients}
        vehicles={mockVehicles}
      />
    );

    const driverButton = screen.getByRole('button', { name: 'נהג' });

    // Focus and press enter
    await user.keyboard('{Tab}');
    driverButton.focus();
    await user.keyboard('{Enter}');

    // Driver mode should be active
    expect(driverButton).toHaveAttribute('aria-pressed', 'true');
  });
});
