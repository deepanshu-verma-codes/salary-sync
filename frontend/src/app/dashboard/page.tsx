"use client";
import DashboardStats from "@/components/DashboardStats";
import { useEffect, useState } from "react";
import { getEmployeeById, getPayslips } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Briefcase, Building, DollarSign, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.role === 'USER') {
        getEmployeeById(parsedUser.id).then(res => setProfile(res)).catch(console.error);
        getPayslips().then(res => setPayslips(res)).catch(console.error);
      }
    }
    setLoading(false);
  }, []);

  if (loading || !user) return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-pulse">
      <div className="h-10 bg-slate-100 rounded-xl w-1/3 mb-4"></div>
      <div className="h-4 bg-slate-100 rounded-xl w-1/2 mb-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl"></div>)}
      </div>
    </div>
  );

  console.log("profile --->",profile)

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
        <p className="text-slate-500 mt-2">
          {user.role === 'USER' 
            ? "View your personal salary overview and payslips." 
            : "Organization salary overview and analytics."}
        </p>
      </div>
      
      {(user.role === 'ADMIN' || user.role === 'SUBADMIN') ? (
        <DashboardStats />
      ) : (
        <div className="space-y-6">
          {profile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Briefcase className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-slate-500">Designation</p><p className="text-lg font-bold text-slate-900">{profile.job_title}</p></div>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Building className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-slate-500">Department</p><p className="text-lg font-bold text-slate-900">{profile.department}</p></div>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-slate-500">Yearly Salary</p><p className="text-lg font-bold text-slate-900">{formatCurrency(profile.salary)}</p></div>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-orange-50 text-orange-600 rounded-xl"><GraduationCap className="w-6 h-6" /></div>
                <div><p className="text-sm font-medium text-slate-500">Experience</p><p className="text-lg font-bold text-slate-900">{profile.experience || 0} Years</p></div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Payslips</h3>
              <Link href="/payslips" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 text-sm font-semibold text-slate-600">Period</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-500">No payslips found yet.</td></tr>
                  ) : (
                    payslips.slice(0, 3).map(slip => (
                      <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-900">{slip.month} {slip.year}</td>
                        <td className="p-4 font-medium text-green-600">{formatCurrency(slip.amount)}</td>
                        <td className="p-4 text-slate-500">{slip.paid_at}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
