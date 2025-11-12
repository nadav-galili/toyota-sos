import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listTaskAudit } from './handler';

/**
 * GET /api/admin/tasks/[taskId]/audit
 * Returns audit log entries for a given task (admin/manager only).
 * Query params:
 *   - limit?: number (default 100, max 500)
 *   - offset?: number (default 0)
 */
export async function GET(req: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  const cookieStore = await cookies();
  const role = cookieStore.get('toyota_role')?.value;

  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');
  let limit = Math.min(500, Math.max(1, Number(limitParam) || 100));
  let offset = Math.max(0, Number(offsetParam) || 0);

  const result = await listTaskAudit({ taskId, limit, offset, role });
  return NextResponse.json(result.body as any, { status: result.status });
}


