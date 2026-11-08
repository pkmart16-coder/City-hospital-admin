import React, { useState } from 'react';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Database,
  ExternalLink
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { HospitalSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, seedDatabase, isSyncing } = useHospital();
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState<HospitalSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSeed = async () => {
    await seedDatabase();
    setSeedSuccess(true);
    setTimeout(() => setSeedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Hospital Settings, Bank Configuration & Policies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Global hospital identity, Meezan Bank verification parameters and booking cancellation rules
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
        >
          <Save className="w-4 h-4" />
          {saveSuccess ? 'Changes Saved!' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hospital Profile */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            Hospital Identity & Branding
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hospital Full Name
              </label>
              <input
                type="text"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hospital Tagline / Motto
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Main Telephone Desk
              </label>
              <input
                type="text"
                value={formData.mainPhone}
                onChange={(e) => setFormData({ ...formData, mainPhone: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Hotline (24/7)
              </label>
              <input
                type="text"
                value={formData.emergencyHotline}
                onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Complex Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Bank Transfer Parameters */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-600" />
            Hospital Bank Account Details (Displayed to Public for IBFT Submissions)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Title
              </label>
              <input
                type="text"
                value={formData.bankDetails.accountTitle}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, accountTitle: e.target.value }
                })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                })}
                className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                IBAN
              </label>
              <input
                type="text"
                value={formData.bankDetails.iban}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, iban: e.target.value }
                })}
                className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Patient Transfer Instructions
            </label>
            <textarea
              rows={2}
              value={formData.bankDetails.instructions}
              onChange={(e) => setFormData({
                ...formData,
                bankDetails: { ...formData.bankDetails, instructions: e.target.value }
              })}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Operating Hours & Policies */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Hospital Policies & Booking Windows
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Booking Window (Days Ahead)
              </label>
              <input
                type="number"
                value={formData.policies.appointmentBookingWindowDays}
                onChange={(e) => setFormData({
                  ...formData,
                  policies: { ...formData.policies, appointmentBookingWindowDays: Number(e.target.value) }
                })}
                className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cancellation Notice Window (Hours)
              </label>
              <input
                type="number"
                value={formData.policies.cancellationNoticeHours}
                onChange={(e) => setFormData({
                  ...formData,
                  policies: { ...formData.policies, cancellationNoticeHours: Number(e.target.value) }
                })}
                className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Verification Grace (Hours)
              </label>
              <input
                type="number"
                value={formData.policies.paymentVerificationGracePeriodHours}
                onChange={(e) => setFormData({
                  ...formData,
                  policies: { ...formData.policies, paymentVerificationGracePeriodHours: Number(e.target.value) }
                })}
                className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Database Sync / Re-seed Tool */}
        <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Initial Database Seed & Synchronize
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sync complete clinical departments, real doctor profiles, Pakistani rupee fees, and initial appointment records to Firestore
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeed}
            disabled={isSyncing}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            {seedSuccess ? 'Synchronized!' : isSyncing ? 'Writing...' : 'Synchronize Now'}
          </button>
        </div>
      </form>
    </div>
  );
};
