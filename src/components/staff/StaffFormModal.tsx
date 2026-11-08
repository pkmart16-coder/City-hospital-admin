import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { StaffMember, SalaryBasis } from '../../types';
import { generateEmployeeId } from '../../utils/formatters';

interface StaffFormModalProps {
  staffMember: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  staffMember,
  isOpen,
  onClose
}) => {
  const { saveStaff, departments } = useHospital();

  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Administration');
  const [employmentType, setEmploymentType] = useState<StaffMember['employmentType']>('Full-time');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [biography, setBiography] = useState('');
  const [status, setStatus] = useState<StaffMember['status']>('Active');
  const [salaryBasis, setSalaryBasis] = useState<SalaryBasis>('Monthly');
  const [baseSalary, setBaseSalary] = useState<number>(60000);
  const [shiftTiming, setShiftTiming] = useState('08:00 AM - 04:00 PM');
  const [isPublicVisible, setIsPublicVisible] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staffMember) {
      setEmployeeId(staffMember.employeeId);
      setName(staffMember.name);
      setDesignation(staffMember.designation);
      setDepartment(staffMember.department);
      setEmploymentType(staffMember.employmentType);
      setJoiningDate(staffMember.joiningDate);
      setPhone(staffMember.phone);
      setEmail(staffMember.email);
      setPhotoUrl(staffMember.photoUrl);
      setBiography(staffMember.biography || '');
      setStatus(staffMember.status);
      setSalaryBasis(staffMember.salaryBasis);
      setBaseSalary(staffMember.baseSalary);
      setShiftTiming(staffMember.shiftTiming);
      setIsPublicVisible(staffMember.isPublicVisible);
    } else {
      setEmployeeId(generateEmployeeId());
      setName('');
      setDesignation('');
      setDepartment(departments[0]?.name || 'Administration');
      setEmploymentType('Full-time');
      setJoiningDate(new Date().toISOString().slice(0, 10));
      setPhone('+92 300 0000000');
      setEmail('');
      setPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
      setBiography('');
      setStatus('Active');
      setSalaryBasis('Monthly');
      setBaseSalary(60000);
      setShiftTiming('08:00 AM - 04:00 PM');
      setIsPublicVisible(false);
    }
  }, [staffMember, departments, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Staff full name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveStaff({
        id: staffMember?.id,
        employeeId,
        name: name.trim(),
        designation: designation.trim(),
        department,
        employmentType,
        joiningDate,
        phone: phone.trim(),
        email: email.trim(),
        photoUrl: photoUrl.trim(),
        biography: biography.trim() || undefined,
        status,
        salaryBasis,
        baseSalary,
        shiftTiming,
        isPublicVisible
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to save staff profile');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staffMember ? `Edit Staff: ${staffMember.name}` : 'Register New Staff Member'}
      subtitle="Employment credentials, shift hours and role access records"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sohail Ahmed"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Designation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Receptionist"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 0000000"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@cityhospital.pk"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Base Salary (PKR)
            </label>
            <input
              type="number"
              min="0"
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shift Timing
            </label>
            <input
              type="text"
              value={shiftTiming}
              onChange={(e) => setShiftTiming(e.target.value)}
              placeholder="08:00 AM - 04:00 PM"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StaffMember['status'])}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Active">Active Duty</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Public Visibility Toggle */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isPublicVisible}
              onChange={(e) => setIsPublicVisible(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Enable Public Staff Profile on Hospital Website
              </span>
              <span className="text-[11px] text-slate-500 block">
                Sensitive payroll and confidential personnel records will remain strictly private.
              </span>
            </div>
          </label>
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
            {isSubmitting ? 'Saving...' : 'Save Staff Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
