import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChecklistModal, ChecklistSchema } from '@/components/driver/ChecklistModal';

describe('ChecklistModal a11y polish', () => {
  const schema: ChecklistSchema = [
    { id: 'agree', type: 'boolean', title: 'אני מאשר', required: true },
    { id: 'name', type: 'string', title: 'שם מלא', required: true },
  ];

  test('sets aria-invalid and shows role=alert on validation', async () => {
    render(<ChecklistModal open onOpenChange={() => {}} schema={schema} onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'שמור' }));
    // Two fields invalid
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    // Inputs should reflect aria-invalid=true
    expect(screen.getByRole('checkbox', { name: /אני מאשר/ })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', { name: /שם מלא/ })).toHaveAttribute('aria-invalid', 'true');
  });
});


