import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerClient } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys, user_id: bodyUserId } = body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // 1. Try to get authenticated user from session
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userId = user?.id;

    // 2. If no session, allow manual user_id (for drivers with localStorage session)
    if (!userId && bodyUserId) {
      userId = bodyUserId;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Upsert subscription using Admin client (bypassing RLS if needed, or ensuring access)
    // We use admin client because if the user is anonymous (localStorage only),
    // they might not have RLS permissions to insert if we relied on anon role unless we opened it up.
    const admin = getSupabaseAdmin();

    // Check if user exists first (to avoid foreign key error if invalid ID sent)
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert subscription
    // We use user_id + endpoint as unique constraint
    const { error } = await admin.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint,
        keys,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, endpoint' }
    );

    if (error) {
      console.error('Failed to save subscription:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Subscribe error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
