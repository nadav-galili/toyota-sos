import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderer, type FormSchema } from '@/components/driver/FormRenderer';

describe('FormRenderer validation', () => {
  test('required text and checkbox show errors and block submit', async () => {
    const onSubmit = jest.fn();
    const schema: FormSchema = [
      { id: 'name', type: 'text', title: 'שם', required: true },
      { id: 'agree', type: 'checkbox', title: 'מאשר', required: true },
    ];
    render(<FormRenderer schema={schema} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));

    expect(await screen.findAllByText('שדה חובה')).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/שם/), 'ישראל');
    await userEvent.click(screen.getByLabelText(/מאשר/));
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  test('minLength/maxLength and pattern', async () => {
    const onSubmit = jest.fn();
    const schema: FormSchema = [
      { id: 'short', type: 'text', title: 'קצר', constraints: { minLength: 3 } },
      { id: 'long', type: 'text', title: 'ארוך', constraints: { maxLength: 5 } },
      { id: 'digits', type: 'text', title: 'מספרים בלבד', constraints: { pattern: '^[0-9]+$' } },
    ];
    render(<FormRenderer schema={schema} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('קצר'), 'ab');
    await userEvent.type(screen.getByLabelText('ארוך'), 'abcdef');
    await userEvent.type(screen.getByLabelText('מספרים בלבד'), '12a');
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));

    expect(await screen.findByText(/מינימום 3 תווים/)).toBeInTheDocument();
    expect(await screen.findByText(/מקסימום 5 תווים/)).toBeInTheDocument();
    expect(await screen.findByText(/פורמט לא תקין/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // fix and submit
    await userEvent.clear(screen.getByLabelText('קצר'));
    await userEvent.type(screen.getByLabelText('קצר'), 'abc');
    await userEvent.clear(screen.getByLabelText('ארוך'));
    await userEvent.type(screen.getByLabelText('ארוך'), 'abc');
    await userEvent.clear(screen.getByLabelText('מספרים בלבד'));
    await userEvent.type(screen.getByLabelText('מספרים בלבד'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  test('number min/max', async () => {
    const onSubmit = jest.fn();
    const schema: FormSchema = [
      { id: 'qty', type: 'number', title: 'כמות', constraints: { min: 2, max: 5 } },
    ];
    render(<FormRenderer schema={schema} onSubmit={onSubmit} />);

    // below min
    await userEvent.type(screen.getByLabelText('כמות'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));
    expect(await screen.findByText(/ערך מינימלי 2/)).toBeInTheDocument();

    // above max
    await userEvent.clear(screen.getByLabelText('כמות'));
    await userEvent.type(screen.getByLabelText('כמות'), '6');
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));
    expect(await screen.findByText(/ערך מקסימלי 5/)).toBeInTheDocument();

    // ok
    await userEvent.clear(screen.getByLabelText('כמות'));
    await userEvent.type(screen.getByLabelText('כמות'), '3');
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});


