'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackNotificationOpened } from '@/lib/events';
import { PermissionPrompt } from './PermissionPrompt';
import dayjs from 'dayjs';

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  task_id: string | null;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export function NotificationsList({ pageSize = 20 }: { pageSize?: number }) {
  const router = useRouter();
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const fetchPage = async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      // Use server-side API endpoint instead of direct Supabase query
      const response = await fetch(
        `/api/driver/notifications?page=${pageIndex}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to load notifications');
      }

      const { data } = await response.json();
      setRows((data as NotificationRow[]) || []);
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Combine lists for unified display
  const displayRows = [...rows]; // Already sorted by created_at desc from API

  const toggleSelect = (id: string, value?: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: value ?? !prev[id] }));
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/driver/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });

      if (response.ok) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, read: true } : r))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // const markSelectedAsRead = async () => {
  //   const ids = Object.keys(selected).filter((id) => selected[id]);
  //   if (ids.length === 0) return;
  //   const res = await supa
  //     .from('notifications')
  //     .update({ read: true })
  //     .in('id', ids);
  //   const err = (res as any)?.error ?? null;
  //   if (!err) {
  //     setRows((prev) =>
  //       prev.map((r) => (ids.includes(r.id) ? { ...r, read: true } : r))
  //     );
  //     setSelected({});
  //   }
  // };

  const deleteNotification = async (id: string) => {
    // Soft delete via payload.deleted = true
    const target = rows.find((r) => r.id === id);
    if (!target) return;
    
    const nextPayload = { ...(target.payload || {}), deleted: true };
    
    try {
      const response = await fetch('/api/driver/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, payload: nextPayload }),
      });

      if (response.ok) {
        setRows((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // const deleteSelected = async () => {
  //   const ids = Object.keys(selected).filter((id) => selected[id]);
  //   if (ids.length === 0) return;
  //   // batch soft-delete (client-side payload update per row)
  //   const updates = rows
  //     .filter((r) => ids.includes(r.id))
  //     .map((r) => ({
  //       id: r.id,
  //       payload: { ...(r.payload || {}), deleted: true },
  //     }));
  //   const { error } = await supa
  //     .from('notifications')
  //     .upsert(updates, { onConflict: 'id' });
  //   if (!error) {
  //     setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
  //     setSelected({});
  //   }
  // };

  const onOpen = async (row: NotificationRow) => {
    try {
      trackNotificationOpened({
        id: row.id,
        type: row.type,
        task_id: row.task_id,
      });
    } catch {
      // optional analytics
    }

    if (!row.read) {
      await markAsRead(row.id);
    }

    router.push('/driver');
  };

  return (
    <div dir="rtl" className="w-full max-w-2xl">
      <div className="mb-4">
        <PermissionPrompt />
      </div>
      {/* <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="סמן כנקראו"
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          onClick={markSelectedAsRead}
          disabled={Object.values(selected).every((v) => !v)}
        >
          סמן כנקראו
        </button>
        <button
          type="button"
          aria-label="מחק"
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          onClick={deleteSelected}
          disabled={Object.values(selected).every((v) => !v)}
        >
          מחק
        </button>
      </div> */}

      {loading ? <div role="status">טוען...</div> : null}
      {error ? (
        <div role="alert" className="text-red-600 text-sm">
          {error}
        </div>
      ) : null}

      <ul className="space-y-2">
        {displayRows.map((r) => (
          <li
            key={r.id}
            className={`flex items-center gap-2 rounded border p-3 bg-white transition-colors ${
              !r.read ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'opacity-90'
            }`}
          >
            <input
              type="checkbox"
              aria-label={`בחר התראה ${r.payload?.taskType || r.type}`}
              checked={!!selected[r.id]}
              onChange={(e) => toggleSelect(r.id, e.target.checked)}
              className="mt-1"
            />
            <div
              className="flex-1 cursor-pointer"
              onClick={() => onOpen(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onOpen(r);
                }
              }}
            >
              <div
                className={`text-sm mb-1 ${
                  !r.read ? 'font-bold text-gray-900' : 'text-gray-700'
                }`}
              >
                {(r.payload as { title?: string })?.title}
              </div>
              <div
                className={`text-sm mb-1 ${
                  !r.read ? 'font-bold text-gray-900' : 'text-gray-700'
                }`}
              >
                {(r.payload as { taskType?: string })?.taskType || r.type}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {dayjs(r.created_at).format('D/M HH:mm')}
                </span>
                {!r.read && (
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-1"></span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 mr-2">
              {!r.read && (
                <button
                  type="button"
                  className="text-blue-600 text-xs hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                  aria-label="סמן כנקרא"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(r.id);
                  }}
                >
                  סמן כנקרא
                </button>
              )}
              <button
                type="button"
                className="text-gray-400 text-xs hover:text-red-600 px-2 py-1 rounded hover:bg-gray-50"
                aria-label="מחק"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(r.id);
                }}
              >
                מחק
              </button>
            </div>
          </li>
        ))}
      </ul>

      {displayRows.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-500">אין התראות להצגה</div>
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          aria-label="דף קודם"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          קודם
        </button>
        <div className="text-sm">עמוד {page + 1}</div>
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          aria-label="דף הבא"
          onClick={() => setPage((p) => p + 1)}
          disabled={rows.length < pageSize}
        >
          הבא
        </button>
      </div>
    </div>
  );
}
