"use client";

import { useEffect, useState, useCallback } from "react";
import { getEmployees, deleteUser, updateRole, addUser, editUser } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Trash2, ShieldAlert, ShieldOff, UserPlus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import LabelTooltip from "./LabelTooltip";

export default function EmployeeTable() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [pageInput, setPageInput] = useState("1");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("ASC");
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [isOtherDept, setIsOtherDept] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER', job_title: '', experience: 0, department: 'Engineering', country: 'USA', salary: 100000, date_joined: new Date().toISOString().split('T')[0] });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roleUpdate, setRoleUpdate] = useState<{ id: number, role: 'SUBADMIN' | 'USER' } | null>(null);

  const [editUserModal, setEditUserModal] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ name: '', password: '', salary: 0, experience: 0 });

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

  useEffect(() => {
    setPageInput(pagination.page.toString());
  }, [pagination.page]);

  const handlePageSubmit = () => {
    let val = parseInt(pageInput);
    if (isNaN(val) || val < 1) val = 1;
    if (val > pagination.totalPages) val = pagination.totalPages;
    setPagination(prev => ({ ...prev, page: val }));
    setPageInput(val.toString());
  };

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
        toast.success('Employee deleted successfully');
        fetchData();
      } catch(err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete employee');
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
      toast.success('Employee added successfully');
      fetchData();
    } catch(err: any) {
      toast.error(err.response?.data?.error || 'Failed to add employee');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    try {
      await editUser(editUserModal.id, editFormData);
      toast.success('Employee updated successfully');
      setEditUserModal(null);
      fetchData();
    } catch(err: any) {
      toast.error(err.response?.data?.error || 'Failed to update employee');
    }
  };

  return (
    <div className="space-y-6">
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Employee">
        <p className="text-slate-600 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors">Delete</button>
        </div>
      </Modal>

      <Modal isOpen={roleUpdate !== null} onClose={() => setRoleUpdate(null)} title={roleUpdate?.role === 'SUBADMIN' ? "Make Subadmin" : "Remove Subadmin"}>
        <p className="text-slate-600 mb-6">
          {roleUpdate?.role === 'SUBADMIN' 
            ? "Are you sure you want to grant Subadmin privileges to this employee?" 
            : "Are you sure you want to remove Subadmin privileges from this employee?"}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setRoleUpdate(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={executeUpdateRole} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors">Confirm</button>
        </div>
      </Modal>

      <Modal isOpen={editUserModal !== null} onClose={() => setEditUserModal(null)} title="Edit Employee">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" required minLength={2} value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password (leave blank to keep current)</label>
            <input type="password" minLength={6} placeholder="Min 6 characters" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary (₹)</label>
              <input type="text" inputMode="numeric" required value={editFormData.salary || ''} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setEditFormData({...editFormData, salary: val === '' ? 0 : parseInt(val)});
              }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Yrs)</label>
              <input type="text" inputMode="numeric" required value={editFormData.experience === 0 ? '' : editFormData.experience} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setEditFormData({...editFormData, experience: val === '' ? 0 : parseInt(val)});
              }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button type="button" onClick={() => setEditUserModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors mr-3">Cancel</button>
            <button type="submit" disabled={!editFormData.name} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
          </div>
        </form>
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
            <UserPlus className="w-5 h-5" /> Add Employee
          </button>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Employee" maxWidth="max-w-2xl">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <LabelTooltip label="Name" tooltip="The employee's full legal name." />
              <input type="text" required minLength={2} maxLength={50} pattern="^[a-zA-Z\s]+$" title="Name should only contain letters and spaces" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Email" tooltip="The official company email address." />
              <input type="email" required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Password" tooltip="Must be at least 6 characters long." />
              <input type="password" required minLength={6} title="Password must be at least 6 characters long" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Role" tooltip="Admin/Subadmin have special dashboard access." />
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="USER">Employee</option>
                {user?.role === 'ADMIN' && <option value="SUBADMIN">Subadmin</option>}
              </select>
            </div>
            <div>
              <LabelTooltip label="Designation" tooltip="Official job title (e.g. Software Engineer)." />
              <input type="text" required minLength={2} title="Designation is required" placeholder="Software Engineer" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Department" tooltip="The team this employee belongs to." />
              {isOtherDept ? (
                <div className="flex gap-2">
                  <input type="text" required minLength={2} placeholder="Type department..." value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <button type="button" onClick={() => { setIsOtherDept(false); setFormData({...formData, department: 'Engineering'}); }} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                </div>
              ) : (
                <select value={formData.department} onChange={e => {
                  if (e.target.value === 'Other') {
                    setIsOtherDept(true);
                    setFormData({...formData, department: ''});
                  } else {
                    setFormData({...formData, department: e.target.value});
                  }
                }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Product', 'Support', 'Other'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
            <div>
              <LabelTooltip label="Experience (Years)" tooltip="Total professional experience in years." />
              <input type="text" inputMode="numeric" required maxLength={2} title="Experience must be numeric" placeholder="5" value={formData.experience === 0 ? '' : formData.experience} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({...formData, experience: val === '' ? 0 : parseInt(val)});
              }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Yearly Salary (₹)" tooltip="Total gross yearly salary before taxes/deductions." />
              <input type="text" inputMode="numeric" required maxLength={10} title="Salary must be numeric" placeholder="100000" value={formData.salary || ''} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({...formData, salary: val === '' ? 0 : parseInt(val)});
              }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Country" tooltip="Employee's primary country of residence." />
              <input type="text" required minLength={2} pattern="^[a-zA-Z\s]+$" title="Country should only contain letters and spaces" placeholder="USA" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Date Joined" tooltip="Official date of joining the company." />
              <input type="date" required max={new Date().toISOString().split('T')[0]} title="Date joined cannot be in the future" value={formData.date_joined} onChange={e => setFormData({...formData, date_joined: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors mr-3">Cancel</button>
            <button type="submit" disabled={!formData.name || !formData.email || !formData.password || !formData.job_title || !formData.department || !formData.country || !formData.date_joined} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Employee</button>
          </div>
        </form>
      </Modal>

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
                    <td className="p-4 font-medium text-slate-900">{emp.role === 'ADMIN' ? <span className="text-slate-400 italic">N/A (Founder/CEO)</span> : formatCurrency(emp.salary)}</td>
                    <td className="p-4 flex items-center gap-2">
                      {user?.role === 'ADMIN' && emp.role !== 'ADMIN' && (
                        <>
                          <button onClick={() => { setEditUserModal(emp); setEditFormData({ name: emp.name, password: '', salary: emp.salary, experience: emp.experience || 0 }); }} title="Edit Employee Details" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                            <Pencil className="w-4 h-4" />
                          </button>
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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              Page
              <input
                type="text"
                inputMode="numeric"
                value={pageInput}
                disabled={loading}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setPageInput(raw);
                }}
                onBlur={handlePageSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handlePageSubmit()}
                className="w-14 px-2 py-1 text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium disabled:opacity-50"
              />
              <span className="text-slate-400">of {pagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1 || loading}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages || loading}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
