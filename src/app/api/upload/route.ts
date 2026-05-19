import { NextRequest, NextResponse } from 'next/server';
import { parserQueue } from '@/lib/queue';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || 'MD Mubtashim Fuad Fahim';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Create a local uploads directory if it does not exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique local file path
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${Date.now()}_${crypto.randomUUID()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Convert file to buffer and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    console.log(`[Upload API] Saved uploaded file to: ${filePath}`);

    // Add job to BullMQ queue
    const job = await parserQueue.add('parse-resume', {
      filePath,
      name,
      userId: user.id,
    });

    console.log(`[Upload API] Added parsing job to queue. Job ID: ${job.id}`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      fileName: file.name,
    });
  } catch (error) {
    console.error('[Upload API] Error occurred during upload:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
