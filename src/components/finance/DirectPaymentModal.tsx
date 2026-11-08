import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { Appointment, PaymentMethod } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface DirectPaymentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (receiptNo: string) => void;
}

export const DirectPaymentModal: React.FC<DirectPaymentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { recordDirectPayment } = useHospital();
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (appointment) {
      const remaining = Math.max(0, appointment.consultationFee - (appointment.paidAmount || 0));
      setAmount(remaining);
      setMethod('Cash');
      setNotes('');
      setError('');
    }
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      const receipt = await recordDirectPayment(appointment.id, amount, method, notes);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess(receipt);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record On-Site Payment"
      subtitle={`Counter collection for ${appointment.bookingReference} · ${appointment.patientName}`}
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
            <span className="text-slate-500">Consultation Fee:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatPKR(appointment.consultationFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Already Paid:</span>
            <span className="font-mono font-bold text-emerald-600">{formatPKR(appointment.paidAmount || 0)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
            <span className="text-slate-700 dark:text-slate-300">Remaining Balance:</span>
            <span className="font-mono text-rose-600">
              {formatPKR(Math.max(0, appointment.consultationFee - (appointment.paidAmount || 0)))}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Amount Collected (PKR) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Payment Method <span className="text-rose-500">*</span>
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="Cash">Cash at Reception Counter</option>
            <option value="Card">Debit / Credit Card POS Terminal</option>
            <option value="Bank Transfer">Direct Bank Transfer / IBFT</option>
            <option value="Cheque">Hospital Cheque / Pay Order</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Receipt / Cashier Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Card Terminal Slip #90214"
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
            {isSubmitting ? 'Recording...' : 'Collect & Issue Receipt'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
