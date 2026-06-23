import { formatCurrency } from "@/lib/utils";

export default function PayslipDocument({ slip }: { slip: any }) {
  let parsedDeductions = [];
  try {
    parsedDeductions = typeof slip.deduction_details === 'string' ? JSON.parse(slip.deduction_details) : (slip.deduction_details || []);
  } catch (e) {
    parsedDeductions = [];
  }
  if (parsedDeductions.length === 0 && slip.deductions > 0) {
    parsedDeductions = [{ name: 'Tax / PF / Other', amount: slip.deductions }];
  }

  if (!slip) return null;

  return (
    <div id="payslip-document" className="p-8 max-w-3xl mx-auto border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}>
      <div className="flex justify-between items-center border-b-2 pb-6 mb-6" style={{ borderColor: '#1e293b' }}>
        <div>
          <h1 className="text-3xl font-black tracking-tighter" style={{ color: '#0f172a' }}>SALARY SYNC</h1>
          <p className="text-sm font-medium tracking-wide" style={{ color: '#64748b' }}>ACME Corporation Ltd.</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-widest" style={{ color: '#1e293b' }}>Payslip</h2>
          <p className="text-sm font-medium" style={{ color: '#64748b' }}>{slip.month} {slip.year}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Employee Details</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span style={{ color: '#64748b' }}>Name:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>{slip.employee_name}</span></p>
            <p className="flex justify-between"><span style={{ color: '#64748b' }}>Department:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>{slip.employee_department || 'N/A'}</span></p>
            <p className="flex justify-between"><span style={{ color: '#64748b' }}>Designation:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>{slip.employee_job_title || 'N/A'}</span></p>
            <p className="flex justify-between"><span style={{ color: '#64748b' }}>Date Joined:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>{slip.employee_date_joined || 'N/A'}</span></p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Payment Details</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span style={{ color: '#64748b' }}>Payslip ID:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>#{slip.id.toString().padStart(6, '0')}</span></p>
            <p className="flex justify-between"><span style={{ color: '#64748b' }}>Payment Date:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>{slip.paid_at}</span></p>
            <p className="flex justify-between"><span style={{ color: '#64748b' }}>Status:</span> <span className="font-semibold px-2 py-0.5 rounded" style={{ color: '#16a34a', backgroundColor: '#f0fdf4' }}>PAID</span></p>
          </div>
        </div>
      </div>

      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-y" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
            <th className="py-3 px-4 text-left font-semibold">Earnings</th>
            <th className="py-3 px-4 text-right font-semibold">Amount</th>
            <th className="py-3 px-4 text-left font-semibold border-l" style={{ borderColor: '#e2e8f0' }}>Deductions</th>
            <th className="py-3 px-4 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="border-b" style={{ borderColor: '#e2e8f0' }}>
          <tr>
            <td className="py-4 px-4 font-medium align-top" style={{ color: '#1e293b' }}>
              <div className="mb-2">Base Salary</div>
            </td>
            <td className="py-4 px-4 text-right font-medium align-top" style={{ color: '#0f172a' }}>
              <div className="mb-2">{formatCurrency(slip.amount - (slip.deductions || 0))}</div>
            </td>
            <td className="py-4 px-4 border-l align-top" style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
              {parsedDeductions.length > 0 ? parsedDeductions.map((d: any, idx: number) => (
                <div key={idx} className="mb-2">{d.name}</div>
              )) : <div className="mb-2">None</div>}
            </td>
            <td className="py-4 px-4 text-right align-top" style={{ color: '#64748b' }}>
              {parsedDeductions.length > 0 ? parsedDeductions.map((d: any, idx: number) => (
                <div key={idx} className="mb-2">{formatCurrency(d.amount)}</div>
              )) : <div className="mb-2">{formatCurrency(0)}</div>}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 p-4 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
          <p className="flex justify-between text-sm mb-2"><span style={{ color: '#64748b' }}>Base Salary:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>{formatCurrency(slip.amount - (slip.deductions || 0))}</span></p>
          <p className="flex justify-between text-sm mb-4"><span style={{ color: '#64748b' }}>Total Deductions:</span> <span className="font-semibold" style={{ color: '#0f172a' }}>{formatCurrency(slip.deductions || 0)}</span></p>
          <div className="pt-3 border-t" style={{ borderColor: '#e2e8f0' }}>
            <p className="flex justify-between"><span className="font-bold" style={{ color: '#1e293b' }}>Total Salary:</span> <span className="font-black text-xl" style={{ color: '#2563eb' }}>{formatCurrency(slip.amount)}</span></p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: '#e2e8f0' }}>
        <p className="text-xs" style={{ color: '#94a3b8' }}>This is a computer-generated document. No signature is required.</p>
      </div>
    </div>
  );
}
