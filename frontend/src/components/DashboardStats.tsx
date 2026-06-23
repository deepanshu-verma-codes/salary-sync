"use client";
import { useEffect, useState } from "react";
import { getStats, getDistributionByDepartment } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Users, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [dist, setDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getDistributionByDepartment()]).then(([statsRes, distRes]) => {
      setStats(statsRes);
      setDist(distRes);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Payroll</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalPayroll)}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Employees</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.totalEmployees.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Average Salary</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(stats.averageSalary)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Average Salary by Department</h3>
        <div className="space-y-5">
          {[...dist].sort((a, b) => b.averageSalary - a.averageSalary).map((d, i) => {
            const maxSalary = Math.max(...dist.map(x => x.averageSalary));
            const percentage = (d.averageSalary / maxSalary) * 100;
            return (
              <div key={d.department} className="relative flex items-center gap-4 group">
                <div className="w-32 text-sm font-medium text-slate-700 truncate">{d.department}</div>
                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-32 text-right text-sm font-bold text-slate-900">{formatCurrency(d.averageSalary)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
