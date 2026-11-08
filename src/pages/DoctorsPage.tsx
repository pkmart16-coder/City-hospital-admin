import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Eye, 
  Edit2, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { Doctor } from '../types';
import { formatPKR } from '../utils/formatters';
import { DoctorFormModal } from '../components/doctors/DoctorFormModal';
import { Modal } from '../components/common/Modal';

export const DoctorsPage: React.FC = () => {
  const { doctors, departments, toggleDoctorAvailability, saveDoctor } = useHospital();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewDoctor, setPreviewDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter((doc) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchSpec = doc.specialization.toLowerCase().includes(q);
      const matchRoom = doc.roomNumber.toLowerCase().includes(q);
      if (!matchName && !matchSpec && !matchRoom) return false;
    }
    if (departmentFilter !== 'All' && doc.departmentId !== departmentFilter) return false;
    return true;
  });

  const handleToggleActive = async (doctor: Doctor) => {
    await saveDoctor({
      ...doctor,
      isActive: !doctor.isActive
    });
  };

  const handleTogglePublic = async (doctor: Doctor) => {
    await saveDoctor({
      ...doctor,
      isPublicVisible: !doctor.isPublicVisible
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Doctor Faculty & Clinic Schedules
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage physician credentials, consultation fees in PKR, clinic room locations, and weekly OPD slots
          </p>
        </div>

        {hasPermission('doctors.manage') && (
          <button
            onClick={() => {
              setSelectedDoctor(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors by name, specialization, or room number..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Clinical Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => {
          // Status calculation for availability indicators
          // Green tick = available, Red cross = unavailable, Grey = unconfigured / inactive
          const isConfigured = doc.scheduleConfigured && doc.weeklySchedule.some(s => s.enabled);
          const isAvailable = doc.isActive && isConfigured && (doc.isAvailableToday ?? true);

          return (
            <div
              key={doc.id}
              className={`rounded-xl border bg-white dark:bg-slate-900 shadow-xs transition-all overflow-hidden flex flex-col ${
                doc.isActive 
                  ? 'border-slate-200 dark:border-slate-800 hover:border-teal-500/50' 
                  : 'border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              {/* Doctor Header Banner */}
              <div className="p-5 flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={doc.photoUrl}
                    alt={doc.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                  {/* Availability Indicator */}
                  <div 
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900 shadow-xs ${
                      !doc.isActive || !isConfigured
                        ? 'bg-slate-400'
                        : isAvailable
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                    title={
                      !doc.isActive 
                        ? 'Account Inactive' 
                        : !isConfigured 
                        ? 'Schedule Unconfigured' 
                        : isAvailable 
                        ? 'Available for Appointments Today' 
                        : 'Unavailable Today (On Leave or Theatre)'
                    }
                  >
                    {!doc.isActive || !isConfigured ? (
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    ) : isAvailable ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <X className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 truncate">
                      {doc.departmentName}
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {formatPKR(doc.consultationFee)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {doc.title} {doc.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                    {doc.specialization}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {doc.qualifications}
                  </p>
                </div>
              </div>

              {/* Meta Stats Details */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-b border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Room:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {doc.roomNumber || 'OPD Desk'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Slot Duration:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {doc.slotDurationMinutes} mins / patient
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Working Days:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {doc.weeklySchedule.filter(s => s.enabled).length} days / week
                  </span>
                </div>
              </div>

              {/* Quick Availability & Public Visibility Controls */}
              <div className="p-3 px-5 flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDoctorAvailability(doc.id, !doc.isAvailableToday)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                      doc.isAvailableToday
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    {doc.isAvailableToday ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Available Today
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-600" /> Marked Unavailable
                      </>
                    )}
                  </button>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={doc.isPublicVisible}
                    onChange={() => handleTogglePublic(doc)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Website Visible</span>
                </label>
              </div>

              {/* Actions Footer */}
              <div className="p-3 px-5 mt-auto flex items-center justify-between bg-white dark:bg-slate-900">
                <button
                  onClick={() => setPreviewDoctor(doc)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Public Preview
                </button>

                {hasPermission('doctors.manage') && (
                  <button
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setIsFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Doctor
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Doctor Add / Edit Form Modal */}
      <DoctorFormModal
        doctor={selectedDoctor}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Public Profile Preview Modal */}
      {previewDoctor && (
        <Modal
          isOpen={!!previewDoctor}
          onClose={() => setPreviewDoctor(null)}
          title={`Public Profile Preview: ${previewDoctor.title} ${previewDoctor.name}`}
          subtitle="This is how this physician appears to patients on the public hospital website"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start gap-5">
              <img
                src={previewDoctor.photoUrl}
                alt={previewDoctor.name}
                className="w-24 h-24 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-md shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
                  {previewDoctor.departmentName}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {previewDoctor.title} {previewDoctor.name}
                </h3>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {previewDoctor.specialization} · {previewDoctor.qualifications}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {previewDoctor.experienceYears} Years Clinical Experience · {previewDoctor.roomNumber}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-teal-600 text-white font-mono font-bold text-xs rounded-md shadow-xs">
                    Consultation Fee: {formatPKR(previewDoctor.consultationFee)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                Doctor Biography
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                {previewDoctor.biography || 'No clinical biography provided.'}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                Active Weekly Clinic Timings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {previewDoctor.weeklySchedule.filter(s => s.enabled).map(d => (
                  <div key={d.day} className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-white block">{d.day}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {d.slots.map(s => `${s.startTime} - ${s.endTime}`).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewDoctor(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
