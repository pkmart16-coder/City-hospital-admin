import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { AppointmentSlip } from '../print/AppointmentSlip';
import { useHospital } from '../../context/HospitalContext';
import { Appointment, AppointmentStatus, PaymentStatus } from '../../types';
import { formatPKR, formatDate, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import { 
  Printer, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPaymentModal?: (apt: Appointment) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onOpenPaymentModal
}) => {
  const { updateAppointment, cancelAppointment, settings } = useHospital();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);
  const [isReprint, setIsReprint] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    await updateAppointment(
      appointment.id,
      { status: newStatus },
      `Updated status of booking ${appointment.bookingReference} to ${newStatus}`
    );
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    await updateAppointment(
      appointment.id,
      {
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: 'Confirmed'
      },
      `Rescheduled booking ${appointment.bookingReference} to ${newDate} at ${newTime}`
    );
    setIsRescheduling(false);
  };

  const handleSaveNotes = async () => {
    await updateAppointment(
      appointment.id,
      { internalNotes },
      `Updated internal notes on booking ${appointment.bookingReference}`
    );
    setIsEditingNotes(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Appointment: ${appointment.bookingReference}`}
        subtitle={`Registered ${formatDateTime(appointment.createdAt)} via ${appointment.source}`}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Top Status & Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Visit Status
                </span>
                <StatusBadge status={appointment.status} size="md" />
              </div>

              <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Payment Status
                </span>
                <StatusBadge status={appointment.paymentStatus} size="md" />
              </div>
            </div>

            {/* Quick Status Modifiers */}
            <div className="flex flex-wrap items-center gap-2">
              {appointment.status === 'Pending' && (
                <button
                  onClick={() => handleStatusChange('Confirmed')}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Confirm Booking
                </button>
              )}

              {appointment.status === 'Confirmed' && (
                <button
                  onClick={() => handleStatusChange('Checked In')}
                  className="px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  Mark Checked-In
                </button>
              )}

              {appointment.status === 'Checked In' && (
                <button
                  onClick={() => handleStatusChange('Completed')}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark Completed
                </button>
              )}

              {appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
                <button
                  onClick={() => handleStatusChange('No Show')}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
                >
                  Mark No-Show
                </button>
              )}

              {/* Print Slip */}
              <button
                onClick={() => {
                  setIsReprint(appointment.status === 'Completed' || appointment.status === 'Checked In');
                  setIsPrintSlipOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                {appointment.status === 'Completed' ? 'Reprint Slip' : 'Print Slip'}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Patient Panel */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-2">
                Patient Record
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{appointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{appointment.patientPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Age / Gender:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {appointment.patientAge ? `${appointment.patientAge} Years` : '—'} · {appointment.patientGender || '—'}
                </span>
              </div>
              {appointment.patientCnic && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">CNIC:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{appointment.patientCnic}</span>
                </div>
              )}
              {appointment.patientEmail && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-800 dark:text-slate-200">{appointment.patientEmail}</span>
                </div>
              )}
            </div>

            {/* Doctor & Slot Panel */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Clinical Appointment
                </h4>
                {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      setNewDate(appointment.appointmentDate);
                      setNewTime(appointment.appointmentTime);
                      setIsRescheduling(!isRescheduling);
                    }}
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {isRescheduling ? 'Cancel Reschedule' : 'Reschedule'}
                  </button>
                )}
              </div>

              {!isRescheduling ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500">Consultant:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{appointment.doctorName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{appointment.departmentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Scheduled Time:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{appointment.appointmentTime}</span>
                  </div>
                </>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Appointment Date:
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Time Slot:
                    </label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="e.g. 11:40 AM"
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <button
                    onClick={handleReschedule}
                    className="w-full py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                  >
                    Confirm Reschedule
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Panel */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Financial & Payment Status
              </h4>
              {appointment.paymentStatus !== 'Paid' && onOpenPaymentModal && (
                <button
                  onClick={() => onOpenPaymentModal(appointment)}
                  className="px-2.5 py-1 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                >
                  Record On-Site Payment
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block">Consultation Fee</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatPKR(appointment.consultationFee)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Paid Amount</span>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {formatPKR(appointment.paidAmount || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Method</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {appointment.paymentMethod || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Receipt / Ref Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {appointment.paymentReceiptNumber || appointment.paymentReference || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Reason if Cancelled */}
          {appointment.status === 'Cancelled' && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300 block mb-0.5">
                Recorded Cancellation Reason:
              </span>
              <p className="text-rose-700 dark:text-rose-400">
                {appointment.cancellationReason || 'No specific reason recorded.'}
              </p>
            </div>
          )}

          {/* Internal Notes with restricted access */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Restricted Internal Staff Notes
              </span>
              {!isEditingNotes ? (
                <button
                  onClick={() => {
                    setInternalNotes(appointment.internalNotes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Edit Note
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="text-teal-600 hover:text-teal-700 font-bold"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {!isEditingNotes ? (
              <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                {appointment.internalNotes || 'No internal notes recorded for this patient yet.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Enter internal doctor or administrative notes..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            )}
          </div>

          {/* Consequential Action: Cancel Booking */}
          {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                Cancel Appointment
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Mandatory Cancellation Reason Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={(reason) => cancelAppointment(appointment.id, reason || 'Cancelled by staff')}
        title="Cancel Patient Appointment"
        message={`Are you sure you want to cancel booking ${appointment.bookingReference} for ${appointment.patientName}? This will record in the audit trail and free up the consultation slot.`}
        confirmLabel="Confirm Cancellation"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Specify cancellation reason (e.g., patient request, doctor emergency, duplicate booking)..."
      />

      {/* Printable Slip Component */}
      <AppointmentSlip
        appointment={appointment}
        settings={settings}
        isOpen={isPrintSlipOpen}
        onClose={() => setIsPrintSlipOpen(false)}
        isReprint={isReprint}
      />
    </>
  );
};
