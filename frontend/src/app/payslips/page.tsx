"use client";
import { useEffect, useState, useCallback } from "react";
import { getPayslips, createPayslip, getEmployees } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Download, Plus, Eye, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import LabelTooltip from "@/components/LabelTooltip";
import PayslipDocument from "@/components/PayslipDocument";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PayslipsPage() {
  const [user, setUser] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For HR to create payslip
  const [showForm, setShowForm] = useState(false);
  const [viewPayslip, setViewPayslip] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({ employee_id: '', month: 'January', year: 2026, amount: '' });
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
      if (parsed.role !== 'USER') {
        getEmployees({ limit: 1000 }).then(res => setEmployees(res.data));
      }
    }
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, deduction_details: deductions.filter(d => d.name && d.amount > 0) };
      await createPayslip(payload);
      setShowForm(false);
      fetchData();
      toast.success('Payslip issued successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error creating payslip');
    }
  };

  const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const netPay = (parseInt(formData.amount) || 0) - totalDeductions;

  if (loading) return <div className="p-8">Loading payslips...</div>;

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
              const element = document.getElementById('payslip-document');
              if (!element) return;
              
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

      {/* Hidden container for direct downloads */}
      <div className="absolute left-[-9999px] top-[-9999px]">
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
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" /> Issue Payslip
          </button>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Issue New Payslip" maxWidth="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <LabelTooltip label="Employee" tooltip="Select the employee receiving the payslip." />
              <select required value={formData.employee_id} onChange={(e) => {
                const empId = e.target.value;
                const emp = employees.find(emp => emp.id.toString() === empId);
                setFormData({...formData, employee_id: empId, amount: emp ? Math.round(emp.salary / 12).toString() : ''});
              }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">Select Employee</option>
                {employees.filter(e => e.role !== 'ADMIN').map(e => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
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
              <input type="text" inputMode="numeric" required maxLength={4} placeholder="Year" value={formData.year || ''} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({...formData, year: val === '' ? 0 : parseInt(val)});
              }} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <LabelTooltip label="Gross Salary (₹)" tooltip="Monthly base pay. Auto-calculated from yearly salary." />
              <input type="text" inputMode="numeric" required placeholder="Amount" value={formData.amount} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({...formData, amount: val});
              }} disabled={user?.role !== 'ADMIN' && user?.role !== 'SUBADMIN'} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500" />
            </div>
            <div>
              <LabelTooltip label="Net Pay (Auto-Calculated) (₹)" tooltip="Gross Salary minus all Extra Deductions." />
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
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors mr-3">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Issue Payslip</button>
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
            {payslips.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payslips found.</td></tr>
            ) : (
              payslips.map(slip => (
                <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{slip.employee_name || user.name}</td>
                  <td className="p-4 text-slate-600">{slip.month} {slip.year}</td>
                  <td className="p-4 font-medium text-slate-900">{formatCurrency(slip.amount)}</td>
                  <td className="p-4 text-slate-500">{slip.paid_at}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setViewPayslip(slip)} className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition-colors">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button 
                        onClick={async () => {
                          setDownloadingId(slip.id);
                          // Give React a tick to render the hidden document
                          setTimeout(async () => {
                            const element = document.getElementById('payslip-document');
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
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
                      >
                        {downloadingId === slip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
