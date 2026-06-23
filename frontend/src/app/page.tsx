"use client";
import Link from "next/link";
import { DollarSign, Shield, Users, Zap, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradients from globals.css will shine through */}
      <header className="px-8 py-6 flex justify-between items-center bg-white/40 backdrop-blur-md border-b border-white/60 shadow-sm relative z-10">
        <h1 className="text-2xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">Salary Sync</h1>
        {user ? (
          <Link href="/dashboard" className="flex items-center gap-3 px-5 py-2 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user.name.charAt(0)}
            </div>
            <span className="font-semibold text-slate-800">{user.name}</span>
          </Link>
        ) : (
          <Link href="/login" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md">
            Login
          </Link>
        )}
      </header>
      
      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="py-24 text-center px-4">
          <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Manage payroll with <br/><span className="text-blue-600">absolute clarity.</span></h2>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">The ultimate platform for HR teams to distribute, manage, and analyze employee compensation effortlessly across the globe.</p>
          <Link href={user ? "/dashboard" : "/login"} className="px-8 py-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg text-lg inline-flex items-center gap-2">
            Access Dashboard {user && <ArrowRight className="w-5 h-5" />}
          </Link>
        </section>

        {/* Features */}
        <section className="py-20 bg-white px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Users className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-900">Multi-Tenant Roles</h3>
              <p className="text-slate-500">Secure access controls with Admin, HR Subadmin, and standard User dashboards.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600"><DollarSign className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-900">Payslip Generation</h3>
              <p className="text-slate-500">Generate, view, and securely download monthly payslips for every employee.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600"><Shield className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-900">Enterprise Security</h3>
              <p className="text-slate-500">Industry standard JWT authentication and hashed credentials keeping data safe.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Zap className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-slate-900">Instant Analytics</h3>
              <p className="text-slate-500">Real-time organizational insights and dynamic compensation charts.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-slate-500 bg-white border-t border-slate-200">
        <p>ACME Corp &copy; 2026 Salary Sync. All rights reserved.</p>
      </footer>
    </div>
  );
}
