// Mock createServerClient to control Supabase responses
jest.mock('@/lib/auth', () => ({
  createServerClient: jest.fn(),
}));
import { createServerClient } from '@/lib/auth';
import {
  getTasksCreatedCount,
  getTasksCompletedCount,
  getOverdueCount,
  getOnTimeRate,
  getCreatedCompletedSeries,
} from '@/lib/dashboard/queries';

type Range = { start: string; end: string; timezone?: string };
const range: Range = {
  start: new Date('2025-01-01T00:00:00Z').toISOString(),
  end: new Date('2025-01-07T23:59:59Z').toISOString(),
};

function makeCountClient({ created = 3, completed = 2, overdue = 1 }: { created?: number; completed?: number; overdue?: number }) {
  const client: any = {};
  (createServerClient as jest.Mock).mockImplementation(() => client);
  let selectSpec: { head?: boolean; fields?: string } = {};
  client.from = jest.fn().mockImplementation((table: string) => {
    const chain: any = {};
    chain.select = jest.fn().mockImplementation((fields: string, opts?: any) => {
      selectSpec = { head: opts?.head, fields };
      return chain;
    });
    chain.eq = jest.fn().mockImplementation((col: string, val: any) => {
      if (selectSpec.head && col === 'status' && val === 'completed') {
        chain.lt = jest.fn().mockResolvedValue({ count: completed, error: null });
      }
      return chain;
    });
    chain.neq = jest.fn().mockImplementation((col: string, val: any) => {
      if (selectSpec.head && col === 'status' && val === 'completed') {
        chain.lt = jest.fn().mockResolvedValue({ count: overdue, error: null });
      }
      return chain;
    });
    chain.in = jest.fn().mockReturnValue(chain);
    chain.gte = jest.fn().mockReturnValue(chain);
    chain.lt = jest.fn().mockImplementation(() => {
      if (selectSpec.head) {
        if (table === 'tasks' && selectSpec.fields === 'id') {
          return Promise.resolve({ count: created, error: null });
        }
      }
      return chain;
    });
    chain.limit = jest.fn().mockImplementation(() => {
      // datasets path
      if (table === 'tasks' && selectSpec.fields?.includes('created_at')) {
        return Promise.resolve({ data: [{ id: 'a', created_at: '2025-01-02T12:00:00Z' }], error: null });
      }
      if (table === 'tasks' && selectSpec.fields?.includes('updated_at') && selectSpec.fields?.includes('estimated_end')) {
        return Promise.resolve({
          data: [
            { id: 'c1', updated_at: '2025-01-03T10:00:00Z', estimated_end: '2025-01-03T12:00:00Z', status: 'completed' },
            { id: 'c2', updated_at: '2025-01-04T14:00:00Z', estimated_end: '2025-01-04T12:00:00Z', status: 'completed' }, // late
          ],
          error: null,
        });
      }
      if (table === 'tasks' && selectSpec.fields?.includes('updated_at')) {
        return Promise.resolve({ data: [{ id: 'b', updated_at: '2025-01-03T12:00:00Z' }], error: null });
      }
      return Promise.resolve({ data: [], error: null });
    });
    // If count/head query, finish on lt()
    return chain;
  });
  return client;
}

describe('dashboard queries (8.1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns created/completed/overdue counts and caches created', async () => {
    makeCountClient({ created: 5, completed: 3, overdue: 2 });
    const c1 = await getTasksCreatedCount(range);
    expect(c1).toBe(5);
    // second call should hit cache and not call createServerClient again
    const callsBefore = (createServerClient as jest.Mock).mock.calls.length;
    const c2 = await getTasksCreatedCount(range);
    expect(c2).toBe(5);
    expect((createServerClient as jest.Mock).mock.calls.length).toBe(callsBefore); // no new client due to cache

    // completed count (not cached in this test)
    const completed = await getTasksCompletedCount(range);
    expect(completed).toBe(3);

    // overdue count
    const overdue = await getOverdueCount(range);
    expect(overdue).toBe(2);
  });

  it('builds created/completed daily series and computes on-time rate', async () => {
    makeCountClient({ created: 0, completed: 0, overdue: 0 });
    const series = await getCreatedCompletedSeries(range);
    expect(Array.isArray(series)).toBe(true);
    expect(series.some((p) => p.created === 1 || p.completed === 1)).toBe(true);

    const onTime = await getOnTimeRate(range);
    // from mock: 1 on-time, 1 late => 50%
    expect(onTime).toBe(50);
  });
});


