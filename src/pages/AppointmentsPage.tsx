import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Printer, 
  Calendar, 
  RotateCcw,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { Appointment, AppointmentStatus, PaymentStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { formatPKR, formatDate, formatDateTime } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { AppointmentDetailModal } from '../components/appointments/AppointmentDetailModal';
import { AppointmentFormModal } from '../components/appointments/AppointmentFormModal';
import { AppointmentSlip } from '../components/print/AppointmentSlip';
import { DirectPaymentModal } from '../components/finance/DirectPaymentModal';

export const AppointmentsPage: React.FC = () => {
  const { appointments, doctors, departments, settings } = useHospital();
  const { hasPermission, currentUser } = useAuth();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [slipAppointment, setSlipAppointment] = useState<Appointment | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null);

  // If role is doctor, restrict to only their assigned appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Role doctor restriction
      if (currentUser?.role === 'doctor' && currentUser.doctorId) {
        if (apt.doctorId !== currentUser.doctorId) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesRef = apt.bookingReference.toLowerCase().includes(query);
        const matchesName = apt.patientName.toLowerCase().includes(query);
        const matchesPhone = apt.patientPhone.toLowerCase().includes(query);
        const matchesCnic = apt.patientCnic?.toLowerCase().includes(query);
        if (!matchesRef && !matchesName && !matchesPhone && !matchesCnic) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'All' && apt.status !== statusFilter) return false;

      // Payment Status
      if (paymentFilter !== 'All' && apt.paymentStatus !== paymentFilter) return false;

      // Doctor
      if (doctorFilter !== 'All' && apt.doctorId !== doctorFilter) return false;

      // Department
      if (departmentFilter !== 'All' && apt.departmentId !== departmentFilter) return false;

      // Date Range
      if (startDate && apt.appointmentDate < startDate) return false;
      if (endDate && apt.appointmentDate > endDate) return false;

      return true;
    });
  }, [appointments, currentUser, searchTerm, statusFilter, paymentFilter, doctorFilter, departmentFilter, startDate, endDate]);

  const handleExportCSV = () => {
    exportToCSV('city-hospital-appointments', filteredAppointments, [
      { key: 'bookingReference', label: 'Booking Ref' },
      { key: 'patientName', label: 'Patient Name' },
      { key: 'patientPhone', label: 'Phone' },
      { key: 'doctorName', label: 'Doctor' },
      { key: 'departmentName', label: 'Department' },
      { key: 'appointmentDate', label: 'Date' },
      { key: 'appointmentTime', label: 'Time' },
      { key: 'consultationFee', label: 'Fee (PKR)' },
      { key: 'paidAmount', label: 'Paid Amount' },
      { key: 'paymentStatus', label: 'Payment Status' },
      { key: 'status', label: 'Visit Status' },
      { key: 'source', label: 'Intake Source' }
    ]);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setDoctorFilter('All');
    setDepartmentFilter('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Appointment Management & Registration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, filter, schedule, check-in patients and generate official appointment slips
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {hasPermission('reports.read') && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}

          {hasPermission('appointments.create') && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Booking Ref (e.g. CH-2026), Patient Name, Phone or CNIC..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Visit Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Rejected">Rejected</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Doctors, Departments, Date Ranges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            >
              <option value="All">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.title} {d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From Date"
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To Date"
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Ref #</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Consultant Doctor</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Date & Slot</th>
                <th className="py-3 px-4 font-semibold">Payment Status</th>
                <th className="py-3 px-4 font-semibold">Visit Status</th>
                <th className="py-3 px-4 font-semibold text-right">Fee (PKR)</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No appointments matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr 
                    key={apt.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setIsDetailOpen(true);
                    }}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {apt.bookingReference}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{apt.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{apt.patientPhone}</p>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {apt.doctorName}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {apt.departmentName}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{formatDate(apt.appointmentDate)}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{apt.appointmentTime}</p>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={apt.paymentStatus} size="sm" />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatPKR(apt.consultationFee)}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSlipAppointment(apt);
                            setIsSlipOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                          title="Print appointment slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600 hover:text-teal-700 transition-colors"
                          title="View appointment details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Showing {filteredAppointments.length} of {appointments.length} total bookings</span>
          <span>PKR Total Expected: {formatPKR(filteredAppointments.reduce((s, a) => s + a.consultationFee, 0))}</span>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenPaymentModal={(apt) => {
          setIsDetailOpen(false);
          setPaymentAppointment(apt);
          setIsPaymentOpen(true);
        }}
      />

      {/* Appointment Booking Modal */}
      <AppointmentFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(id) => {
          const created = appointments.find(a => a.id === id);
          if (created) {
            setSelectedAppointment(created);
            setIsDetailOpen(true);
          }
        }}
      />

      {/* Direct Payment Modal */}
      <DirectPaymentModal
        appointment={paymentAppointment}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* Printable Slip Modal */}
      {slipAppointment && (
        <AppointmentSlip
          appointment={slipAppointment}
          settings={settings}
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
        />
      )}
    </div>
  );
};
