"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const isPublic = pathname === '/' || pathname === '/login';
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (!isPublic) {
      router.push('/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const isPublic = pathname === '/' || pathname === '/login';

  if (isPublic) {
    return (
      <>
        <Toaster position="top-right" />
        {children}
      </>
    );
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] fixed inset-0 z-50">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-5 flex items-center justify-center border border-slate-100">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">SALARY SYNC</h2>
          <p className="text-sm font-semibold text-slate-400 animate-pulse tracking-wide">Preparing your workspace...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white/40 backdrop-blur-2xl border-r border-white/60 text-slate-900 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 hidden md:flex">
        <div className="p-6">
          <Link href="/">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Salary Sync
            </h1>
          </Link>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{user?.role} PANEL</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${pathname.startsWith('/dashboard') ? 'bg-white/80 text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white' : 'hover:bg-white/40 text-slate-600 hover:text-slate-900'}`}>
            <LayoutDashboard className={`w-5 h-5 ${pathname.startsWith('/dashboard') ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="font-semibold">Dashboard</span>
          </Link>
          {(user?.role === 'ADMIN' || user?.role === 'SUBADMIN') && (
            <Link href="/employees" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${pathname.startsWith('/employees') ? 'bg-white/80 text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white' : 'hover:bg-white/40 text-slate-600 hover:text-slate-900'}`}>
              <Users className={`w-5 h-5 ${pathname.startsWith('/employees') ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="font-semibold">Employees</span>
            </Link>
          )}
          <Link href="/payslips" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${pathname.startsWith('/payslips') ? 'bg-white/80 text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white' : 'hover:bg-white/40 text-slate-600 hover:text-slate-900'}`}>
            <FileText className={`w-5 h-5 ${pathname.startsWith('/payslips') ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="font-semibold">Payslips</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200/50 m-4 rounded-2xl bg-white/30 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/80 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm bg-white/50 border border-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-auto relative">
        <Toaster position="top-right" />
        {children}
      </main>
    </div>
  );
}
