import DashboardStats from "@/components/DashboardStats";

export default function Home() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Organization salary overview and analytics.</p>
      </div>
      
      <DashboardStats />
    </div>
  );
}
