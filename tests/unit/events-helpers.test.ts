jest.mock('@/lib/analytics', () => ({
  analytics: { track: jest.fn(), init: jest.fn(), identify: jest.fn(), setSuper: jest.fn() },
}));

import { analytics } from '@/lib/analytics';
import { buildTaskPayload, trackTaskAssigned, trackTaskCreated, trackTaskStatusChange } from '@/lib/events';

describe('events helpers', () => {
  const baseTask = {
    id: 't1',
    type: 'pickup_or_dropoff_car',
    priority: 'high',
    created_at: '2025-01-01T10:00:00Z',
    estimated_start: '2025-01-01T11:00:00Z',
    estimated_end: '2025-01-01T12:00:00Z',
  };

  it('buildTaskPayload includes standard fields', () => {
    const p = buildTaskPayload(baseTask, { assigned_to: 'd1' });
    expect(p.task_id).toBe('t1');
    expect(p.type).toBe('pickup_or_dropoff_car');
    expect(p.priority).toBe('high');
    expect(p.assigned_to).toBe('d1');
  });

  it('trackTaskCreated calls analytics.track', () => {
    (analytics.track as any).mockClear();
    trackTaskCreated(baseTask as any, 'd1');
    expect((analytics.track as any).mock.calls[0][0]).toBe('Task Created');
  });

  it('trackTaskAssigned calls analytics.track', () => {
    (analytics.track as any).mockClear();
    trackTaskAssigned(baseTask as any, 'd2');
    expect((analytics.track as any).mock.calls[0][0]).toBe('Task Assigned');
  });

  it('trackTaskStatusChange computes duration and on_time for completed', () => {
    (analytics.track as any).mockClear();
    const t = { ...baseTask, updated_at: '2025-01-01T11:30:00Z' };
    trackTaskStatusChange(t as any, 'completed');
    const payload = (analytics.track as any).mock.calls[0][1];
    expect(payload.duration_ms).toBeGreaterThan(0);
    expect(payload.on_time).toBe(true);
  });
});


