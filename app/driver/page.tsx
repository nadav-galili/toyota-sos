'use client';

import { DriverHome as DriverHomeList } from '@/components/driver/DriverHome';

export default function DriverHome() {
  return (
    <main dir="rtl" className="min-h-screen p-4 space-y-4">
      {/* Keep local sample rendering commented for reference; DriverHome loads from server now */}
      {/* <DriverHomeList tasks={sampleTasks as any} /> */}
      <DriverHomeList />
    </main>
  );
}
