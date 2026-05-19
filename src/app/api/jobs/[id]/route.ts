import { NextRequest, NextResponse } from 'next/server';
import { parserQueue } from '@/lib/queue';

interface Params {
  id: string;
}

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const job = await parserQueue.getJob(id);

    if (!job) {
      return NextResponse.json({ 
        success: false, 
        error: 'Job not found' 
      }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;

    if (state === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        progress: 100,
        result: job.returnvalue,
      });
    }

    if (state === 'failed') {
      return NextResponse.json({
        success: true,
        status: 'failed',
        progress: 100,
        error: job.failedReason || 'Resume parsing and AI structuring failed.',
      });
    }

    return NextResponse.json({
      success: true,
      status: state, // 'active', 'waiting', 'delayed', etc.
      progress: typeof progress === 'number' ? progress : 0,
    });
  } catch (error) {
    console.error('[Jobs API] Error fetching job status:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
