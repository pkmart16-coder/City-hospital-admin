import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useHospital } from '../../context/HospitalContext';
import { PaymentSubmission } from '../../types';
import { formatPKR, formatDateTime } from '../../utils/formatters';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

interface PaymentVerifyModalProps {
  submission: PaymentSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentVerifyModal: React.FC<PaymentVerifyModalProps> = ({
  submission,
  isOpen,
  onClose
}) => {
  const { verifyPaymentSubmission, appointments } = useHospital();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !submission) return null;

  const associatedAppointment = appointments.find(a => a.id === submission.appointmentId);
  const isAmountMatching = submission.amountPaid >= submission.amountExpected;

  const handleApprove = async () => {
    setIsProcessing(true);
    await verifyPaymentSubmission(submission.id, true);
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async (reason?: string) => {
    setIsProcessing(true);
    await verifyPaymentSubmission(submission.id, false, reason);
    setIsProcessing(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Verify Bank Transfer Submission"
        subtitle={`Audit proof submitted for Booking Ref: ${submission.bookingReference}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Amount Match Notice */}
          {!isAmountMatching && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-800 dark:text-amber-300 font-medium">
                Amount Discrepancy: Submitted amount ({formatPKR(submission.amountPaid)}) is less than the expected consultation fee ({formatPKR(submission.amountExpected)}).
              </span>
            </div>
          )}

          {/* Submission Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1.5">
              <p><span className="text-slate-500">Patient:</span> <span className="font-bold text-slate-900 dark:text-white">{submission.patientName}</span></p>
              <p><span className="text-slate-500">Phone:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{submission.patientPhone}</span></p>
              <p><span className="text-slate-500">Doctor:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{submission.doctorName}</span></p>
              <p><span className="text-slate-500">Submitted:</span> <span className="text-slate-600 dark:text-slate-300">{formatDateTime(submission.submittedAt)}</span></p>
            </div>

            <div className="space-y-1.5">
              <p><span className="text-slate-500">Transfer Bank:</span> <span className="font-bold text-slate-900 dark:text-white">{submission.bankName}</span></p>
              <p><span className="text-slate-500">Sender Title:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{submission.senderAccountTitle || '—'}</span></p>
              <p><span className="text-slate-500">Transaction Ref:</span> <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{submission.transactionReference}</span></p>
              <p><span className="text-slate-500">Amount Paid:</span> <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{formatPKR(submission.amountPaid)}</span></p>
            </div>
          </div>

          {/* Evidence / Screenshot Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Submitted Payment Proof / Slip
              </label>
              {submission.proofImageUrl && (
                <a
                  href={submission.proofImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open Full Image
                </a>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-48 max-h-72">
              {submission.proofImageUrl ? (
                <img
                  src={submission.proofImageUrl}
                  alt="Payment receipt proof"
                  className="object-contain max-h-68 rounded"
                />
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  No visual receipt image uploaded. Verify using Transaction Ref: {submission.transactionReference} in bank statement.
                </div>
              )}
            </div>
          </div>

          {/* Audit Verification Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRejectDialogOpen(true)}
              disabled={isProcessing || submission.status !== 'Pending Verification'}
              className="px-4 py-2 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject Payment (Requires Reason)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing || submission.status !== 'Pending Verification'}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isProcessing ? 'Verifying...' : 'Approve & Issue Receipt'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Mandatory Reason Confirmation for Rejection */}
      <ConfirmDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="Reject Bank Transfer Payment"
        message={`Rejecting payment for booking ${submission.bookingReference}. This will mark the payment as Rejected and require patient re-submission.`}
        confirmLabel="Reject Payment"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Specify reason for rejection (e.g. Transaction reference not found in Meezan Bank statement, amount incorrect, illegible screenshot)..."
      />
    </>
  );
};
