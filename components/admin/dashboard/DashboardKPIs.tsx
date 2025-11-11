'use client';

import React from 'react';
import { PeriodProvider, usePeriod } from './PeriodContext';
import { PeriodFilter } from './PeriodFilter';
import { KpiCard } from './KpiCard';
import { fetchDashboardData } from '@/lib/dashboard/queries';
import { createBrowserClient } from '@/lib/auth';

function KPIsGrid() {
  const { range } = usePeriod();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Awaited<ReturnType<typeof fetchDashboardData>> | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const supa = createBrowserClient();
        const res = await fetchDashboardData(range, supa);
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range.start, range.end, range.timezone]);

  const summary = data?.summary;

  return (
    <div className="space-y-4">
      <PeriodFilter />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="משימות שנוצרו" value={summary?.tasksCreated ?? 0} loading={loading} error={error} />
        <KpiCard title="משימות שהושלמו" value={summary?.tasksCompleted ?? 0} loading={loading} error={error} />
        <KpiCard title="באיחור" value={summary?.overdueCount ?? 0} loading={loading} error={error} />
        <KpiCard
          title="השלמה בזמן"
          value={`${summary?.onTimeRatePct ?? 0}%`}
          loading={loading}
          error={error}
          secondary="אחוז משימות שהושלמו עד היעד"
        />
        {/* Placeholders for the rest; will be expanded in 8.3 */}
        <KpiCard title="זמן הקצאה→התחלה (ממוצע)" value="—" loading={loading} error={error} />
        <KpiCard title="זמן התחלה→סיום (ממוצע)" value="—" loading={loading} error={error} />
        <KpiCard title="ניצולת נהגים" value="—" loading={loading} error={error} />
        <KpiCard title="ביטולים/השמות מחדש" value="—" loading={loading} error={error} />
        <KpiCard title="הפרות SLA" value="—" loading={loading} error={error} />
      </div>
    </div>
  );
}

export function DashboardKPIs() {
  return (
    <PeriodProvider>
      <KPIsGrid />
    </PeriodProvider>
  );
}


