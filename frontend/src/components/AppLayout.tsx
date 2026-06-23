"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const isPublic = pathname === '/' || pathname === '/login';

  if (isPublic) {
    return <>{children}</>;
  }

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white/40 backdrop-blur-2xl border-r border-white/60 text-slate-900 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Salary Sync
          </h1>
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
