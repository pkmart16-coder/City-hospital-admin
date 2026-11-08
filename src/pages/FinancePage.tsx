import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Plus, 
  Download, 
  Search, 
  DollarSign, 
  Receipt, 
  Clock, 
  Building
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { PaymentSubmission, PaymentTransaction, ExpenseRecord } from '../types';
import { formatPKR, formatDate, formatDateTime } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { PaymentVerifyModal } from '../components/finance/PaymentVerifyModal';
import { ExpenseModal } from '../components/finance/ExpenseModal';
import { StatusBadge } from '../components/common/Badge';

export const FinancePage: React.FC = () => {
  const { 
    paymentSubmissions, 
    transactions, 
    expenses, 
    appointments 
  } = useHospital();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'verifications' | 'ledger' | 'expenses'>('verifications');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Financial aggregates
  const pendingSubmissions = paymentSubmissions.filter(p => p.status === 'Pending Verification');
  const totalVerifiedReceipts = transactions.filter(t => t.status === 'Finalized').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netOperatingBalance = totalVerifiedReceipts - totalExpenses;

  const handleExportTransactions = () => {
    exportToCSV('hospital-payment-ledger', transactions, [
      { key: 'receiptNumber', label: 'Receipt #' },
      { key: 'bookingReference', label: 'Booking Ref' },
      { key: 'patientName', label: 'Patient Name' },
      { key: 'amount', label: 'Amount (PKR)' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'type', label: 'Type' },
      { key: 'recordedByName', label: 'Collected By' },
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'status', label: 'Status' }
    ]);
  };

  const handleExportExpenses = () => {
    exportToCSV('hospital-expenses-ledger', expenses, [
      { key: 'voucherNumber', label: 'Voucher #' },
      { key: 'category', label: 'Category' },
      { key: 'payee', label: 'Vendor / Payee' },
      { key: 'amount', label: 'Amount (PKR)' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'approvedBy', label: 'Authorized By' },
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description' }
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Finance, Payment Verification & Accounting
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit online bank transfers, manage receipt ledgers, and track hospital operating expenses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'ledger' && (
            <button
              onClick={handleExportTransactions}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Receipts CSV
            </button>
          )}

          {activeTab === 'expenses' && (
            <>
              <button
                onClick={handleExportExpenses}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Expenses CSV
              </button>
              <button
                onClick={() => setIsExpenseOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Record Expense
              </button>
            </>
          )}
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-teal-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collections</span>
          <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatPKR(totalVerifiedReceipts)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{transactions.length} issued receipts</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-rose-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Awaiting Verification</span>
          <h3 className="text-xl font-bold font-mono text-rose-600 mt-1">
            {pendingSubmissions.length} Submissions
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatPKR(pendingSubmissions.reduce((s, p) => s + p.amountPaid, 0))} unverified
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital Expenses</span>
          <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatPKR(totalExpenses)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{expenses.length} expense vouchers</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Operating Surplus</span>
          <h3 className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {formatPKR(netOperatingBalance)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Collections minus expenses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'verifications'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Bank Transfer Verifications</span>
          {pendingSubmissions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {pendingSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'ledger'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Official Payment Receipts Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'expenses'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Hospital Operational Expenses</span>
        </button>
      </div>

      {/* Tab 1: Bank Transfer Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Online Bank Transfer Submission Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient IBFT payments awaiting staff verification before booking confirmation
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4 font-semibold">Booking Ref</th>
                  <th className="py-3 px-4 font-semibold">Patient / Guardian</th>
                  <th className="py-3 px-4 font-semibold">Doctor</th>
                  <th className="py-3 px-4 font-semibold">Transfer Bank</th>
                  <th className="py-3 px-4 font-semibold">Transaction Ref</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paymentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No payment submissions in verification queue.
                    </td>
                  </tr>
                ) : (
                  paymentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {sub.bookingReference}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{sub.patientName}</p>
                        <p className="text-[10px] text-slate-400">{sub.patientPhone}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {sub.doctorName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {sub.bankName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                        {sub.transactionReference}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatPKR(sub.amountPaid)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sub.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setIsVerifyOpen(true);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            sub.status === 'Pending Verification'
                              ? 'bg-teal-600 hover:bg-teal-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {sub.status === 'Pending Verification' ? 'Inspect & Audit' : 'View Audit'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Receipts Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4 font-semibold">Receipt #</th>
                  <th className="py-3 px-4 font-semibold">Booking Ref</th>
                  <th className="py-3 px-4 font-semibold">Patient Name</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Collected By</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {txn.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {txn.bookingReference || '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {txn.patientName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {txn.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {txn.recordedByName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {formatDateTime(txn.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {formatPKR(txn.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Operating Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4 font-semibold">Voucher #</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Vendor / Payee</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Authorized By</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {exp.voucherNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {exp.category}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {exp.payee}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {exp.approvedBy}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {formatPKR(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Audit Modal */}
      <PaymentVerifyModal
        submission={selectedSubmission}
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
      />
    </div>
  );
};
