import { getBiodatas, createDefaultBiodata } from './actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import CreatorPanel from './components/CreatorPanel';
import { getSessionUser, logoutUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  let biodataList: any[] = [];
  let dbError = null;

  try {
    biodataList = await getBiodatas();
  } catch (error: any) {
    dbError = error.message || 'Failed to connect to MySQL';
  }

  async function handleCreateAction(name: string) {
    'use server';
    const id = await createDefaultBiodata(name);
    redirect(`/editor/${id}`);
  }

  async function handleLogout() {
    'use server';
    await logoutUser();
    redirect('/login');
  }

  // Database Connection Error view
  if (dbError) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 antialiased">
        <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="flex items-center gap-4 text-amber-500">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h1 className="text-2xl font-bold tracking-tight">Database Diagnostics Required</h1>
          </div>

          <div className="space-y-3">
            <p className="text-slate-300">
              The Next.js full-stack server is running, but it cannot connect to your MySQL database at this moment.
            </p>
            <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-red-400 overflow-x-auto border border-slate-800">
              {dbError}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Troubleshooting Steps:</h2>
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-3">
              <li>
                Ensure your MySQL service is running locally or remotely (e.g., <code className="bg-slate-750 px-1.5 py-0.5 rounded text-amber-300">sudo service mysql start</code>).
              </li>
              <li>
                Verify database credentials in your local <code className="bg-slate-750 px-1.5 py-0.5 rounded text-amber-300">.env</code> file. Currently set to:
                <pre className="mt-1 bg-slate-950 p-2.5 rounded font-mono text-slate-400 text-xs border border-slate-900 overflow-x-auto">
                  DATABASE_URL=mysql://root:password@127.0.0.1:3306/simple_biodata_editor
                </pre>
              </li>
              <li>
                Create the database inside MySQL:
                <code className="block mt-1 bg-slate-950 p-2.5 rounded font-mono text-amber-400 text-xs border border-slate-900">
                  CREATE DATABASE simple_biodata_editor;
                </code>
              </li>
              <li>
                Apply the Drizzle migrations to push the tables immediately to MySQL:
                <code className="block mt-1 bg-slate-950 p-2.5 rounded font-mono text-emerald-400 text-xs border border-slate-900">
                  npx drizzle-kit push
                </code>
              </li>
            </ol>
          </div>

          <div className="flex justify-end pt-2">
            <a 
              href="/" 
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-850 rounded-lg text-sm font-medium transition"
            >
              Retry Connection
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-8 flex justify-between items-center sticky top-0 z-55 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 font-sans tracking-tight">BioEditor Studio</h1>
            <p className="text-xs text-slate-500">Premium Full-Stack Biodata Solution</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-600 font-medium font-sans bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{user.email}</span>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 px-3.5 py-1.5 rounded-full transition shadow-sm cursor-pointer"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 flex flex-col md:flex-row gap-10">
        
        {/* Left Side - Creator CTA Panel */}
        <div className="md:w-1/3 space-y-6">
          <CreatorPanel handleCreateAction={handleCreateAction} />

          <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">Architecture Overview</h3>
            <p className="text-xs text-rose-700/80 leading-relaxed">
              This solution is built using Next.js 16, React 19, Drizzle ORM, and MySQL database. It employs Server Actions for database mutations, dynamic templates, split-screen preview, and client/server-side pixel-perfect PDF rendering.
            </p>
          </div>
        </div>

        {/* Right Side - Biodata List */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Your Biodatas</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
              {biodataList.length} Total
            </span>
          </div>

          {biodataList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center space-y-4 shadow-sm flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                  <line x1="9" y1="19" x2="15" y2="19"></line>
                  <line x1="9" y1="11" x2="10" y2="11"></line>
                </svg>
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-bold text-slate-700">No Biodatas Found</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You haven't generated any biodatas yet. Enter a name on the left panel to initialize your very first dynamic full-stack wedding biodata!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {biodataList.map((bio) => (
                <div 
                  key={bio.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-rose-300 transition shadow-sm relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-rose-600 transition leading-snug truncate max-w-[170px]">
                          {bio.name}
                        </h3>
                        <p className="text-xxs text-slate-400">
                          ID: <span className="font-mono">{bio.id.slice(0, 8)}...</span>
                        </p>
                      </div>
                      
                      {/* Theme Badge */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        bio.theme === 'maroon' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        bio.theme === 'gold' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        bio.theme === 'navy' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        bio.theme === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-slate-700 text-slate-100 border-slate-600'
                      }`}>
                        {bio.theme}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5 truncate">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>{bio.email || 'No email specified'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>{bio.phone || 'No phone specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 gap-2">
                    <Link 
                      href={`/editor/${bio.id}`}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </Link>
                    
                    <Link 
                      href={`/share/${bio.id}`}
                      target="_blank"
                      className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                      Share
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
