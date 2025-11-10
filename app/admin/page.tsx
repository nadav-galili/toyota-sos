'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function AdminHome() {
  const router = useRouter();
  const { logout, loading, error } = useAuth();

  return (
    <main dir="rtl" className="min-h-screen p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">מסך מנהל (זמני)</h1>
          <p className="mt-1 text-gray-600">התחברות הצליחה. זהו דף פלייסהולדר למנהלים/משרד.</p>
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


