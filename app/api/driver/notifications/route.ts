import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/driver/notifications
 * Get notifications for the currently logged-in driver
 * Bypasses RLS by using service role + cookie verification
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('toyota_user_id')?.value;
    const roleCookie = cookieStore.get('toyota_role')?.value;

    if (!userIdCookie || roleCookie !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const admin = getSupabaseAdmin();
    
    // Fetch notifications for this driver using service role (bypasses RLS)
    const { data, error } = await admin
      .from('notifications')
      .select('*')
      .eq('user_id', userIdCookie)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Filter out soft-deleted notifications
    const validRows = (data || []).filter((r) => {
      const deleted = r.payload?.deleted;
      return deleted !== true && deleted !== 'true';
    });

    return NextResponse.json({ data: validRows }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/driver/notifications/:id
 * Mark a notification as read or update it
 */
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('toyota_user_id')?.value;
    const roleCookie = cookieStore.get('toyota_role')?.value;

    if (!userIdCookie || roleCookie !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, read, payload } = body;

    if (!id && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json(
        { error: 'Notification ID(s) required' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const targetIds = id ? [id] : ids;

    // Verify all notifications belong to the current driver
    const { data: existing } = await admin
      .from('notifications')
      .select('id, user_id')
      .in('id', targetIds);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Notifications not found' }, { status: 404 });
    }

    const allBelong = existing.every(n => n.user_id === userIdCookie);
    if (!allBelong) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the notification(s)
    if (id) {
      // Single update (preserving existing logic for returning single object)
      const updateData: Record<string, unknown> = {};
      if (read !== undefined) updateData.read = read;
      if (payload !== undefined) updateData.payload = payload;

      const { data, error } = await admin
        .from('notifications')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data }, { status: 200 });
    } else {
      // Bulk update
      if (payload !== undefined) {
        // Bulk update with potentially different payloads per notification (only used for soft delete currently)
        // Since we can't easily bulk update with different payloads in one query via .update() 
        // without complex syntax, and our only bulk payload use case is soft delete:
        const results = await Promise.all(targetIds.map(async (tid: string) => {
          const row = existing.find(e => e.id === tid);
          // For soft delete, we need the original payload to merge
          const { data: fullRow } = await admin.from('notifications').select('payload').eq('id', tid).single();
          const nextPayload = { ...(fullRow?.payload || {}), ...payload };
          
          return admin
            .from('notifications')
            .update({ read: read !== undefined ? read : undefined, payload: nextPayload })
            .eq('id', tid);
        }));

        const hasError = results.some(r => r.error);
        if (hasError) {
          return NextResponse.json({ error: 'Some updates failed' }, { status: 400 });
        }
      } else {
        // Simple bulk update (e.g. just mark as read)
        const updateData: Record<string, unknown> = {};
        if (read !== undefined) updateData.read = read;

        const { error } = await admin
          .from('notifications')
          .update(updateData)
          .in('id', targetIds);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

