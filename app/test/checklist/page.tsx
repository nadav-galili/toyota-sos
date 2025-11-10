'use client';

import React, { useMemo, useState } from 'react';
import { ChecklistModal, ChecklistSchema } from '@/components/driver/ChecklistModal';

export default function ChecklistTestPage() {
  const [open, setOpen] = useState(false);
  const [persist, setPersist] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [lastPayload, setLastPayload] = useState<Record<string, unknown> | null>(null);

  const schema = useMemo<ChecklistSchema>(
    () => [
      {
        id: 'agree',
        type: 'boolean',
        title: 'אני מאשר את התנאים',
        description: 'סמן כדי לאשר',
        required: true,
      },
      {
        id: 'name',
        type: 'string',
        title: 'שם מלא',
        description: 'הזן את שמך',
        required: true,
      },
      {
        id: 'notes',
        type: 'textarea',
        title: 'הערות',
        description: 'פרטים נוספים אם נדרש',
      },
    ],
    []
  );

  return (
    <main dir="rtl" className="min-h-screen p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">דף בדיקות לצ’ק-ליסט</h1>
        <button
          type="button"
          className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          onClick={() => setOpen(true)}
        >
          פתיחת צ’ק-ליסט
        </button>
      </header>

      <section className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block text-sm">
            <span className="block text-gray-700 mb-1">Persist (שמירה ל‑DB)</span>
            <input
              type="checkbox"
              className="h-4 w-4 align-middle"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
            />
          </label>
          <label className="block text-sm">
            <span className="block text-gray-700 mb-1">Task ID</span>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              placeholder="task uuid"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="block text-gray-700 mb-1">Driver ID</span>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              placeholder="driver uuid (optional)"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            />
          </label>
        </div>
        <p className="text-sm text-gray-600">
          ברירת מחדל: ללא שמירה ל‑DB. להפעלת שמירה, סמן Persist ומלא לפחות Task ID.
        </p>
      </section>

      {lastPayload ? (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Payload אחרון</h2>
          <pre className="rounded bg-gray-100 p-3 text-xs overflow-auto">
            {JSON.stringify(lastPayload, null, 2)}
          </pre>
        </section>
      ) : null}

      <ChecklistModal
        open={open}
        onOpenChange={setOpen}
        schema={schema}
        onSubmit={(data) => setLastPayload(data)}
        persist={persist}
        taskId={taskId || undefined}
        driverId={driverId || undefined}
        title="טופס צ’ק-ליסט לדוגמה"
        description="בדוק שדות חובה, שמירת GPS, ואפשרות שמירה ל‑DB."
      />
    </main>
  );
}


