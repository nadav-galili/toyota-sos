import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUpload } from '@/components/driver/ImageUpload';

jest.mock('@/lib/auth', () => ({
  createBrowserClient: () => ({
    storage: {
      from: (bucket: string) => ({
        upload: jest.fn(async (_path: string, _file: File, _opts: any) => ({ data: {}, error: null })),
        createSignedUrl: jest.fn(async (path: string, _exp: number) => ({
          data: { signedUrl: `https://example.com/signed/${encodeURIComponent(path)}` },
          error: null,
        })),
      }),
    },
  }),
}));

function createFile(name: string, type: string, size = 1234) {
  const file = new File(['x'.repeat(size)], name, { type });
  Object.defineProperty(file, 'lastModified', { value: 1700000000000 });
  return file;
}

describe('ImageUpload storage upload (5.4.5)', () => {
  const origCreateObjectURL = URL.createObjectURL;
  beforeAll(() => {
    URL.createObjectURL = (f: any) => `preview://${f.name}-${f.size}`;
  });
  afterAll(() => {
    URL.createObjectURL = origCreateObjectURL;
  });

  test('uploads to bucket with path convention and returns signed URLs', async () => {
    const onUploaded = jest.fn();
    const { container } = render(
      <ImageUpload bucket="images" taskId="task-123" onUploaded={onUploaded} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const f1 = createFile('photo 1.png', 'image/png', 500);
    const f2 = createFile('photo-2.jpg', 'image/jpeg', 600);
    Object.defineProperty(input, 'files', { value: [f1, f2], writable: false });
    fireEvent.change(input);

    const uploadBtn = screen.getByRole('button', { name: 'העלה' });
    await waitFor(() => expect(uploadBtn).not.toBeDisabled());
    fireEvent.click(uploadBtn);

    await waitFor(() => expect(onUploaded).toHaveBeenCalledTimes(1));
    const metas = onUploaded.mock.calls[0][0];
    expect(Array.isArray(metas)).toBe(true);
    expect(metas.length).toBe(2);
    // path should start with taskId/YYYYMMDD/
    for (const m of metas) {
      expect(m.path.startsWith('task-123/')).toBe(true);
      expect(m.path).toMatch(/task-123\/\d{8}\//);
      // ends with sanitized filename
      expect(m.path).toMatch(/photo_1\.png|photo-2\.jpg/);
      expect(m.signedUrl).toContain(encodeURIComponent(m.path));
    }
  });
});


