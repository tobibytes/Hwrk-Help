import { useEffect, useState } from 'react';
import { API_BASE, fetchJSON } from '@/lib/api';

interface JobStatus { status: string; processed: number; skipped: number; errors: number; error_message?: string | null }

export function useCanvasSyncJobPoller(jobId: string | null, courseId?: string | null, onComplete?: () => void) {
  const [job, setJob] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const s = await fetchJSON<{ ok: true; job: any }>(`${API_BASE}/api/canvas/sync/status/${encodeURIComponent(jobId)}`);
        if (stopped) return;
        const j = s.job || {};
        setJob({ status: j.status, processed: Number(j.processed || 0), skipped: Number(j.skipped || 0), errors: Number(j.errors || 0), error_message: j.error_message ?? null });
        if (j.status === 'completed' || j.status === 'failed') {
          clearInterval(interval);
          onComplete && onComplete();
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, 1500);
    return () => { stopped = true; clearInterval(interval); };
  }, [jobId, courseId]);

  return { job, setJob };
}

