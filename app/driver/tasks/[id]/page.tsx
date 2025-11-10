'use client';

import { TaskDetails } from '@/components/driver/TaskDetails';

export default function TaskDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main dir="rtl" className="min-h-screen p-4">
      <TaskDetails taskId={id} />
    </main>
  );
}


