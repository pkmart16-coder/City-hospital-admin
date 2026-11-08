import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { SalaryRecord, SalaryBasis } from '../../types';
import { generateSalaryVoucher, formatPKR } from '../../utils/formatters';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeneratePayrollModal: React.FC<GeneratePayrollModalProps> = ({
  isOpen,
  onClose
}) => {
  const { staff, doctors, salaryRecords, saveSalaryRecord } = useHospital();

  const [targetType, setTargetType] = useState<'staff' | 'doctor'>('staff');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [period, setPeriod] = useState('October 2026');
  const [salaryBasis, setSalaryBasis] = useState<SalaryBasis>('Monthly');
  const [baseSalary, setBaseSalary] = useState<number>(50000);
  
  // Allowances
  const [medAllowance, setMedAllowance] = useState<number>(5000);
  const [transAllowance, setTransAllowance] = useState<number>(5000);
  const [housingAllowance, setHousingAllowance] = useState<number>(0);
  
  // Deductions
  const [taxDeduction, setTaxDeduction] = useState<number>(2000);
  const [pfDeduction, setPfDeduction] = useState<number>(2500);
  const [leaveDeduction, setLeaveDeduction] = useState<number>(0);

  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When staff selection changes, auto-fill base salary
  const handleStaffChange = (id: string) => {
    setSelectedStaffId(id);
    if (targetType === 'staff') {
      const s = staff.find(x => x.id === id);
      if (s) {
        setBaseSalary(s.baseSalary || 50000);
        setSalaryBasis(s.salaryBasis || 'Monthly');
      }
    } else {
      const d = doctors.find(x => x.id === id);
      if (d) {
        setBaseSalary(150000); // Doctor baseline retainer
        setSalaryBasis('Monthly');
      }
    }
  };

  const totalAllowances = Number(medAllowance) + Number(transAllowance) + Number(housingAllowance);
  const totalDeductions = Number(taxDeduction) + Number(pfDeduction) + Number(leaveDeduction);
  const netPayable = Math.max(0, Number(baseSalary) + totalAllowances - totalDeductions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setError('Please select an employee or doctor.');
      return;
    }

    // Check duplicate
    const existing = salaryRecords.find(
      r => (r.employeeId === selectedStaffId || r.id === selectedStaffId) && r.period === period
    );
    if (existing) {
      setError(`Payroll record already exists for this person in ${period} (${existing.voucherNumber}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      const voucher = generateSalaryVoucher();

      let empName = '';
      let empId = '';
      let empDesig = '';
      let empDept = '';

      if (targetType === 'staff') {
        const s = staff.find(x => x.id === selectedStaffId);
        if (s) {
          empName = s.name;
          empId = s.employeeId;
          empDesig = s.designation;
          empDept = s.department;
        }
      } else {
        const d = doctors.find(x => x.id === selectedStaffId);
        if (d) {
          empName = `${d.title} ${d.name}`;
          empId = `DOC-${d.id.slice(4)}`;
          empDesig = `Consultant (${d.specialization})`;
          empDept = d.departmentName;
        }
      }

      await saveSalaryRecord({
        voucherNumber: voucher,
        employeeId: empId,
        employeeName: empName,
        designation: empDesig,
        department: empDept,
        role: targetType === 'doctor' ? 'Doctor / Consultant' : 'Staff',
        period,
        salaryBasis,
        baseSalary,
        allowances: {
          medical: medAllowance,
          transport: transAllowance,
          housing: housingAllowance
        },
        totalAllowances,
        deductions: {
          tax: taxDeduction,
          providentFund: pfDeduction,
          unpaidLeave: leaveDeduction
        },
        totalDeductions,
        netPayable,
        paidAmount: 0,
        status: 'Draft',
        notes: notes.trim() || undefined
      });

      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to generate payroll');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Salary Voucher / Payroll"
      subtitle="Calculate base salary, authorized allowances, statutory tax and create draft record"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Employee Category & Target */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Beneficiary Type
            </label>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => { setTargetType('staff'); setSelectedStaffId(''); }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${targetType === 'staff' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'}`}
              >
                Hospital Staff
              </button>
              <button
                type="button"
                onClick={() => { setTargetType('doctor'); setSelectedStaffId(''); }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${targetType === 'doctor' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'}`}
              >
                Doctor / Consultant
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Person <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">— Choose —</option>
              {targetType === 'staff'
                ? staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.employeeId}) - {s.designation}
                    </option>
                  ))
                : doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} {d.name} ({d.departmentName})
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Period & Salary Basis */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Salary Period <span className="text-rose-500">*</span>
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="December 2026">December 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Base Salary (PKR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Allowances vs Deductions */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {/* Allowances */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] border-b pb-1">
              Allowances (+)
            </h5>
            <div>
              <span className="text-slate-500 block mb-0.5">Medical</span>
              <input
                type="number"
                min="0"
                value={medAllowance}
                onChange={(e) => setMedAllowance(Number(e.target.value))}
                className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Transport</span>
              <input
                type="number"
                min="0"
                value={transAllowance}
                onChange={(e) => setTransAllowance(Number(e.target.value))}
                className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] border-b pb-1">
              Deductions (-)
            </h5>
            <div>
              <span className="text-slate-500 block mb-0.5">Income Tax</span>
              <input
                type="number"
                min="0"
                value={taxDeduction}
                onChange={(e) => setTaxDeduction(Number(e.target.value))}
                className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Provident Fund</span>
              <input
                type="number"
                min="0"
                value={pfDeduction}
                onChange={(e) => setPfDeduction(Number(e.target.value))}
                className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Calculated Summary */}
        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-teal-800 dark:text-teal-300">Total Allowances:</span>
            <span className="font-mono font-bold text-emerald-700">+{formatPKR(totalAllowances)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-teal-800 dark:text-teal-300">Total Deductions:</span>
            <span className="font-mono font-bold text-rose-700">-{formatPKR(totalDeductions)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-teal-200 dark:border-teal-800 text-sm font-bold">
            <span className="text-teal-900 dark:text-teal-200">Net Payable Amount:</span>
            <span className="font-mono text-teal-900 dark:text-teal-100">{formatPKR(netPayable)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Generating...' : 'Save Draft Payroll'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
