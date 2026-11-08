import React from 'react';
import { Printer, X } from 'lucide-react';
import { SalaryRecord, HospitalSettings } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

interface SalarySlipProps {
  salaryRecord: SalaryRecord;
  settings: HospitalSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({
  salaryRecord,
  settings,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Controls */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Salary Pay Voucher / Slip
            </h3>
            <p className="text-xs text-slate-500">
              Voucher: {salaryRecord.voucherNumber} · Period: {salaryRecord.period}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Salary Slip
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div 
            id="printable-slip"
            className="w-full bg-white p-8 border border-slate-300 shadow-md text-slate-900 print:m-0 print:p-6 print:border-none print:shadow-none print:w-full"
          >
            {/* Header */}
            <div className="flex justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{settings.hospitalName}</h1>
                <p className="text-xs text-slate-600">{settings.address}</p>
                <p className="text-xs font-semibold text-teal-800 mt-1 uppercase tracking-wider">
                  CONFIDENTIAL EMPLOYEE SALARY DISBURSEMENT SLIP
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold block">{salaryRecord.voucherNumber}</span>
                <span className="text-xs text-slate-500">Period: {salaryRecord.period}</span>
              </div>
            </div>

            {/* Employee Meta */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
              <div className="space-y-1.5">
                <p><span className="text-slate-500">Employee ID:</span> <span className="font-bold font-mono">{salaryRecord.employeeId}</span></p>
                <p><span className="text-slate-500">Employee Name:</span> <span className="font-bold text-sm text-slate-900">{salaryRecord.employeeName}</span></p>
                <p><span className="text-slate-500">Designation:</span> <span className="font-medium">{salaryRecord.designation}</span></p>
              </div>
              <div className="space-y-1.5">
                <p><span className="text-slate-500">Department:</span> <span className="font-medium">{salaryRecord.department}</span></p>
                <p><span className="text-slate-500">Salary Basis:</span> <span className="font-semibold">{salaryRecord.salaryBasis}</span></p>
                <p><span className="text-slate-500">Payment Status:</span> <span className="font-bold text-teal-700">{salaryRecord.status}</span></p>
              </div>
            </div>

            {/* Earnings & Deductions Grid */}
            <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200 text-xs">
              {/* Earnings */}
              <div>
                <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">EARNINGS & ALLOWANCES</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Salary:</span>
                    <span className="font-mono">{formatPKR(salaryRecord.baseSalary)}</span>
                  </div>
                  {salaryRecord.allowances?.medical && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Medical Allowance:</span>
                      <span className="font-mono">{formatPKR(salaryRecord.allowances.medical)}</span>
                    </div>
                  )}
                  {salaryRecord.allowances?.transport && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transport Allowance:</span>
                      <span className="font-mono">{formatPKR(salaryRecord.allowances.transport)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t font-semibold">
                    <span>Total Allowances:</span>
                    <span className="font-mono text-emerald-700">+{formatPKR(salaryRecord.totalAllowances)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">DEDUCTIONS & TAX</h4>
                <div className="space-y-1.5">
                  {salaryRecord.deductions?.tax && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Income Tax:</span>
                      <span className="font-mono">{formatPKR(salaryRecord.deductions.tax)}</span>
                    </div>
                  )}
                  {salaryRecord.deductions?.providentFund && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Provident Fund:</span>
                      <span className="font-mono">{formatPKR(salaryRecord.deductions.providentFund)}</span>
                    </div>
                  )}
                  {salaryRecord.deductions?.unpaidLeave && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Leave Deduction:</span>
                      <span className="font-mono">{formatPKR(salaryRecord.deductions.unpaidLeave)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t font-semibold">
                    <span>Total Deductions:</span>
                    <span className="font-mono text-rose-700">-{formatPKR(salaryRecord.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Amount Box */}
            <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">NET SALARY PAYABLE:</span>
                <span className="font-bold font-mono text-lg text-slate-900">{formatPKR(salaryRecord.netPayable)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span>Disbursed Amount:</span>
                <span className="font-bold font-mono text-emerald-700">{formatPKR(salaryRecord.paidAmount)}</span>
              </div>
              {salaryRecord.remainingBalance > 0 && (
                <div className="flex justify-between items-center text-rose-700">
                  <span>Balance Payable:</span>
                  <span className="font-bold font-mono">{formatPKR(salaryRecord.remainingBalance)}</span>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="text-xs text-slate-600 space-y-1">
              <p><span className="font-semibold">Disbursement Date:</span> {formatDate(salaryRecord.paymentDate || new Date().toISOString())}</p>
              <p><span className="font-semibold">Payment Mode:</span> {salaryRecord.paymentMethod || 'Bank Transfer'}</p>
              {salaryRecord.paymentReference && (
                <p><span className="font-semibold">Bank Reference:</span> <span className="font-mono">{salaryRecord.paymentReference}</span></p>
              )}
              {salaryRecord.approvedBy && (
                <p><span className="font-semibold">Authorized By:</span> {salaryRecord.approvedBy}</p>
              )}
            </div>

            {/* Signatures */}
            <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <span>Prepared by Accounts</span>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <span>Authorized Signatory</span>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <span>Employee Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
