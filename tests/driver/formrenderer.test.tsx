import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormRenderer } from '@/components/driver/FormRenderer';

describe('FormRenderer scaffold', () => {
  test('renders without fields for empty schema', () => {
    render(<FormRenderer schema={[]} />);
    expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    expect(screen.getByText('לא הוגדרה סכימה לטופס זה')).toBeInTheDocument();
  });
});


