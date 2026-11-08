import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PieChart, 
  Stethoscope, 
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { formatPKR, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';

export const ReportsPage: React.FC = () => {
  const { appointments, transactions, salaryRecords, expenses, doctors, departments } = useHospital();
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Appointments stats
  const totalAppointments = appointments.length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;
  const cancellationRate = totalAppointments > 0 ? ((cancelledCount / totalAppointments) * 100).toFixed(1) : '0';

  // Revenue totals
  const grossCollections = transactions.filter(t => t.status === 'Finalized').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPayroll = salaryRecords.filter(s => s.status === 'Paid').reduce((s, r) => s + r.paidAmount, 0);
  const netSurplus = grossCollections - totalExpenses - totalPayroll;

  // Doctor-wise workload
  const doctorWorkload = doctors.map(doc => {
    const docApts = appointments.filter(a => a.doctorId === doc.id);
    const revenue = docApts.filter(a => a.paymentStatus === 'Paid').reduce((s, a) => s + a.consultationFee, 0);
    return {
      doctorName: `${doc.title} ${doc.name}`,
      department: doc.departmentName,
      totalCount: docApts.length,
      revenue
    };
  });

  // Department-wise distribution
  const departmentDistribution = departments.map(dept => {
    const deptApts = appointments.filter(a => a.departmentId === dept.id);
    return {
      departmentName: dept.name,
      code: dept.code,
      count: deptApts.length
    };
  });

  const handleExportDoctorReport = () => {
    exportToCSV('doctor-workload-report', doctorWorkload, [
      { key: 'doctorName', label: 'Doctor Name' },
      { key: 'department', label: 'Department' },
      { key: 'totalCount', label: 'Total Appointments' },
      { key: 'revenue', label: 'Collected Revenue (PKR)' }
    ]);
  };

  const handleExportFinancialSummary = () => {
    exportToCSV('hospital-financial-summary', [
      { metric: 'Gross Collections', amount: grossCollections },
      { metric: 'Operating Expenses', amount: totalExpenses },
      { metric: 'Disbursed Payroll', amount: totalPayroll },
      { metric: 'Net Operating Surplus', amount: netSurplus }
    ], [
      { key: 'metric', label: 'Financial Metric' },
      { key: 'amount', label: 'Amount (PKR)' }
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Executive Hospital Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time clinical throughput, department distribution, and financial collection summaries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportFinancialSummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Financial Summary CSV
          </button>
          <button
            onClick={handleExportDoctorReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Doctor Workload CSV
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Collections</span>
          <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-1">{formatPKR(grossCollections)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Verified patient payments</p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payroll Disbursed</span>
          <h3 className="text-2xl font-bold font-mono text-teal-600 mt-1">{formatPKR(totalPayroll)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Medical & employee salaries</p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operating Expenses</span>
          <h3 className="text-2xl font-bold font-mono text-rose-600 mt-1">{formatPKR(totalExpenses)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Supplies, utilities & maintenance</p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Operating Surplus</span>
          <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{formatPKR(netSurplus)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Collections less disbursements</p>
        </div>
      </div>

      {/* Two-Column Clinical Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor-wise Workload Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Doctor Workload & Revenue Generated
              </h3>
              <p className="text-xs text-slate-500">
                Consultation count and verified collections per clinician
              </p>
            </div>
            <Stethoscope className="w-5 h-5 text-teal-600" />
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 font-semibold">Doctor Name</th>
                  <th className="py-2.5 font-semibold">Department</th>
                  <th className="py-2.5 font-semibold text-center">Consultations</th>
                  <th className="py-2.5 font-semibold text-right">Revenue (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctorWorkload.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {doc.doctorName}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {doc.department.split(' ')[0]}
                    </td>
                    <td className="py-2.5 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {doc.totalCount}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-600">
                      {formatPKR(doc.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department-wise Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Departmental Consultation Volume
              </h3>
              <p className="text-xs text-slate-500">
                Distribution of patient visits by specialty
              </p>
            </div>
            <Building2 className="w-5 h-5 text-teal-600" />
          </div>

          <div className="mt-4 space-y-3">
            {departmentDistribution.map((dept, idx) => {
              const percentage = totalAppointments > 0 ? ((dept.count / totalAppointments) * 100).toFixed(0) : '0';
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{dept.departmentName}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{dept.count} visits ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${Math.max(5, Number(percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Cancellation Rate</span>
              <span className="font-mono font-bold text-base text-rose-600">{cancellationRate}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Completed Visits</span>
              <span className="font-mono font-bold text-base text-emerald-600">{completedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
