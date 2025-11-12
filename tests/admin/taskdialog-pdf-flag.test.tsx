import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDialog } from '@/components/admin/TaskDialog';

// Mock feature flags: enable pdf_generation, disable others
jest.mock('@/lib/useFeatureFlag', () => ({
  useFeatureFlag: (key: string) => {
    if (key === 'pdf_generation') return true;
    return false;
  },
}));

// Spy on utils/pdf
const downloadSpy = jest.fn();
jest.mock('@/utils/pdf', () => {
  return {
    downloadBlob: (...args: any[]) => (downloadSpy as any)(...args),
    generateTaskPdfLikeBlob: (payload: any) =>
      new Blob([JSON.stringify(payload)], { type: 'application/pdf' }),
  };
});

describe('TaskDialog PDF export flag', () => {
  test('shows PDF export when flag enabled and triggers download', async () => {
    render(
      <TaskDialog
        open={true}
        onOpenChange={() => {}}
        mode="edit"
        task={{
          id: 't99',
          title: 'Hello',
          type: 'other',
          priority: 'medium',
          status: 'pending',
          details: '',
          estimated_start: '',
          estimated_end: '',
          address: '',
          client_id: null,
          vehicle_id: null,
          created_by: null,
          updated_by: null,
          created_at: '',
          updated_at: '',
        } as any}
        drivers={[]}
        clients={[]}
        vehicles={[]}
      />
    );

    const btn = await screen.findByRole('button', { name: 'ייצוא PDF' });
    fireEvent.click(btn);

    expect(downloadSpy).toHaveBeenCalled();
    const [blob, filename] = downloadSpy.mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(String(filename)).toMatch(/task-t99\.pdf$/);
  });
});


