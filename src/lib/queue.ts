import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { parseDocumentWithDocling } from './docling';
import { enhanceAndStructureResume } from './ollama';
import { db } from '@/db';
import { biodatas } from '@/db/schema';
import crypto from 'crypto';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

// Global declaration to prevent duplicate Queue/Worker/Redis instantiations in Next.js hot-reloading
const globalForQueue = global as unknown as {
  redisConnection: IORedis | undefined;
  parserQueue: Queue | undefined;
  parserWorker: Worker | undefined;
};

// Create a single shared Redis connection
export const redisConnection = globalForQueue.redisConnection ?? new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null, // Critical requirement for BullMQ
});

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.redisConnection = redisConnection;
}

// 1. Initialize BullMQ Queue
export const parserQueue = globalForQueue.parserQueue ?? new Queue('biodata-parser-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs to prevent race conditions during client polling
    removeOnFail: false,   // Keep failed jobs for debugging
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.parserQueue = parserQueue;
}

// 2. Define Worker process logic
export const parserWorker = globalForQueue.parserWorker ?? new Worker('biodata-parser-queue', 
  async (job: Job) => {
    const { filePath, name, userId } = job.data;
    console.log(`[Worker] Starting Job ${job.id} for file: ${filePath}`);

    try {
      // Step 1: Parse Document using IBM Docling
      await job.updateProgress(20);
      console.log(`[Worker] Step 1: Parsing with Docling...`);
      const markdown = await parseDocumentWithDocling(filePath);

      // Step 2: Structure and enhance with local Ollama LLM
      await job.updateProgress(60);
      console.log(`[Worker] Step 2: Structuring with Ollama...`);
      const structuredBiodata = await enhanceAndStructureResume(markdown);

      // Step 3: Insert or update database record
      await job.updateProgress(90);
      console.log(`[Worker] Step 3: Inserting into MySQL...`);
      
      const newId = crypto.randomUUID();
      const newBiodata = {
        id: newId,
        userId: userId || null,
        name: structuredBiodata.name || name || 'MD Mubtashim Fuad Fahim',
        email: structuredBiodata.email || null,
        phone: structuredBiodata.phone || null,
        photo: null, // Standalone uploads can set this later
        titleObjective: structuredBiodata.titleObjective || 'About the Groom',
        objectiveContent: structuredBiodata.objectiveContent || 'Highly motivated individual seeking opportunities...',
        theme: structuredBiodata.theme || 'maroon',
        sections: structuredBiodata.sections || [],
      };

      await db.insert(biodatas).values(newBiodata);
      console.log(`[Worker] Successfully saved parsed biodata. ID: ${newId}`);

      await job.updateProgress(100);
      return {
        success: true,
        biodataId: newId,
        name: newBiodata.name,
      };
    } catch (error: any) {
      console.error(`[Worker] Job ${job.id} failed:`, error);
      throw error;
    }
  }, 
  {
    connection: redisConnection,
    concurrency: 1, // Process one resume at a time to prevent CPU choking on local LLM & Docling
  }
);

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.parserWorker = parserWorker;
}

// Log worker events
parserWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

parserWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
});
