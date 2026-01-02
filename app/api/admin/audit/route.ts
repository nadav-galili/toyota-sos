import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listTaskAudit } from '../tasks/[taskId]/audit/handler';

/**
 * GET /api/admin/audit
 * Returns general audit log entries (admin/manager only).
 * Query params:
 *   - limit?: number (default 100, max 500)
 *   - offset?: number (default 0)
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const role = cookieStore.get('toyota_role')?.value;

  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');
  const limit = Math.min(500, Math.max(1, Number(limitParam) || 100));
  const offset = Math.max(0, Number(offsetParam) || 0);

  const result = await listTaskAudit({ limit, offset, role });
  return NextResponse.json(result.body as any, { status: result.status });
}
