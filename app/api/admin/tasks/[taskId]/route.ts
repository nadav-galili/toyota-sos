import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getServerSession } from '@/lib/auth';

/**
 * PATCH /api/admin/tasks/[taskId]
 * Update task status or other fields
 * Only accessible by admin/manager users
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId } = params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['status', 'priority', 'details'];
    const updatePayload: Record<string, any> = {};

    Object.entries(body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updatePayload[key] = value;
      }
    });

    // Add metadata
    updatePayload.updated_by = session.id;
    updatePayload.updated_at = new Date().toISOString();

    // Update in Supabase
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('tasks')
      .update(updatePayload)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/admin/tasks/[taskId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

