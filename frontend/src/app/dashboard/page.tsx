"use client";
import DashboardStats from "@/components/DashboardStats";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
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
        <div className="glass-card rounded-2xl p-6">
          <p className="text-slate-600">Navigate to Payslips to view and download your monthly salary slips.</p>
        </div>
      )}
    </div>
  );
}
