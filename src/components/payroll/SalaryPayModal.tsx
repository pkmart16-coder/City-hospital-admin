import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { SalaryRecord, PaymentMethod } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface SalaryPayModalProps {
  salaryRecord: SalaryRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SalaryPayModal: React.FC<SalaryPayModalProps> = ({
  salaryRecord,
  isOpen,
  onClose
}) => {
  const { recordSalaryPayment } = useHospital();
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (salaryRecord) {
      setAmount(salaryRecord.remainingBalance || salaryRecord.netPayable);
      setMethod('Bank Transfer');
      setRef(`FT-SAL-${Math.floor(10000 + Math.random() * 90000)}`);
      setNotes('');
      setError('');
    }
  }, [salaryRecord, isOpen]);

  if (!isOpen || !salaryRecord) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Disbursement amount must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await recordSalaryPayment(salaryRecord.id, amount, method, ref, notes);
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Disbursement failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disburse Salary Payment"
      subtitle={`Voucher: ${salaryRecord.voucherNumber} · ${salaryRecord.employeeName} (${salaryRecord.period})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Net Salary:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatPKR(salaryRecord.netPayable)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Already Disbursed:</span>
            <span className="font-mono font-bold text-emerald-600">{formatPKR(salaryRecord.paidAmount || 0)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
            <span className="text-slate-700 dark:text-slate-300">Remaining Due:</span>
            <span className="font-mono text-teal-700 dark:text-teal-400">{formatPKR(salaryRecord.remainingBalance)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Amount to Disburse (PKR) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={salaryRecord.remainingBalance}
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Disbursement Mode <span className="text-rose-500">*</span>
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="Bank Transfer">Direct Bank Transfer / IBFT</option>
            <option value="Cheque">Hospital Official Cheque</option>
            <option value="Cash">Cash Voucher</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Bank Reference / Transaction ID
          </label>
          <input
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. FT-SAL-90214"
            className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Payroll Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Disbursed via Meezan Corporate Payroll portal"
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

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
            {isSubmitting ? 'Processing...' : 'Disburse & Update Ledger'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
