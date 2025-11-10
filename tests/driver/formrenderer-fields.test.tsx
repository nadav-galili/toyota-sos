import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderer, FormSchema } from '@/components/driver/FormRenderer';

describe('FormRenderer renders and updates core field types', () => {
  const schema: FormSchema = [
    { id: 't', type: 'text', title: 'טקסט' },
    { id: 'ta', type: 'textarea', title: 'טקסט ארוך' },
    {
      id: 'sel',
      type: 'select',
      title: 'בחירה',
      options: [
        { value: 'a', label: 'אפשרות א' },
        { value: 'b', label: 'אפשרות ב' },
      ],
    },
    { id: 'cb', type: 'checkbox', title: 'צ’קבוקס' },
    {
      id: 'rd',
      type: 'radio',
      title: 'רדיו',
      options: [
        { value: 'x', label: 'X' },
        { value: 'y', label: 'Y' },
      ],
    },
    { id: 'num', type: 'number', title: 'מספר' },
    { id: 'dt', type: 'date', title: 'תאריך' },
    { id: 'tm', type: 'time', title: 'שעה' },
  ];

  test('renders all controls and updates values', async () => {
    const onChange = jest.fn();
    render(<FormRenderer schema={schema} onChange={onChange} />);

    // text
    const text = screen.getByLabelText('טקסט');
    await userEvent.type(text, ' בדיקה');
    // textarea
    const textarea = screen.getByLabelText('טקסט ארוך');
    await userEvent.type(textarea, ' שורה');
    // select
    const select = screen.getByLabelText('בחירה') as HTMLSelectElement;
    await userEvent.selectOptions(select, 'a');
    // checkbox
    const cb = screen.getByLabelText('צ’קבוקס') as HTMLInputElement;
    await userEvent.click(cb);
    // radio
    const radioY = screen.getByLabelText('Y') as HTMLInputElement;
    await userEvent.click(radioY);
    // number
    const num = screen.getByLabelText('מספר') as HTMLInputElement;
    await userEvent.type(num, '123');
    // date
    const dt = screen.getByLabelText('תאריך') as HTMLInputElement;
    await userEvent.type(dt, '2025-01-02');
    // time
    const tm = screen.getByLabelText('שעה') as HTMLInputElement;
    await userEvent.type(tm, '12:34');

    // Basic assertions that controls reflect inputs
    expect((text as HTMLInputElement).value).toContain('בדיקה');
    expect((textarea as HTMLTextAreaElement).value).toContain('שורה');
    expect(select.value).toBe('a');
    expect(cb.checked).toBe(true);
    expect(radioY.checked).toBe(true);
    expect(num.value).toBe('123');
    expect(dt.value).toBe('2025-01-02');
    expect(tm.value).toBe('12:34');
  });
});


