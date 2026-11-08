import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  Edit2, 
  UserPlus, 
  KeyRound,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { StaffMember } from '../types';
import { formatPKR, formatDate } from '../utils/formatters';
import { StaffFormModal } from '../components/staff/StaffFormModal';
import { StatusBadge } from '../components/common/Badge';

export const StaffPage: React.FC = () => {
  const { staff, departments } = useHospital();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredStaff = staff.filter((s) => {
    if (departmentFilter !== 'All' && s.department !== departmentFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = s.employeeId.toLowerCase().includes(q);
      const matchDesig = s.designation.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDesig) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Staff Directory & Personnel Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage hospital employees, department assignments, shift timings, and public website profiles
          </p>
        </div>

        {hasPermission('staff.manage') && (
          <button
            onClick={() => {
              setSelectedStaff(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
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
            placeholder="Search by Employee ID, Name or Designation..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="p-5 flex items-start gap-4">
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-teal-600 dark:text-teal-400">
                    {member.employeeId}
                  </span>
                  <StatusBadge status={member.status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {member.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {member.designation}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {member.department}
                </p>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-b border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Shift:
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{member.shiftTiming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined:
                </span>
                <span className="text-slate-800 dark:text-slate-200">{formatDate(member.joiningDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:
                </span>
                <span className="text-slate-800 dark:text-slate-200">{member.phone}</span>
              </div>
            </div>

            <div className="p-3 px-5 mt-auto flex items-center justify-between text-xs bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                {member.isPublicVisible ? (
                  <>
                    <Eye className="w-3 h-3 text-emerald-600" /> Public Profile Active
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-slate-400" /> Private Profile
                  </>
                )}
              </span>

              {hasPermission('staff.manage') && (
                <button
                  onClick={() => {
                    setSelectedStaff(member);
                    setIsFormOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        staffMember={selectedStaff}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};
