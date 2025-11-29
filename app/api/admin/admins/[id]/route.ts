import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { adminSchema } from '@/lib/schemas/admin';

type Params = {
  id: string;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('toyota_role')?.value;
    if (!roleCookie || roleCookie !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing admin id' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const payload = {
      name: body?.name,
      employeeId: body?.employeeId,
      email: body?.email ? String(body.email).trim() || undefined : undefined,
      role: body?.role,
    };

    const result = adminSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: 'Validation failed',
          fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, employeeId, email, role } = result.data;
    const admin = getSupabaseAdmin();

    // Ensure employee_id stays unique across profiles (excluding this admin)
    const { data: existingByEmployeeId, error: existingErr } = await admin
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId)
      .neq('id', id)
      .maybeSingle();

    if (existingErr && existingErr.code !== 'PGRST116') {
      return NextResponse.json(
        { error: existingErr.message },
        { status: 400 },
      );
    }

    if (existingByEmployeeId?.id) {
      return NextResponse.json(
        {
          error: 'מספר עובד כבר קיים במערכת',
          code: 'EMPLOYEE_ID_EXISTS',
        },
        { status: 409 },
      );
    }

    const finalEmail =
      email ||
      `admin+${employeeId.replace(/[^0-9]/g, '')}@toyota.local`;

    // Update auth user email + metadata (best-effort)
    try {
      await admin.auth.admin.updateUserById(id, {
        email: finalEmail,
        user_metadata: {
          name,
        },
        app_metadata: {
          role,
        },
      });
    } catch {
      // If this fails, we still proceed with profile update
    }

    const { data: profile, error: upErr } = await admin
      .from('profiles')
      .update({
        name,
        employee_id: employeeId,
        email: finalEmail,
        role,
      })
      .eq('id', id)
      .select('id, name, email, employee_id, role, created_at, updated_at')
      .single();

    if (upErr) {
      return NextResponse.json(
        { error: upErr.message || 'Failed to update admin' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: profile,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('toyota_role')?.value;
    if (!roleCookie || roleCookie !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing admin id' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Delete auth user first (best-effort)
    try {
      await admin.auth.admin.deleteUser(id);
    } catch {
      // ignore; proceed with profile delete
    }

    const { error: deleteErr } = await admin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      return NextResponse.json(
        { error: deleteErr.message || 'Failed to delete admin' },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

