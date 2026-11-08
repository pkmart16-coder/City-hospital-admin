import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck2, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Users, 
  TrendingUp, 
  Banknote, 
  UserCheck, 
  XCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { formatPKR, formatDate, formatDateTime, getTodayDateString } from '../utils/formatters';
import { AppointmentDetailModal } from '../components/appointments/AppointmentDetailModal';
import { AppointmentFormModal } from '../components/appointments/AppointmentFormModal';
import { DirectPaymentModal } from '../components/finance/DirectPaymentModal';
import { Appointment } from '../types';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { 
    appointments, 
    paymentSubmissions, 
    transactions, 
    salaryRecords, 
    expenses, 
    doctors, 
    staff, 
    auditLogs 
  } = useHospital();
  const { currentUser, hasPermission } = useAuth();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [paymentTargetApt, setPaymentTargetApt] = useState<Appointment | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const todayStr = getTodayDateString();

  // Metrics calculations
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
  const pendingConfirmations = appointments.filter(a => a.status === 'Pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed');
  const checkedInPatients = appointments.filter(a => a.status === 'Checked In');
  const completedAppointments = appointments.filter(a => a.status === 'Completed');
  const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled');

  const pendingPayments = paymentSubmissions.filter(p => p.status === 'Pending Verification');
  
  // Today's collected revenue (from finalized transactions today)
  const todayRevenue = transactions
    .filter(t => t.timestamp.startsWith(todayStr) && t.status === 'Finalized')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total collected revenue all time
  const totalCollectedRevenue = transactions
    .filter(t => t.status === 'Finalized')
    .reduce((sum, t) => sum + t.amount, 0);

  // Outstanding payments across all non-cancelled appointments
  const outstandingPayments = appointments
    .filter(a => a.status !== 'Cancelled')
    .reduce((sum, a) => sum + Math.max(0, a.consultationFee - (a.paidAmount || 0)), 0);

  // Monthly salary expenditure
  const monthlySalaryExpenditure = salaryRecords
    .filter(s => s.period.includes('2026') && (s.status === 'Paid' || s.status === 'Partially Paid'))
    .reduce((sum, s) => sum + s.paidAmount, 0);

  // Unpaid/Partially paid salaries pending
  const unpaidSalaryDue = salaryRecords
    .filter(s => s.status === 'Approved' || s.status === 'Draft' || s.status === 'Partially Paid')
    .reduce((sum, s) => sum + s.remainingBalance, 0);

  // Doctors
  const activeDoctors = doctors.filter(d => d.isActive);
  const availableDoctorsToday = doctors.filter(d => d.isActive && d.isAvailableToday);
  const activeStaff = staff.filter(s => s.status === 'Active');

  const handleOpenDetail = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Operational Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-teal-400 font-semibold">
              Live Operations Control
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-mono">
              {formatDate(todayStr)}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome, {currentUser?.displayName || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Central monitoring for OPD consultations, counter cashiers, bank transfer audits, doctor clinic availability, and hospital disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasPermission('appointments.create') && (
            <button
              onClick={() => setIsBookingOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Book Appointment
            </button>
          )}

          {hasPermission('payments.verify') && pendingPayments.length > 0 && (
            <button
              onClick={() => navigate('/finance')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white rounded-lg shadow-xs transition-colors animate-pulse"
            >
              <AlertCircle className="w-4 h-4" />
              Verify Payments ({pendingPayments.length})
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Primary Appointment Indicators */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Patient Clinic & Appointment Statistics
          </h3>
          <button
            onClick={() => navigate('/appointments')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View All Appointments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title="Today's Bookings"
            value={todayAppointments.length}
            subtitle="Scheduled for today"
            icon={CalendarCheck2}
            variant="teal"
            onClick={() => navigate('/appointments')}
          />
          <StatCard
            title="Pending Requests"
            value={pendingConfirmations.length}
            subtitle="Require confirmation"
            icon={Clock}
            variant="amber"
            onClick={() => navigate('/appointments')}
          />
          <StatCard
            title="Confirmed"
            value={confirmedAppointments.length}
            subtitle="Ready for intake"
            icon={CheckCircle2}
            variant="emerald"
            onClick={() => navigate('/appointments')}
          />
          <StatCard
            title="Checked In"
            value={checkedInPatients.length}
            subtitle="In waiting lounge"
            icon={UserCheck}
            variant="teal"
            onClick={() => navigate('/appointments')}
          />
          <StatCard
            title="Completed"
            value={completedAppointments.length}
            subtitle="Consultations done"
            icon={CheckCircle2}
            variant="navy"
            onClick={() => navigate('/appointments')}
          />
          <StatCard
            title="Cancelled"
            value={cancelledAppointments.length}
            subtitle="Freed slots"
            icon={XCircle}
            variant="rose"
            onClick={() => navigate('/appointments')}
          />
        </div>
      </div>

      {/* Row 2: Financial & Revenue Summaries (PKR) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Revenue Collections & Expenditure (Pakistani Rupees)
          </h3>
          <button
            onClick={() => navigate('/finance')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            Financial Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Collections"
            value={formatPKR(todayRevenue)}
            subtitle="Direct & verified receipts"
            icon={CreditCard}
            variant="emerald"
            onClick={() => navigate('/finance')}
          />
          <StatCard
            title="Awaiting Verification"
            value={pendingPayments.length}
            subtitle={`${formatPKR(pendingPayments.reduce((s, p) => s + p.amountPaid, 0))} pending audit`}
            icon={AlertCircle}
            variant="rose"
            onClick={() => navigate('/finance')}
          />
          <StatCard
            title="Outstanding Balances"
            value={formatPKR(outstandingPayments)}
            subtitle="Unpaid consultation fees"
            icon={TrendingUp}
            variant="amber"
            onClick={() => navigate('/appointments')}
          />
          <StatCard
            title="Staff Payroll Due"
            value={formatPKR(unpaidSalaryDue)}
            subtitle="Approved vouchers unpaid"
            icon={Banknote}
            variant="teal"
            onClick={() => navigate('/payroll')}
          />
        </div>
      </div>

      {/* Row 3: Clinical & Staff Availability */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Medical Faculty & Active Workforce
          </h3>
          <button
            onClick={() => navigate('/doctors')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            Doctor Directory <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Active Doctors"
            value={activeDoctors.length}
            subtitle="On hospital roster"
            icon={Stethoscope}
            variant="navy"
            onClick={() => navigate('/doctors')}
          />
          <StatCard
            title="Available Today"
            value={availableDoctorsToday.length}
            subtitle={`${activeDoctors.length - availableDoctorsToday.length} currently on leave / surgery`}
            icon={CheckCircle2}
            variant="emerald"
            onClick={() => navigate('/doctors')}
          />
          <StatCard
            title="Active Hospital Staff"
            value={activeStaff.length}
            subtitle="Administration, nursing, accounts"
            icon={Users}
            variant="teal"
            onClick={() => navigate('/staff')}
          />
        </div>
      </div>

      {/* Row 4: Two-Column Live Activity (Upcoming Appointments vs Audit Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Patient Consultations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live appointments queue awaiting reception check-in or doctor consultation
              </p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              View All
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 font-semibold">Booking Ref</th>
                  <th className="py-2.5 font-semibold">Patient Name</th>
                  <th className="py-2.5 font-semibold">Consultant Doctor</th>
                  <th className="py-2.5 font-semibold">Time Slot</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Fee</th>
                  <th className="py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.slice(0, 5).map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                      {apt.bookingReference}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {apt.patientName}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {apt.doctorName}
                    </td>
                    <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">
                      {apt.appointmentTime}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatPKR(apt.consultationFee)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleOpenDetail(apt)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Audit Feed (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Administrative Audit Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authoritative security event log
              </p>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Full Log
            </button>
          </div>

          <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
            {auditLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">{log.module}</span>
                  <span className="font-mono">{formatDateTime(log.timestamp)}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-snug">
                  {log.details}
                </p>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>By: {log.userName}</span>
                  <span className="font-mono">{log.userRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenPaymentModal={(apt) => {
          setIsDetailOpen(false);
          setPaymentTargetApt(apt);
          setIsPaymentOpen(true);
        }}
      />

      {/* Direct Payment Modal */}
      <DirectPaymentModal
        appointment={paymentTargetApt}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* New Booking Modal */}
      <AppointmentFormModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onCreated={(id) => {
          const created = appointments.find(a => a.id === id);
          if (created) {
            setSelectedAppointment(created);
            setIsDetailOpen(true);
          }
        }}
      />
    </div>
  );
};
