import React, { useState } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { getTodayDateString, formatDate } from '../utils/formatters';

export const AttendancePage: React.FC = () => {
  const { staff, departments } = useHospital();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Simple state for today's roster check-in statuses
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'Present' | 'Absent' | 'On Leave' | 'Half Day'; time?: string }>>(() => {
    return {
      'staff-01': { status: 'Present', time: '07:55 AM' },
      'staff-02': { status: 'Present', time: '08:45 AM' },
      'staff-03': { status: 'Present', time: '08:50 AM' },
      'staff-04': { status: 'Present', time: '07:20 AM' },
    };
  });

  const toggleAttendance = (staffId: string, newStatus: 'Present' | 'Absent' | 'On Leave' | 'Half Day') => {
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: {
        status: newStatus,
        time: newStatus === 'Present' ? '08:30 AM' : undefined
      }
    }));
  };

  const filteredStaff = staff.filter(s => {
    if (departmentFilter !== 'All' && s.department !== departmentFilter) return false;
    return true;
  });

  const presentCount = Object.values(attendanceMap).filter(v => v.status === 'Present').length;
  const onLeaveCount = Object.values(attendanceMap).filter(v => v.status === 'On Leave').length;
  const absentCount = Object.values(attendanceMap).filter(v => v.status === 'Absent').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Staff Availability, Roster & Daily Attendance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor duty attendance, shift schedules and staff availability across departments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* Roster Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-slate-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
          <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{staff.length} Employees</h3>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Present On Duty</span>
          <h3 className="text-xl font-bold font-mono text-emerald-600 mt-1">{presentCount} Staff</h3>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved Leave</span>
          <h3 className="text-xl font-bold font-mono text-amber-600 mt-1">{onLeaveCount} Staff</h3>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-rose-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Absent / Unscheduled</span>
          <h3 className="text-xl font-bold font-mono text-rose-600 mt-1">{absentCount} Staff</h3>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-white">
            Daily Attendance Register · {formatDate(selectedDate)}
          </span>

          <div className="w-56">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-4 font-semibold">Employee</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Shift Hours</th>
                <th className="py-3 px-4 font-semibold">Check-In Log</th>
                <th className="py-3 px-4 font-semibold">Status Indicator</th>
                <th className="py-3 px-4 font-semibold text-right">Roster Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStaff.map((s) => {
                const att = attendanceMap[s.id] || { status: 'Present', time: '08:00 AM' };
                const isPresent = att.status === 'Present';

                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={s.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.employeeId} · {s.designation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {s.department}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {s.shiftTiming}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {att.time ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{att.time}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                        att.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : att.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {att.status === 'Present' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                        )}
                        <span>{att.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleAttendance(s.id, 'Present')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded ${att.status === 'Present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => toggleAttendance(s.id, 'On Leave')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded ${att.status === 'On Leave' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          Leave
                        </button>
                        <button
                          onClick={() => toggleAttendance(s.id, 'Absent')}
                          className={`px-2 py-1 text-[11px] font-semibold rounded ${att.status === 'Absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
