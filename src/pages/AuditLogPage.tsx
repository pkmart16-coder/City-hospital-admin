import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  User, 
  ShieldCheck
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { formatDateTime } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const filteredLogs = auditLogs.filter((log) => {
    if (moduleFilter !== 'All' && log.module !== moduleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchUser = log.userName.toLowerCase().includes(q);
      const matchEmail = log.userEmail.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      if (!matchAction && !matchUser && !matchEmail && !matchDetails) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    exportToCSV('hospital-security-audit-log', filteredLogs, [
      { key: 'timestamp', label: 'Timestamp (ISO)' },
      { key: 'userEmail', label: 'User Email' },
      { key: 'userName', label: 'Staff Name' },
      { key: 'userRole', label: 'Role' },
      { key: 'module', label: 'Module' },
      { key: 'action', label: 'Action Performed' },
      { key: 'targetId', label: 'Target Reference' },
      { key: 'details', label: 'Details' }
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Administrative Audit Trail & Security Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable tracking of financial approvals, appointment status changes, payroll disbursements and user access
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit events by action, staff email or details..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Security Modules</option>
            <option value="Appointments">Appointments</option>
            <option value="Doctors">Doctors</option>
            <option value="Payments">Payments & Finance</option>
            <option value="Payroll">Payroll</option>
            <option value="Staff">Staff</option>
            <option value="Settings">Settings</option>
            <option value="CMS">CMS</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Module</th>
                <th className="py-3 px-4 font-semibold">Action Performed</th>
                <th className="py-3 px-4 font-semibold">Details</th>
                <th className="py-3 px-4 font-semibold">Authorized Staff</th>
                <th className="py-3 px-4 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit records matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider text-[10px]">
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                      {log.details}
                      {log.targetId && (
                        <span className="ml-1 font-mono text-[10px] text-slate-400">
                          (Ref: {log.targetId})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{log.userName}</p>
                      <p className="text-[10px] text-slate-400">{log.userEmail}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.userRole}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
