'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient, getDriverSession } from '@/lib/auth';
import dayjs from '@/lib/dayjs';
import { useFeatureFlag } from '@/lib/useFeatureFlag';
import { FLAG_SIGNATURE_REQUIRED } from '@/lib/flagKeys';
import { SignaturePad } from '@/components/driver/SignaturePad';

type TaskDetailsData = {
  id: string;
  title: string;
  type: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed' | null;
  details: string | null;
  estimated_start: string | null;
  estimated_end: string | null;
  address: string | null;
  client_name: string | null;
  vehicle_plate: string | null;
  vehicle_model: string | null;
  updated_at: string | null;
};

export function TaskDetails({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    header: true,
    details: true,
    client: true,
    vehicle: true,
    address: true,
    time: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<TaskDetailsData | null>(null);
  const signatureRequired = useFeatureFlag(FLAG_SIGNATURE_REQUIRED);
  const [uploadedSignature, setUploadedSignature] = useState<{
    path: string;
    signedUrl?: string | null;
    bytes: number;
  } | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const supa = createBrowserClient();
        // Attempt RPC if available; otherwise you can swap to direct selects later
        const { data, error } = (await supa.rpc('get_task_details', {
          task_id: taskId,
        })) as { data: TaskDetailsData[] | null; error: unknown | null };
        if (error) {
          throw error as Error;
        }
        if (mounted) {
          setTask(data && data[0] ? data[0] : null);
        }
      } catch {
        if (mounted) setError('טעינת המשימה נכשלה. נסה שוב.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [taskId]);

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const expanded = !!open[id];
    const panelId = `${id}-panel`;
    const headingId = `${id}-heading`;
    return (
      <section
        className="rounded-md border border-gray-200 bg-white"
        role="region"
        aria-labelledby={headingId}
      >
        <button
          id={headingId}
          type="button"
          className="w-full text-right px-4 py-3 font-medium flex items-center justify-between"
          aria-controls={panelId}
          aria-expanded={expanded}
          onClick={() => setOpen((s) => ({ ...s, [id]: !s[id] }))}
        >
          <span>{title}</span>
          <span className="text-sm text-gray-500">
            {expanded ? 'סגור' : 'פתח'}
          </span>
        </button>
        {expanded ? (
          <div id={panelId} className="px-4 pb-4">
            {children}
          </div>
        ) : null}
      </section>
    );
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="space-y-3">
        <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
        <div className="flex items-center justify-between">
          <span>אירעה שגיאה בטעינת המשימה</span>
          <button
            type="button"
            className="rounded-md bg-red-600 px-3 py-1 text-white text-sm"
            onClick={() => {
              // simple retry
              setLoading(true);
              setError(null);
              // trigger effect by changing taskId state – or just re-run effect body:
              // easiest is to temporarily toggle and back; we choose to re-run the fetch inline:
              (async () => {
                try {
                  const supa = createBrowserClient();
                  const { data, error } = (await supa.rpc('get_task_details', {
                    task_id: taskId,
                  })) as {
                    data: TaskDetailsData[] | null;
                    error: unknown | null;
                  };
                  if (error) throw error as Error;
                  setTask(data && data[0] ? data[0] : null);
                } catch {
                  setError('טעינת המשימה נכשלה. נסה שוב.');
                } finally {
                  setLoading(false);
                }
              })();
            }}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return <div className="text-sm text-gray-600">המשימה לא נמצאה</div>;
  }

  const timeWindow =
    task.estimated_start && task.estimated_end
      ? `${dayjs(task.estimated_start).format('DD/MM/YYYY HH:mm')} – ${dayjs(
          task.estimated_end
        ).format('DD/MM/YYYY HH:mm')}`
      : task.estimated_end
      ? `עד ${dayjs(task.estimated_end).format('DD/MM/YYYY HH:mm')}`
      : 'ללא זמן יעד';

  const wazeHref = task.address
    ? `waze://?navigate=yes&q=${encodeURIComponent(task.address)}`
    : undefined;

  return (
    <div className="space-y-4">
      <Section id="header" title="כותרת">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{task.title}</h1>
          <p className="text-sm text-gray-600">
            {task.type ?? '—'} • {task.priority ?? '—'} • {task.status ?? '—'}
          </p>
          <p className="text-xs text-gray-500">
            עודכן לאחרונה:{' '}
            {task.updated_at
              ? dayjs(task.updated_at).format('DD/MM/YYYY HH:mm')
              : '—'}
          </p>
        </div>
      </Section>

      <Section id="details" title="פרטים">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {task.details ?? '—'}
        </p>
      </Section>

      <Section id="client" title="לקוח">
        <div className="text-sm text-gray-800">{task.client_name ?? '—'}</div>
      </Section>

      <Section id="vehicle" title="רכב">
        <div className="text-sm text-gray-800">
          {task.vehicle_plate ?? '—'}{' '}
          {task.vehicle_model ? `• ${task.vehicle_model}` : ''}
        </div>
      </Section>

      <Section id="address" title="כתובת">
        <div className="space-y-2">
          <div className="text-sm text-gray-800">{task.address ?? '—'}</div>
          {wazeHref ? (
            <a
              href={wazeHref}
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-red-700"
            >
              פתיחה ב‑Waze
            </a>
          ) : null}
        </div>
      </Section>

      <Section id="time" title="חלון זמן">
        <div className="text-sm text-gray-800">{timeWindow}</div>
      </Section>

      {/* Signature requirement + Complete action */}
      {task.status !== 'completed' ? (
        <Section id="complete" title="סיום משימה">
          <div className="space-y-3">
            {signatureRequired ? (
              <>
                <p className="text-sm text-gray-700">
                  נדרש להשלים חתימה לפני סימון המשימה כהושלמה.
                </p>
                <SignaturePad
                  width={340}
                  height={160}
                  uploadBucket="signatures"
                  taskId={task.id}
                  onUploaded={(meta) => setUploadedSignature(meta)}
                />
                {uploadedSignature ? (
                  <div className="text-xs text-gray-500">
                    נשמר: {uploadedSignature.path} ({uploadedSignature.bytes}b)
                  </div>
                ) : null}
              </>
            ) : null}
            {completeError ? (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {completeError}
              </div>
            ) : null}
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={
                isCompleting || (signatureRequired && !uploadedSignature)
              }
              onClick={async () => {
                setIsCompleting(true);
                setCompleteError(null);
                try {
                  const supa = createBrowserClient();
                  const driverSession = getDriverSession();
                  const driverId = driverSession?.userId || null;

                  const { error: upErr } = await supa.rpc(
                    'update_task_status',
                    {
                      p_task_id: task.id,
                      p_status: 'completed',
                      p_driver_id: driverId || undefined,
                    }
                  );

                  if (upErr) {
                    const msg =
                      (upErr as { message?: string })?.message ||
                      'עדכון סטטוס נכשל';
                    throw new Error(msg);
                  }
                  setTask((prev) =>
                    prev ? { ...prev, status: 'completed' } : prev
                  );
                } catch (e: unknown) {
                  const err = e as Error;
                  setCompleteError(err?.message || 'שגיאה בסיום המשימה');
                } finally {
                  setIsCompleting(false);
                }
              }}
            >
              סמן כהושלם
            </button>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
