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
    const { id, read, payload } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Verify this notification belongs to the current driver
    const { data: existing } = await admin
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userIdCookie) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the notification
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
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

