"use client";
import { useEffect, useState } from "react";
import { getStats, getDistributionByDepartment } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dist} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }} 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="averageSalary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
