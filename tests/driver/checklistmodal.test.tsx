import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChecklistModal, ChecklistSchema } from '@/components/driver/ChecklistModal';

describe('ChecklistModal schema rendering', () => {
  const schema: ChecklistSchema = [
    { id: 'agree', type: 'boolean', title: 'אני מאשר', description: 'סמן לאישור' },
    { id: 'name', type: 'string', title: 'שם מלא', description: 'הכנס את שמך' },
    { id: 'notes', type: 'textarea', title: 'הערות', description: 'פרטים נוספים' },
  ];

  test('renders controls for boolean, string, and textarea and submits values', async () => {
    const onSubmit = jest.fn();
    render(<ChecklistModal open onOpenChange={() => {}} schema={schema} onSubmit={onSubmit} />);

    // boolean
    const agree = screen.getByRole('checkbox', { name: /אני מאשר/ });
    // string
    const name = screen.getByRole('textbox', { name: /שם מלא/ });
    // textarea
    const notes = screen.getByRole('textbox', { name: /הערות/ });

    await userEvent.click(agree);
    await userEvent.type(name, ' ישראל ישראלי');
    await userEvent.type(notes, ' בדיקה');

    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      agree: true,
      name: ' ישראל ישראלי',
      notes: ' בדיקה',
    });
  });
});


