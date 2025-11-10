'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function DriverProfilePage() {
  const router = useRouter();
  const { logout, loading, error } = useAuth();

  return (
    <main className="min-h-[60vh] p-4 space-y-4" dir="rtl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">הפרופיל שלי</h2>
          <p className="mt-1 text-gray-600">זהו עמוד פרופיל זמני.</p>
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


