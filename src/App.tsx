import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider } from './context/HospitalContext';
import { Layout } from './components/layout/Layout';

// Pages
import { DashboardOverview } from './pages/DashboardOverview';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { FinancePage } from './pages/FinancePage';
import { PayrollPage } from './pages/PayrollPage';
import { StaffPage } from './pages/StaffPage';
import { AttendancePage } from './pages/AttendancePage';
import { CmsPage } from './pages/CmsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { AccountsPage } from './pages/AccountsPage';
import { ReviewsPage } from './pages/ReviewsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-teal-400">Verifying Security Session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <HospitalProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />


            {/* Authenticated Console Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="inquiries" element={<InquiriesPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="cms" element={<CmsPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="audit" element={<AuditLogPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HospitalProvider>
      </AuthProvider>
    </HashRouter>
  );
}
