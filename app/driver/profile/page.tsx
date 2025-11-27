'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import type { DriverSession } from '@/lib/auth';

export default function DriverProfilePage() {
  const router = useRouter();
  const { logout, loading, error, session } = useAuth();

  const driverSession =
    session?.role === 'driver' ? (session as DriverSession) : null;

  return (
    <main className="min-h-[60vh] p-4 space-y-4" dir="rtl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold  text-primary underline">
            הפרופיל שלי
          </h2>
          {driverSession && (
            <div className="mt-2 space-y-1">
              <p className="text-gray-800">
                <span className="font-medium">שם:</span>{' '}
                {driverSession.name || '—'}
              </p>
              <p className="text-gray-800">
                <span className="font-medium">מספר עובד:</span>{' '}
                {driverSession.employeeId}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          onClick={async () => {
            await logout();
            router.replace('/auth/login');
          }}
          disabled={loading}
          aria-label="התנתק"
        >
          התנתקות
        </button>
      </header>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </main>
  );
}
