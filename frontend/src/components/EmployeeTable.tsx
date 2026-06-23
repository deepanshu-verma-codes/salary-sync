"use client";

import { useEffect, useState, useCallback } from "react";
import { getEmployees, deleteUser, updateRole, addUser } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Trash2, ShieldAlert, ShieldOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "./Modal";

export default function EmployeeTable() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("ASC");
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER', department: 'Engineering', country: 'USA', salary: 100000 });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roleUpdate, setRoleUpdate] = useState<{ id: number, role: 'SUBADMIN' | 'USER' } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

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

  const executeDelete = async () => {
    if (deleteId) {
      try {
        await deleteUser(deleteId);
        toast.success('User deleted successfully');
        fetchData();
      } catch(err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete user');
      }
      setDeleteId(null);
    }
  };

  const executeUpdateRole = async () => {
    if (roleUpdate) {
      try {
        await updateRole(roleUpdate.id, roleUpdate.role);
        toast.success(`Role updated to ${roleUpdate.role}`);
        fetchData();
      } catch(err: any) {
        toast.error(err.response?.data?.error || 'Failed to update role');
      }
      setRoleUpdate(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUser(formData);
      setShowAdd(false);
      toast.success('User added successfully');
      fetchData();
    } catch(err: any) {
      toast.error(err.response?.data?.error || 'Failed to add user');
    }
  };

  return (
    <div className="space-y-6">
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete User">
        <p className="text-slate-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors">Delete</button>
        </div>
      </Modal>

      <Modal isOpen={roleUpdate !== null} onClose={() => setRoleUpdate(null)} title={roleUpdate?.role === 'SUBADMIN' ? "Make Subadmin" : "Remove Subadmin"}>
        <p className="text-slate-600 mb-6">
          {roleUpdate?.role === 'SUBADMIN' 
            ? "Are you sure you want to grant Subadmin privileges to this user?" 
            : "Are you sure you want to remove Subadmin privileges from this user?"}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setRoleUpdate(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={executeUpdateRole} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors">Confirm</button>
        </div>
      </Modal>

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
        {(user?.role === 'ADMIN' || user?.role === 'SUBADMIN') && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <UserPlus className="w-5 h-5" /> Add User
          </button>
        )}
      </div>

      {showAdd && (
        <div className="glass-card rounded-2xl p-6 border border-blue-100 animate-fade-in">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-4 py-2 rounded-xl border border-slate-300" />
            <input type="email" required placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-4 py-2 rounded-xl border border-slate-300" />
            <input type="password" required placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="px-4 py-2 rounded-xl border border-slate-300" />
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="px-4 py-2 rounded-xl border border-slate-300">
              <option value="USER">User</option>
              {user?.role === 'ADMIN' && <option value="SUBADMIN">Subadmin</option>}
            </select>
            <input type="number" required placeholder="Salary" value={formData.salary} onChange={e => setFormData({...formData, salary: parseInt(e.target.value)})} className="px-4 py-2 rounded-xl border border-slate-300" />
            <div className="flex justify-end items-end">
              <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800">Save User</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {['Name', 'Email', 'Role', 'Department', 'Salary', 'Actions'].map((col, idx) => {
                  const dataKey = col.toLowerCase().replace(' ', '_');
                  const isSortable = ['name', 'salary'].includes(dataKey);
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
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading employees...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No employees found.</td></tr>
              ) : (
                data.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{emp.name}</td>
                    <td className="p-4 text-slate-500">{emp.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : emp.role === 'SUBADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{emp.department}</td>
                    <td className="p-4 font-medium text-slate-900">{formatCurrency(emp.salary)}</td>
                    <td className="p-4 flex items-center gap-2">
                      {user?.role === 'ADMIN' && emp.role !== 'ADMIN' && (
                        <>
                          {emp.role === 'SUBADMIN' ? (
                            <button onClick={() => setRoleUpdate({ id: emp.id, role: 'USER' })} title="Remove from Subadmin" className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                              <ShieldOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => setRoleUpdate({ id: emp.id, role: 'SUBADMIN' })} title="Make Subadmin" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setDeleteId(emp.id)} title="Delete" className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white/50">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
