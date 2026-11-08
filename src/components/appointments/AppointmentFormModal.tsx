import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { Doctor, PaymentMethod, PaymentStatus, AppointmentStatus } from '../../types';
import { generateBookingRef, formatPKR, getTodayDateString } from '../../utils/formatters';
import { AlertCircle, Calendar, Clock, DollarSign, User } from 'lucide-react';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (appointmentId: string) => void;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { doctors, departments, appointments, createAppointment, recordDirectPayment } = useHospital();

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientCnic, setPatientCnic] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(getTodayDateString());
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  
  const [collectPaymentNow, setCollectPaymentNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [source, setSource] = useState<'Reception Walk-in' | 'Phone Call'>('Reception Walk-in');
  const [internalNotes, setInternalNotes] = useState('');

  const [error, setError] = useState<string>('');
  const [conflictWarning, setConflictWarning] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected doctor
  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Check for scheduling conflicts
  useEffect(() => {
    if (!selectedDoctorId || !appointmentDate || !appointmentTime) {
      setConflictWarning('');
      return;
    }

    const conflict = appointments.find(
      a =>
        a.doctorId === selectedDoctorId &&
        a.appointmentDate === appointmentDate &&
        a.appointmentTime === appointmentTime &&
        a.status !== 'Cancelled'
    );

    if (conflict) {
      setConflictWarning(
        `Conflict Warning: Dr. ${selectedDoctor?.name} already has a booking (${conflict.bookingReference}) at ${appointmentTime} on ${appointmentDate}.`
      );
    } else {
      setConflictWarning('');
    }
  }, [selectedDoctorId, appointmentDate, appointmentTime, appointments, selectedDoctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientName.trim()) {
      setError('Patient name is required.');
      return;
    }
    if (!patientPhone.trim()) {
      setError('Patient phone number is required.');
      return;
    }
    if (!selectedDoctor) {
      setError('Please select a doctor.');
      return;
    }

    try {
      setIsSubmitting(true);
      const bookingRef = generateBookingRef();
      const fee = selectedDoctor.consultationFee;

      const newId = await createAppointment({
        bookingReference: bookingRef,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || undefined,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
        patientCnic: patientCnic.trim() || undefined,
        doctorId: selectedDoctor.id,
        doctorName: `${selectedDoctor.title} ${selectedDoctor.name}`,
        departmentId: selectedDoctor.departmentId,
        departmentName: selectedDoctor.departmentName,
        appointmentDate,
        appointmentTime,
        consultationFee: fee,
        paidAmount: collectPaymentNow ? fee : 0,
        paymentStatus: collectPaymentNow ? 'Paid' : 'Unpaid',
        paymentMethod: collectPaymentNow ? paymentMethod : undefined,
        status: collectPaymentNow ? 'Confirmed' : 'Pending',
        source,
        internalNotes: internalNotes.trim() || undefined
      });

      if (collectPaymentNow) {
        await recordDirectPayment(newId, fee, paymentMethod, `Initial counter collection for ${bookingRef}`);
      }

      setIsSubmitting(false);
      onClose();
      if (onCreated) onCreated(newId);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book New Patient Appointment"
      subtitle="Create consultation booking on behalf of walk-in or calling patient"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {conflictWarning && (
          <div className="p-3 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Doctor & Schedule Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Consultant Doctor <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} {doc.name} ({doc.departmentName.split(' ')[0]}) - {formatPKR(doc.consultationFee)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Appointment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time Slot <span className="text-rose-500">*</span>
            </label>
            <select
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white font-mono"
            >
              {['09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:20 AM', '10:40 AM', '11:00 AM', '11:20 AM', '11:40 AM', '12:00 PM', '12:20 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Patient Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Patient Demographics
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Tariq Javed"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="Years"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                CNIC / National ID
              </label>
              <input
                type="text"
                value={patientCnic}
                onChange={(e) => setPatientCnic(e.target.value)}
                placeholder="61101-xxxxxxx-x"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payment & Intake Source */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              Consultation Fee: {selectedDoctor ? formatPKR(selectedDoctor.consultationFee) : '—'}
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-teal-700 dark:text-teal-400">
              <input
                type="checkbox"
                checked={collectPaymentNow}
                onChange={(e) => setCollectPaymentNow(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              Record On-site Payment Now
            </label>
          </div>

          {collectPaymentNow && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="Card">Debit / Credit Card POS</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cheque">Hospital Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Intake Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as 'Reception Walk-in' | 'Phone Call')}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                >
                  <option value="Reception Walk-in">Reception Walk-in</option>
                  <option value="Phone Call">Phone Appointment</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Internal Staff Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="e.g. Patient requested wheelchair assistance; Previous echo report attached."
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
