import EmployeeTable from "@/components/EmployeeTable";

export default function EmployeesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Employee Directory</h1>
        <p className="text-slate-500 mt-2">Manage and view salary information across the organization.</p>
      </div>
      
      <EmployeeTable />
    </div>
  );
}
