// Mock cookies helper to inject role header behavior
const cookiesMock = jest.fn(() => ({
  get: (name: string) => (name === 'toyota_role' ? { value: 'admin' } : undefined),
}));
jest.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}));

jest.mock('@/lib/auth', () => {
  const chain: any = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'a1',
          task_id: 't1',
          actor_id: 'u1',
          action: 'updated',
          changed_at: '2025-01-01T00:00:00Z',
          before: { title: 'Old' },
          after: { title: 'New' },
          diff: { title: { from: 'Old', to: 'New' } },
        },
      ],
      error: null,
    }),
  };
  return {
    createServiceRoleClient: () => chain,
  };
});

// Use dynamic import to bring in the route (so jest mocks apply)
describe('GET /api/admin/tasks/[taskId]/audit', () => {
  const buildRequest = (url: string) => ({ url });

  test('returns audit rows with default pagination', async () => {
    const mod = await import('../../app/api/admin/tasks/[taskId]/audit/handler');
    const result = await mod.listTaskAudit({ taskId: 't1', role: 'admin', limit: 100, offset: 0 });
    expect(result.status).toBe(200);
    expect(Array.isArray((result.body as any).data)).toBe(true);
    expect(((result.body as any).data[0])).toMatchObject({
      task_id: 't1',
      action: 'updated',
      diff: { title: { from: 'Old', to: 'New' } },
    });
  });

  test('rejects non-admin/manager', async () => {
    const mod = await import('../../app/api/admin/tasks/[taskId]/audit/handler');
    const result = await mod.listTaskAudit({ taskId: 't1', role: null });
    expect(result.status).toBe(401);
  });
});


