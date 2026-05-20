import { getBiodata } from '@/app/actions';
import { notFound } from 'next/navigation';
import ShareClient from '@/app/share/[id]/ShareClient';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  
  let biodata = null;
  let dbError = null;

  try {
    biodata = await getBiodata(id);
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Database error occurred';
  }

  if (dbError) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 antialiased">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 space-y-4 text-center">
          <div className="w-16 h-16 bg-red-950 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-800">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold">Database Error</h1>
          <p className="text-sm text-slate-300">
            Could not fetch biodata. Please verify your database connection credentials and try again.
          </p>
        </div>
      </main>
    );
  }

  if (!biodata) {
    notFound();
  }

  return <ShareClient biodata={biodata} />;
}
