'use client';

import dayjs from '@/lib/dayjs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TaskCard, TaskCardProps } from '@/components/driver/TaskCard';

export type DriverTask = TaskCardProps;

function intersectsToday(start?: string | Date | null, end?: string | Date | null): boolean {
  const todayStart = dayjs().startOf('day');
  const todayEnd = dayjs().endOf('day');
  const s = start ? dayjs(start) : null;
  const e = end ? dayjs(end) : null;

  if (s && e) {
    // range intersects today
    return s.isBefore(todayEnd) && e.isAfter(todayStart);
  }
  if (s) return s.isAfter(todayStart) && s.isBefore(todayEnd);
  if (e) return e.isAfter(todayStart) && e.isBefore(todayEnd);
  return false;
}

function isOverdue(task: DriverTask): boolean {
  return !!task.estimatedEnd && task.status !== 'completed' && dayjs(task.estimatedEnd).isBefore(dayjs());
}

export function DriverHome({ tasks }: { tasks: DriverTask[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const urlTab = (search.get('tab') as 'today' | 'all' | 'overdue' | null) ?? 'today';
  const [tabState, setTabState] = useState<'today' | 'all' | 'overdue'>(urlTab);

  const setTab = (next: 'today' | 'all' | 'overdue') => {
    const params = new URLSearchParams(search.toString());
    params.set('tab', next);
    router.replace(`${pathname}?${params.toString()}`);
    setTabState(next);
  };

  const filtered = useMemo(() => {
    if (tabState === 'all') return tasks;
    if (tabState === 'overdue') return tasks.filter((t) => isOverdue(t));
    // today
    return tasks.filter((t) => intersectsToday(t.estimatedStart, t.estimatedEnd));
  }, [tabState, tasks]);

  // Pagination (client-side slice for now; can be replaced with server paging)
  const PAGE_SIZE = 10;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = filtered.length > visibleCount;
  const visibleTasks = filtered.slice(0, visibleCount);

  // Reset pagination on tab or tasks change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tabState, tasks]);

  // IntersectionObserver to auto-load next page
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !isLoadingMore) {
            setIsLoadingMore(true);
            // Simulate async load
            setTimeout(() => {
              setVisibleCount((c) => c + PAGE_SIZE);
              setIsLoadingMore(false);
            }, 0);
          }
        }
      },
      { rootMargin: '120px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, isLoadingMore]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'today', label: 'היום' },
          { key: 'all', label: 'הכל' },
          { key: 'overdue', label: 'איחורים' },
        ].map((t) => {
          const active = tabState === (t.key as any);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as any)}
              className={[
                'rounded-md py-2 text-sm font-medium transition-colors',
                active ? 'bg-toyota-primary text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
              ].join(' ')}
              aria-pressed={active}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
        {visibleTasks.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-10">אין משימות להצגה</div>
        ) : null}

        {/* Load more button (fallback) */}
        {hasMore ? (
          <div className="flex justify-center">
            <button
              type="button"
              className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
              disabled={isLoadingMore}
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              {isLoadingMore ? 'טוען…' : 'טען עוד'}
            </button>
          </div>
        ) : null}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} />
      </div>
    </div>
  );
}

// Re-export helpers for testing
export const __internal = { intersectsToday, isOverdue };


