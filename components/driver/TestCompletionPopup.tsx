'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { DriverTask } from '@/components/driver/DriverHome';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DriverTask;
  onSubmit: (data: { details?: string; advisorName?: string }) => Promise<void>;
  onSkip: () => void;
}

export function TestCompletionPopup({
  open,
  onOpenChange,
  task,
  onSubmit,
  onSkip,
}: Props) {
  const [details, setDetails] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDetails('');
      setAdvisorName('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        details: details.trim() || undefined,
        advisorName: advisorName.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit:', error);
      // Optional: show error toast or message
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current && !submitting) {
          handleSkip();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl flex flex-col overflow-hidden"
        dir="rtl"
        role="dialog"
        aria-labelledby="popup-title"
      >
        <div className="p-5 border-b">
          <h2 id="popup-title" className="text-lg font-bold text-gray-900">
            האם היו עלויות נוספות/תוספות מחיר?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            ניתן להזין פרטים נוספים לפני סיום המשימה.
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="advisor-name"
              className="block text-sm font-medium text-gray-700"
            >
              שם יועץ שירות
            </label>
            <input
              id="advisor-name"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={advisorName}
              onChange={(e) => setAdvisorName(e.target.value)}
              placeholder="שם היועץ..."
              disabled={submitting}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="additional-details"
              className="block text-sm font-medium text-gray-700"
            >
              פירוט תוספות / הערות
            </label>
            <textarea
              id="additional-details"
              rows={4}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="הזן פרטים כאן..."
              disabled={submitting}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2"
            disabled={submitting}
          >
            דלג
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'שומר...' : 'שמור וסיים'}
          </button>
        </div>
      </div>
    </div>
  );
}
