'use client';

import React from 'react';
import { usePeriod, PeriodRange } from './PeriodContext';

function isoDayStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}
function isoDayEnd(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function makeRange(kind: 'today' | 'yesterday' | 'last7' | 'last30'): PeriodRange {
  const now = new Date();
  if (kind === 'today') {
    const start = isoDayStart(now);
    const end = isoDayEnd(now);
    return { start, end, timezone: 'UTC' };
  }
  if (kind === 'yesterday') {
    const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return { start: isoDayStart(y), end: isoDayEnd(y), timezone: 'UTC' };
  }
  const days = kind === 'last7' ? 7 : 30;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { start: startDate.toISOString(), end: now.toISOString(), timezone: 'UTC' };
}

export function PeriodFilter({ onChange }: { onChange?: (r: PeriodRange) => void }) {
  const { range, setRange } = usePeriod();
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState<string>('');
  const [customTo, setCustomTo] = React.useState<string>('');

  const apply = (r: PeriodRange) => {
    setRange(r);
    onChange?.(r);
  };

  return (
    <div dir="rtl" className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1" role="group" aria-label="טווח זמן">
        <button
          className="px-3 py-1 text-sm rounded bg-white hover:bg-gray-50"
          onClick={() => apply(makeRange('today'))}
        >
          היום
        </button>
        <button
          className="px-3 py-1 text-sm rounded bg-white hover:bg-gray-50"
          onClick={() => apply(makeRange('yesterday'))}
        >
          אתמול
        </button>
        <button
          className="px-3 py-1 text-sm rounded bg-white hover:bg-gray-50"
          onClick={() => apply(makeRange('last7'))}
        >
          7 ימים
        </button>
        <button
          className="px-3 py-1 text-sm rounded bg-white hover:bg-gray-50"
          onClick={() => apply(makeRange('last30'))}
        >
          30 ימים
        </button>
        <button
          className="px-3 py-1 text-sm rounded bg-white hover:bg-gray-50"
          onClick={() => setCustomOpen((v) => !v)}
          aria-expanded={customOpen}
        >
          מותאם
        </button>
      </div>

      {customOpen && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">
            מ
            <input
              type="date"
              className="ml-1 rounded border border-gray-300 px-2 py-1 text-sm"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </label>
          <label className="text-sm text-gray-700">
            עד
            <input
              type="date"
              className="ml-1 rounded border border-gray-300 px-2 py-1 text-sm"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </label>
          <button
            className="rounded bg-toyota-primary px-3 py-1 text-sm font-semibold text-white hover:bg-toyota-primary/90"
            onClick={() => {
              if (!customFrom || !customTo) return;
              const start = new Date(customFrom);
              const end = new Date(customTo);
              if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;
              apply({ start: isoDayStart(start), end: isoDayEnd(end), timezone: 'UTC' });
              setCustomOpen(false);
            }}
          >
            החל
          </button>
        </div>
      )}

      <div className="ml-auto text-xs text-gray-600">
        טווח נוכחי: {new Date(range.start).toLocaleDateString('he-IL')} – {new Date(range.end).toLocaleDateString('he-IL')}
      </div>
    </div>
  );
}


