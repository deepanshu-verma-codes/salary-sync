import { formatCurrency } from "@/lib/utils";

export default function PayslipDocument({ slip }: { slip: any }) {
  let parsedDeductions = [];
  try {
    parsedDeductions = typeof slip.deduction_details === 'string' ? JSON.parse(slip.deduction_details) : (slip.deduction_details || []);
  } catch (e) {
    parsedDeductions = [];
  }
  if (parsedDeductions.length === 0 && slip.deductions > 0) {
    // Fallback for older payslips
    parsedDeductions = [{ name: 'Tax / PF / Other', amount: slip.deductions }];
  }

  if (!slip) return null;

  return (
    <div id="payslip-document" className="bg-white p-8 max-w-3xl mx-auto border border-slate-200">
      <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">SALARY SYNC</h1>
          <p className="text-sm text-slate-500 font-medium tracking-wide">ACME Corporation Ltd.</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest">Payslip</h2>
          <p className="text-sm font-medium text-slate-500">{slip.month} {slip.year}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Employee Details</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-900">{slip.employee_name}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Department:</span> <span className="font-semibold text-slate-900">{slip.employee_department || 'N/A'}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Designation:</span> <span className="font-semibold text-slate-900">{slip.employee_job_title || 'N/A'}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Date Joined:</span> <span className="font-semibold text-slate-900">{slip.employee_date_joined || 'N/A'}</span></p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Payslip ID:</span> <span className="font-semibold text-slate-900">#{slip.id.toString().padStart(6, '0')}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Payment Date:</span> <span className="font-semibold text-slate-900">{slip.paid_at}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">PAID</span></p>
          </div>
        </div>
      </div>

      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="bg-slate-50 border-y border-slate-200 text-slate-600">
            <th className="py-3 px-4 text-left font-semibold">Earnings</th>
            <th className="py-3 px-4 text-right font-semibold">Amount</th>
            <th className="py-3 px-4 text-left font-semibold border-l border-slate-200">Deductions</th>
            <th className="py-3 px-4 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="border-b border-slate-200">
          <tr>
            <td className="py-4 px-4 font-medium text-slate-800 align-top">
              <div className="mb-2">Basic Salary</div>
            </td>
            <td className="py-4 px-4 text-right font-medium text-slate-900 align-top">
              <div className="mb-2">{formatCurrency(slip.amount)}</div>
            </td>
            <td className="py-4 px-4 text-slate-500 border-l border-slate-200 align-top">
              {parsedDeductions.length > 0 ? parsedDeductions.map((d: any, idx: number) => (
                <div key={idx} className="mb-2">{d.name}</div>
              )) : <div className="mb-2">None</div>}
            </td>
            <td className="py-4 px-4 text-right text-slate-500 align-top">
              {parsedDeductions.length > 0 ? parsedDeductions.map((d: any, idx: number) => (
                <div key={idx} className="mb-2">{formatCurrency(d.amount)}</div>
              )) : <div className="mb-2">{formatCurrency(0)}</div>}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="flex justify-between text-sm mb-2"><span className="text-slate-500">Total Earnings:</span> <span className="font-semibold text-slate-900">{formatCurrency(slip.amount)}</span></p>
          <p className="flex justify-between text-sm mb-4"><span className="text-slate-500">Total Deductions:</span> <span className="font-semibold text-slate-900">{formatCurrency(slip.deductions || 0)}</span></p>
          <div className="pt-3 border-t border-slate-200">
            <p className="flex justify-between"><span className="font-bold text-slate-800">Net Pay:</span> <span className="font-black text-xl text-blue-600">{formatCurrency(slip.amount - (slip.deductions || 0))}</span></p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">This is a computer-generated document. No signature is required.</p>
      </div>
    </div>
  );
}
