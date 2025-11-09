'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

type SeedResult = {
  created: Array<{ email: string; id: string; employeeId: string; password: string }>;
  skipped: Array<{ email: string; reason: string }>;
};

export async function POST(_req: NextRequest) {
  const admin = getSupabaseAdmin();

  // Default seed set
  const drivers = Array.from({ length: 5 }).map((_, i) => {
    const idx = i + 1;
    const num = String(idx).padStart(2, '0');
    const email = `driver${num}@toyota.local`;
    const password = `Driver@2025${num}`; // >= 4 chars; rotate later
    const employeeId = `D000${idx}`;
    const name = `Driver ${num}`;
    return { email, password, employeeId, name };
  });

  const created: SeedResult['created'] = [];
  const skipped: SeedResult['skipped'] = [];

  // Try creating users; if they already exist, we’ll look them up via admin.listUsers pages
  for (const d of drivers) {
    // First, see if a profile already exists for this email to short-circuit
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', d.email)
      .maybeSingle();
    if (existingProfile?.id) {
      // Ensure role/employee_id are correct
      await admin
        .from('profiles')
        .update({ role: 'driver', employee_id: d.employeeId, name: d.name })
        .eq('id', existingProfile.id);
      skipped.push({ email: d.email, reason: 'Profile already exists; ensured role/employee_id' });
      continue;
    }

    // Create auth user
    const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: { username: d.email.split('@')[0], name: d.name },
      app_metadata: { role: 'driver' },
    });

    let userId: string | null = null;
    if (createErr) {
      // If user exists already, search for it via listUsers
      // listUsers paginates; small dataset so 1-2 pages is fine
      let found: string | null = null;
      for (let page = 1; page <= 2 && !found; page++) {
        const { data: pageData, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (listErr) break;
        const match = pageData.users.find((u: any) => u.email?.toLowerCase() === d.email.toLowerCase());
        if (match) found = match.id;
        if ((pageData?.users?.length ?? 0) < 1000) break;
      }
      if (!found) {
        skipped.push({ email: d.email, reason: `Auth create failed and user not found: ${createErr.message}` });
        continue;
      }
      userId = found;
    } else {
      userId = createdUser!.user.id;
    }

    // Upsert profile with role + employee_id
    const { error: upErr } = await admin
      .from('profiles')
      .upsert(
        {
          id: userId!,
          email: d.email,
          role: 'driver',
          name: d.name,
          employee_id: d.employeeId,
        },
        { onConflict: 'id' }
      );
    if (upErr) {
      skipped.push({ email: d.email, reason: `Profile upsert error: ${upErr.message}` });
      continue;
    }

    created.push({ email: d.email, id: userId!, employeeId: d.employeeId, password: d.password });
  }

  const res: SeedResult = { created, skipped };
  return NextResponse.json(res);
}


