"use client";

import { useEffect, useState, useCallback } from "react";
import { getEmployees } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export default function EmployeeTable() {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("ASC");
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        sortBy,
        sortDir
      });
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [pagination.page, pagination.limit, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortDir("ASC");
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {['Name', 'Email', 'Department', 'Country', 'Salary', 'Date Joined'].map((col, idx) => {
                  const dataKey = col.toLowerCase().replace(' ', '_');
                  const isSortable = ['name', 'salary', 'date_joined'].includes(dataKey);
                  return (
                    <th 
                      key={idx} 
                      className={`p-4 text-sm font-semibold text-slate-600 ${isSortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
                      onClick={() => isSortable && handleSort(dataKey)}
                    >
                      <div className="flex items-center gap-2">
                        {col}
                        {isSortable && <ArrowUpDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="animate-pulse">Loading employees...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No employees found matching your criteria.
                  </td>
                </tr>
              ) : (
                data.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{emp.name}</td>
                    <td className="p-4 text-slate-500">{emp.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                        {emp.department}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{emp.country}</td>
                    <td className="p-4 font-medium text-slate-900">{formatCurrency(emp.salary)}</td>
                    <td className="p-4 text-slate-500">{emp.date_joined}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white/50">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
