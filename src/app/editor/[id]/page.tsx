import { getBiodata } from '@/app/actions';
import EditorClient from '@/app/editor/[id]/EditorClient';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  
  let biodata = null;
  let dbError = null;

  try {
    biodata = await getBiodata(id);
  } catch (error: any) {
    dbError = error.message || 'Database error occurred';
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
          <p className="text-sm text-slate-300 leading-relaxed">
            Could not fetch biodata. Please verify your database connection credentials and try again.
          </p>
          <div className="pt-2">
            <Link 
              href="/" 
              className="inline-block px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!biodata) {
    redirect('/');
  }

  return <EditorClient initialData={biodata} />;
}
