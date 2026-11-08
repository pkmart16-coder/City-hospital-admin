import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Printer, 
  CheckCircle, 
  CreditCard, 
  Search, 
  Filter, 
  Banknote, 
  Clock, 
  FileCheck
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { SalaryRecord, SalaryStatus } from '../types';
import { formatPKR, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { StatusBadge } from '../components/common/Badge';
import { GeneratePayrollModal } from '../components/payroll/GeneratePayrollModal';
import { SalaryPayModal } from '../components/payroll/SalaryPayModal';
import { SalarySlip } from '../components/print/SalarySlip';

export const PayrollPage: React.FC = () => {
  const { salaryRecords, approveSalaryRecord, settings } = useHospital();
  const { hasPermission } = useAuth();

  const [periodFilter, setPeriodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<SalaryRecord | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [slipTarget, setSlipTarget] = useState<SalaryRecord | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const filteredRecords = salaryRecords.filter((rec) => {
    if (periodFilter !== 'All' && rec.period !== periodFilter) return false;
    if (statusFilter !== 'All' && rec.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = rec.employeeName.toLowerCase().includes(q);
      const matchId = rec.employeeId.toLowerCase().includes(q);
      const matchVoucher = rec.voucherNumber.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchVoucher) return false;
    }
    return true;
  });

  const totalPayrollGross = filteredRecords.reduce((s, r) => s + r.netPayable, 0);
  const totalPayrollDisbursed = filteredRecords.reduce((s, r) => s + r.paidAmount, 0);
  const totalPayrollPending = filteredRecords.reduce((s, r) => s + r.remainingBalance, 0);

  const handleExportCSV = () => {
    exportToCSV('hospital-staff-payroll', filteredRecords, [
      { key: 'voucherNumber', label: 'Voucher #' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'employeeName', label: 'Name' },
      { key: 'designation', label: 'Designation' },
      { key: 'department', label: 'Department' },
      { key: 'period', label: 'Period' },
      { key: 'baseSalary', label: 'Base (PKR)' },
      { key: 'totalAllowances', label: 'Allowances' },
      { key: 'totalDeductions', label: 'Deductions' },
      { key: 'netPayable', label: 'Net Payable' },
      { key: 'paidAmount', label: 'Paid Amount' },
      { key: 'remainingBalance', label: 'Balance Due' },
      { key: 'status', label: 'Status' }
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Staff & Doctor Payroll Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maintain salary structures, statutory tax deductions, voucher approval workflows and printable pay slips
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Payroll CSV
          </button>

          {hasPermission('payroll.manage') && (
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Salary Voucher
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-slate-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Net Payroll</span>
          <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatPKR(totalPayrollGross)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{filteredRecords.length} generated vouchers</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disbursed to Date</span>
          <h3 className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {formatPKR(totalPayrollDisbursed)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Processed bank transfers & cheques</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remaining Balance Due</span>
          <h3 className="text-xl font-bold font-mono text-amber-600 mt-1">
            {formatPKR(totalPayrollPending)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Pending approval & disbursement</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee ID, Name or Voucher #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Periods</option>
            <option value="September 2026">September 2026</option>
            <option value="October 2026">October 2026</option>
            <option value="November 2026">November 2026</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Salary Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-4 font-semibold">Voucher #</th>
                <th className="py-3 px-4 font-semibold">Employee</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Period</th>
                <th className="py-3 px-4 font-semibold text-right">Base Salary</th>
                <th className="py-3 px-4 font-semibold text-right">Net Payable</th>
                <th className="py-3 px-4 font-semibold text-right">Paid</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No payroll records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {rec.voucherNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{rec.employeeName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{rec.employeeId} · {rec.designation}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {rec.department}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {rec.period}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatPKR(rec.baseSalary)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatPKR(rec.netPayable)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {formatPKR(rec.paidAmount)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rec.status === 'Draft' && hasPermission('payroll.manage') && (
                          <button
                            onClick={() => approveSalaryRecord(rec.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                          >
                            Approve
                          </button>
                        )}

                        {rec.status !== 'Paid' && rec.status !== 'Draft' && hasPermission('payroll.manage') && (
                          <button
                            onClick={() => {
                              setPayTarget(rec);
                              setIsPayOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" /> Disburse
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSlipTarget(rec);
                            setIsSlipOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Print salary slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
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

      {/* Generate Payroll Modal */}
      <GeneratePayrollModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
      />

      {/* Pay Modal */}
      <SalaryPayModal
        salaryRecord={payTarget}
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
      />

      {/* Salary Slip Printable Modal */}
      {slipTarget && (
        <SalarySlip
          salaryRecord={slipTarget}
          settings={settings}
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
        />
      )}
    </div>
  );
};
