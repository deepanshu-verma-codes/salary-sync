"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getPayslips, createPayslip, getEmployees, updatePayslip, deletePayslip } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Download, Plus, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import LabelTooltip from "@/components/LabelTooltip";
import PayslipDocument from "@/components/PayslipDocument";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const currentYear = new Date().getFullYear();
const pastYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

export default function PayslipsPage() {
  const [user, setUser] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'COMPANY'>('PERSONAL');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  
  // For HR to create payslip
  const [showForm, setShowForm] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewPayslip, setViewPayslip] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({ employee_id: '', month: 'January', year: currentYear, amount: '' });
  const [deductions, setDeductions] = useState([{ name: 'Tax / PF', amount: 0 }]);

  const fetchData = useCallback(async () => {
    try {
      const res = await getPayslips();
      setPayslips(res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.role === 'ADMIN') {
        setActiveTab('COMPANY');
      }
      if (parsed.role !== 'USER') {
        getEmployees({ limit: 1000 }).then(res => setEmployees(res.data));
      }
    }
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, deduction_details: deductions.filter(d => d.name && d.amount > 0) };
      await createPayslip(payload);
      setShowForm(false);
      fetchData();
      toast.success('Payslip issued successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error creating payslip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, deduction_details: deductions.filter(d => d.name && d.amount > 0) };
      await updatePayslip(editForm.id, payload);
      setEditForm(null);
      fetchData();
      toast.success('Payslip updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error updating payslip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (deleteId) {
      setIsSubmitting(true);
      try {
        await deletePayslip(deleteId);
        toast.success('Payslip deleted successfully');
        fetchData();
      } catch(err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete payslip');
      } finally {
        setIsSubmitting(false);
        setDeleteId(null);
      }
    }
  };

  const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const netPay = (parseInt(formData.amount) || 0) - totalDeductions;

  if (loading) return <div className="p-8">Loading payslips...</div>;

  const displayedPayslips = user?.role === 'USER' ? payslips : payslips.filter(p => activeTab === 'PERSONAL' ? p.employee_id === user?.id : p.employee_id !== user?.id);
  
  const groupedPayslips = activeTab === 'COMPANY' ? Object.values(displayedPayslips.reduce((acc, slip) => {
    if (!acc[slip.employee_id]) acc[slip.employee_id] = { name: slip.employee_name || 'Unknown', id: slip.employee_id, slips: [] };
    acc[slip.employee_id].slips.push(slip);
    return acc;
  }, {} as Record<number, any>)) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <Modal isOpen={viewPayslip !== null} onClose={() => setViewPayslip(null)} title="View Payslip" maxWidth="max-w-4xl">
        <div id="payslip-modal-content" className="mb-6 max-h-[60vh] overflow-y-auto pr-2">
          {viewPayslip && <PayslipDocument slip={viewPayslip} />}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={() => setViewPayslip(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Close</button>
          <button 
            onClick={async () => {
              const element = document.querySelector('#payslip-modal-content #payslip-document') as HTMLElement;
              if (!element) return toast.error('Failed to find document');
              
              setDownloadingId(viewPayslip.id);
              try {
                const canvas = await html2canvas(element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Payslip_${viewPayslip.month}_${viewPayslip.year}.pdf`);
                toast.success('Downloaded successfully!');
              } catch (e) {
                toast.error('Failed to generate PDF');
              }
              setDownloadingId(null);
            }} 
            disabled={downloadingId === viewPayslip?.id}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {downloadingId === viewPayslip?.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Download PDF
          </button>
        </div>
      </Modal>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Payslip">
        <p className="text-slate-600 mb-6">Are you sure you want to delete this payslip? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteId(null)} disabled={isSubmitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={executeDelete} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* Hidden container for direct downloads - using absolute positioning to keep it in DOM but visually hidden without breaking html2canvas */}
      <div className="absolute opacity-0 pointer-events-none" style={{ left: 0, top: 0, zIndex: -100, width: '1000px' }}>
        {downloadingId && payslips.find(p => p.id === downloadingId) && (
          <div id="hidden-payslip-doc">
            <PayslipDocument slip={payslips.find(p => p.id === downloadingId)} />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payslips</h1>
          <p className="text-slate-500 mt-2">Manage and download monthly salary slips.</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'SUBADMIN') && (
          <div className="flex gap-4 items-center">
            {user?.role !== 'ADMIN' && (
              <div className="bg-white/50 p-1 rounded-xl shadow-sm border border-slate-200/60 flex">
                <button 
                  onClick={() => setActiveTab('PERSONAL')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'PERSONAL' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  My Payslips
                </button>
                <button 
                  onClick={() => setActiveTab('COMPANY')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'COMPANY' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Company Payslips
                </button>
              </div>
            )}
            {activeTab === 'COMPANY' && (
              <button onClick={() => {
                setFormData({ employee_id: '', month: 'January', year: currentYear, amount: '' });
                setDeductions([{ name: 'Tax / PF', amount: 0 }]);
                setShowForm(true);
              }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" /> Issue Payslip
              </button>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showForm || editForm !== null} onClose={() => { setShowForm(false); setEditForm(null); }} title={editForm ? "Edit Payslip" : "Issue New Payslip"} maxWidth="max-w-2xl">
        <form onSubmit={editForm ? handleUpdate : handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <LabelTooltip label="Employee" tooltip="Select the employee receiving the payslip." />
              <select required disabled={editForm !== null} value={formData.employee_id} onChange={(e) => {
                const empId = e.target.value;
                const emp = employees.find(emp => emp.id.toString() === empId);
                setFormData({...formData, employee_id: empId, amount: emp ? Math.round(emp.salary / 12).toString() : ''});
              }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500">
                <option value="">Select Employee</option>
                {employees.filter(e => e.role !== 'ADMIN' && (user?.role === 'ADMIN' || e.id !== user?.id)).map(e => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
              </select>
            </div>
            <div>
              <LabelTooltip label="Month" tooltip="The month this salary covers." />
              <select required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <LabelTooltip label="Year" tooltip="The year for this payslip." />
              <select required value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {pastYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <LabelTooltip label="Total Salary (₹)" tooltip="Total gross salary." />
              <input type="text" inputMode="numeric" required placeholder="Amount" value={formData.amount} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({...formData, amount: val});
              }} disabled={user?.role !== 'ADMIN' && user?.role !== 'SUBADMIN'} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500" />
            </div>
            <div>
              <LabelTooltip label="Base Salary (Auto-Calculated) (₹)" tooltip="Total Salary minus all Extra Deductions." />
              <input type="text" disabled value={netPay} className="w-full px-4 py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 font-bold focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <LabelTooltip label="Extra Deductions" tooltip="Any taxes, provident fund, or miscellaneous deductions." />
              {deductions.map((d, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" placeholder="Reason (e.g. Tax)" value={d.name} onChange={e => {
                    const newDeds = [...deductions];
                    newDeds[index].name = e.target.value;
                    setDeductions(newDeds);
                  }} className="w-1/2 px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <input type="text" inputMode="numeric" placeholder="Amount (₹)" value={d.amount === 0 ? '' : d.amount} onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newDeds = [...deductions];
                    newDeds[index].amount = val === '' ? 0 : parseInt(val);
                    setDeductions(newDeds);
                  }} className="w-1/2 px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {index === deductions.length - 1 ? (
                    <button type="button" onClick={() => setDeductions([...deductions, { name: '', amount: 0 }])} className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : (
                    <button type="button" onClick={() => setDeductions(deductions.filter((_, i) => i !== index))} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">
                      <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button type="button" onClick={() => { setShowForm(false); setEditForm(null); }} disabled={isSubmitting} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors mr-3 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!formData.employee_id || !formData.month || !formData.year || !formData.amount || isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : (editForm ? "Save Changes" : "Issue Payslip")}
            </button>
          </div>
        </form>
      </Modal>

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Employee</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Period</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Paid On</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'COMPANY' ? (
              groupedPayslips.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payslips found.</td></tr>
              ) : (
                groupedPayslips.map((group: any) => (
                  <React.Fragment key={group.id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setExpandedUser(expandedUser === group.id ? null : group.id)}>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{group.name.charAt(0)}</span>
                        {group.name}
                      </td>
                      <td className="p-4 text-slate-600" colSpan={3}>{group.slips.length} Payslip{group.slips.length > 1 ? 's' : ''}</td>
                      <td className="p-4 text-slate-400 font-medium">
                        {expandedUser === group.id ? 'Hide Slips ▲' : 'View Slips ▼'}
                      </td>
                    </tr>
                    {expandedUser === group.id && group.slips.map((slip: any) => (
                      <tr key={slip.id} className="border-b border-slate-50 bg-slate-50/30">
                        <td className="p-4 pl-16 text-slate-500 text-sm font-medium">↳ ID: #{slip.id.toString().padStart(4, '0')}</td>
                        <td className="p-4 text-slate-600 font-medium">{slip.month} {slip.year}</td>
                        <td className="p-4 font-medium text-slate-900">{formatCurrency(slip.amount)}</td>
                        <td className="p-4 text-slate-500">{slip.paid_at}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <button onClick={() => setViewPayslip(slip)} title="View" className="flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={async () => {
                                setDownloadingId(slip.id);
                                setTimeout(async () => {
                                  const element = document.querySelector('#hidden-payslip-doc #payslip-document') as HTMLElement;
                                  if (!element) {
                                    setDownloadingId(null);
                                    return toast.error('Failed to find document');
                                  }
                                  try {
                                    const canvas = await html2canvas(element, { scale: 2 });
                                    const imgData = canvas.toDataURL('image/png');
                                    const pdf = new jsPDF('p', 'mm', 'a4');
                                    const pdfWidth = pdf.internal.pageSize.getWidth();
                                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                    pdf.save(`Payslip_${slip.month}_${slip.year}.pdf`);
                                    toast.success('Downloaded successfully!');
                                  } catch (e) {
                                    toast.error('Failed to generate PDF');
                                  }
                                  setDownloadingId(null);
                                }, 100);
                              }} 
                              disabled={downloadingId === slip.id}
                              title="Download"
                              className="flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {downloadingId === slip.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} 
                            </button>
                            <button onClick={() => {
                              setEditForm(slip);
                              setFormData({ employee_id: slip.employee_id.toString(), month: slip.month, year: slip.year, amount: slip.amount.toString() });
                              try {
                                const parsed = JSON.parse(slip.deduction_details);
                                setDeductions(parsed.length ? parsed : [{ name: '', amount: 0 }]);
                              } catch (e) { setDeductions([{ name: '', amount: 0 }]); }
                            }} title="Edit" className="flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors">
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => setDeleteId(slip.id)} title="Delete" className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )
            ) : (
              displayedPayslips.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payslips found.</td></tr>
              ) : (
                displayedPayslips.map(slip => (
                  <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{slip.employee_name || user.name}</td>
                    <td className="p-4 text-slate-600">{slip.month} {slip.year}</td>
                    <td className="p-4 font-medium text-slate-900">{formatCurrency(slip.amount)}</td>
                    <td className="p-4 text-slate-500">{slip.paid_at}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setViewPayslip(slip)} title="View" className="flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={async () => {
                            setDownloadingId(slip.id);
                            setTimeout(async () => {
                              const element = document.querySelector('#hidden-payslip-doc #payslip-document') as HTMLElement;
                              if (!element) {
                                setDownloadingId(null);
                                return toast.error('Failed to find document');
                              }
                              try {
                                const canvas = await html2canvas(element, { scale: 2 });
                                const imgData = canvas.toDataURL('image/png');
                                const pdf = new jsPDF('p', 'mm', 'a4');
                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                pdf.save(`Payslip_${slip.month}_${slip.year}.pdf`);
                                toast.success('Downloaded successfully!');
                              } catch (e) {
                                toast.error('Failed to generate PDF');
                              }
                              setDownloadingId(null);
                            }, 100);
                          }} 
                          disabled={downloadingId === slip.id}
                          title="Download"
                          className="flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {downloadingId === slip.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} 
                        </button>
                        {(user?.role === 'ADMIN' || (user?.role === 'SUBADMIN' && slip.employee_id !== user?.id)) && (
                          <>
                            <button onClick={() => {
                              setEditForm(slip);
                              setFormData({ employee_id: slip.employee_id.toString(), month: slip.month, year: slip.year, amount: slip.amount.toString() });
                              try {
                                const parsed = JSON.parse(slip.deduction_details);
                                setDeductions(parsed.length ? parsed : [{ name: '', amount: 0 }]);
                              } catch (e) { setDeductions([{ name: '', amount: 0 }]); }
                            }} title="Edit" className="flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors">
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => setDeleteId(slip.id)} title="Delete" className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
