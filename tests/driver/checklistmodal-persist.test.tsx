import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChecklistModal, ChecklistSchema } from '@/components/driver/ChecklistModal';

const insertMock = jest.fn();
const fromMock = jest.fn(() => ({ insert: insertMock }));
jest.mock('@/lib/auth', () => {
  return {
    createBrowserClient: () => ({
      from: fromMock,
    }),
  };
});

describe('ChecklistModal Supabase persistence', () => {
  const schema: ChecklistSchema = [
    { id: 'agree', type: 'boolean', title: 'אני מאשר', required: true },
    { id: 'name', type: 'string', title: 'שם מלא', required: true },
  ];

  beforeEach(() => {
    insertMock.mockReset();
    fromMock.mockClear();
  });

  test('inserts into task_forms and closes on success when persist enabled', async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <ChecklistModal
        open
        onOpenChange={onOpenChange}
        schema={schema}
        onSubmit={onSubmit}
        persist
        taskId="task-1"
        driverId="driver-1"
      />
    );

    await userEvent.click(screen.getByRole('checkbox', { name: /אני מאשר/ }));
    await userEvent.type(screen.getByRole('textbox', { name: /שם מלא/ }), ' בדיקה');
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));

    expect(fromMock).toHaveBeenCalledWith('task_forms');
    expect(insertMock).toHaveBeenCalledTimes(1);
    const row = insertMock.mock.calls[0][0][0];
    expect(row).toMatchObject({
      task_id: 'task-1',
      driver_id: 'driver-1',
    });
    expect(row.form_data).toBeTruthy();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test('shows error banner and remains open on insert error', async () => {
    insertMock.mockResolvedValueOnce({ error: { message: 'DB error' } });
    const onSubmit = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <ChecklistModal
        open
        onOpenChange={onOpenChange}
        schema={schema}
        onSubmit={onSubmit}
        persist
        taskId="task-2"
      />
    );

    await userEvent.click(screen.getByRole('checkbox', { name: /אני מאשר/ }));
    await userEvent.type(screen.getByRole('textbox', { name: /שם מלא/ }), ' בדיקה');
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));

    expect(screen.getByText('DB error')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});


