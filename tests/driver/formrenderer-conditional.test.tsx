import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderer, FormSchema } from '@/components/driver/FormRenderer';

describe('FormRenderer conditional visibility', () => {
  const schema: FormSchema = [
    { id: 'toggleExtra', type: 'checkbox', title: 'שדה בוליאני' },
    {
      id: 'extraInfo',
      type: 'text',
      title: 'מידע נוסף',
      dependsOn: { when: 'all', rules: [{ fieldId: 'toggleExtra', operator: 'equals', value: true }] },
    },
    {
      id: 'choice',
      type: 'select',
      title: 'בחירה',
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ],
    },
    {
      id: 'onlyWhenB',
      type: 'text',
      title: 'רק כש-B',
      dependsOn: { when: 'all', rules: [{ fieldId: 'choice', operator: 'equals', value: 'b' }] },
    },
  ];

  test('hides and shows dependent fields based on values', async () => {
    render(<FormRenderer schema={schema} />);

    // Initially hidden
    expect(screen.queryByLabelText('מידע נוסף')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('רק כש-B')).not.toBeInTheDocument();

    // Toggle checkbox -> show extraInfo
    await userEvent.click(screen.getByLabelText('שדה בוליאני'));
    expect(await screen.findByLabelText('מידע נוסף')).toBeInTheDocument();

    // Select B -> show onlyWhenB
    await userEvent.selectOptions(screen.getByLabelText('בחירה'), 'b');
    expect(await screen.findByLabelText('רק כש-B')).toBeInTheDocument();

    // Switch back to A -> hide onlyWhenB
    await userEvent.selectOptions(screen.getByLabelText('בחירה'), 'a');
    await waitFor(() => {
      expect(screen.queryByLabelText('רק כש-B')).not.toBeInTheDocument();
    });
  });

  test('submit payload excludes hidden fields', async () => {
    const onSubmit = jest.fn();
    render(<FormRenderer schema={schema} onSubmit={onSubmit} />);

    // Make extraInfo visible and fill
    await userEvent.click(screen.getByLabelText('שדה בוליאני'));
    const visibleText = await screen.findByLabelText('מידע נוסף');
    await userEvent.type(visibleText, 'abc');

    // Make onlyWhenB visible then hide it again
    await userEvent.selectOptions(screen.getByLabelText('בחירה'), 'b');
    const onlyWhenB = await screen.findByLabelText('רק כש-B');
    await userEvent.type(onlyWhenB, 'xyz');
    await userEvent.selectOptions(screen.getByLabelText('בחירה'), 'a'); // now hidden

    // Submit
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload).toHaveProperty('toggleExtra', true);
      expect(payload).toHaveProperty('extraInfo'); // visible at submit
      expect(payload).not.toHaveProperty('onlyWhenB'); // hidden at submit
    });
  });
});


