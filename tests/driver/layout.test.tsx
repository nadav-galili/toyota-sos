import React from 'react';
import { render, screen } from '@testing-library/react';
import DriverLayout from '@/app/driver/layout';

jest.mock('next/navigation', () => {
  return {
    usePathname: jest.fn(),
  };
});

const { usePathname } = jest.requireMock('next/navigation') as {
  usePathname: jest.Mock;
};

function renderWithPath(pathname: string) {
  usePathname.mockReturnValue(pathname);
  return render(
    <DriverLayout>
      <div data-testid="content">content</div>
    </DriverLayout>
  );
}

describe('DriverLayout bottom navigation', () => {
  test('renders labels and RTL container', () => {
    renderWithPath('/driver');
    expect(screen.getByText('משימות')).toBeInTheDocument();
    expect(screen.getByText('התראות')).toBeInTheDocument();
    expect(screen.getByText('פרופיל')).toBeInTheDocument();

    // root wrapper should have dir=rtl via closest main container
    const root = screen.getByTestId('content').closest('div');
    expect(root?.parentElement?.getAttribute('dir')).toBe('rtl');
  });

  test('active state: /driver exact only', () => {
    renderWithPath('/driver');
    const tasks = screen.getByRole('link', { name: 'משימות' });
    const notifications = screen.getByRole('link', { name: 'התראות' });
    expect(tasks).toHaveAttribute('aria-current', 'page');
    expect(notifications).not.toHaveAttribute('aria-current');
  });

  test('active state: notifications when pathname starts with /driver/notifications', () => {
    renderWithPath('/driver/notifications');
    const notifications = screen.getByRole('link', { name: 'התראות' });
    const tasks = screen.getByRole('link', { name: 'משימות' });
    expect(notifications).toHaveAttribute('aria-current', 'page');
    expect(tasks).not.toHaveAttribute('aria-current');
  });

  test('hit area >= 44px class present', () => {
    renderWithPath('/driver');
    const link = screen.getByRole('link', { name: 'משימות' });
    expect(link.className).toMatch(/min-h-\[44px\]/);
  });

  test('keyboard focus order implied by DOM order', () => {
    renderWithPath('/driver');
    const allLinks = screen.getAllByRole('link');
    expect(allLinks[0]).toHaveTextContent('משימות');
    expect(allLinks[1]).toHaveTextContent('התראות');
    expect(allLinks[2]).toHaveTextContent('פרופיל');
  });
});


