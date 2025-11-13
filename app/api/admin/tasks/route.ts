import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/admin/tasks
 * Create a new task and optional driver assignments
 * Body: {
 *   title, type, priority, status, details?, estimated_start?, estimated_end?, address?,
 *   client_id?, vehicle_id?, lead_driver_id?, co_driver_ids?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('toyota_role')?.value;
    if (!roleCookie || (roleCookie !== 'admin' && roleCookie !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      type,
      priority,
      status,
      details,
      estimated_start,
      estimated_end,
      address,
      client_id,
      vehicle_id,
      lead_driver_id,
      co_driver_ids,
    } = body || {};

    if (!title || !type || !priority || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    // Insert task
    const { data: created, error } = await admin
      .from('tasks')
      .insert({
        title,
        type,
        priority,
        status,
        details: details ?? null,
        estimated_start: estimated_start ?? null,
        estimated_end: estimated_end ?? null,
        address: address ?? '',
        client_id: client_id ?? null,
        vehicle_id: vehicle_id ?? null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert assignments if provided
    const inserts: any[] = [];
    if (lead_driver_id) {
      inserts.push({
        task_id: created.id,
        driver_id: lead_driver_id,
        is_lead: true,
        assigned_at: new Date().toISOString(),
      });
    }
    if (Array.isArray(co_driver_ids) && co_driver_ids.length > 0) {
      for (const id of co_driver_ids) {
        // skip if same as lead
        if (id && id !== lead_driver_id) {
          inserts.push({
            task_id: created.id,
            driver_id: id,
            is_lead: false,
            assigned_at: new Date().toISOString(),
          });
        }
      }
    }
    if (inserts.length > 0) {
      await admin.from('task_assignees').insert(inserts);
    }

    return NextResponse.json({ ok: true, data: created }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
