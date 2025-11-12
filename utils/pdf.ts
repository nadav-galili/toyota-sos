'use client';

export function downloadBlob(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}

export function generateTaskPdfLikeBlob(payload: Record<string, any>): Blob {
  // Minimal placeholder: a text-based "PDF-like" blob so we avoid adding deps.
  // In production, replace with jsPDF or server-side PDF generation.
  const content = [
    'TASK EXPORT',
    '------------',
    JSON.stringify(payload, null, 2),
  ].join('\n');
  return new Blob([content], { type: 'application/pdf' });
}


