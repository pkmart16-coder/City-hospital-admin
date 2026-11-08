import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  RefreshCw, 
  Database, 
  Moon, 
  Sun,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { RoleType } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export const Header: React.FC = () => {
  const { currentUser, logout, switchRolePreview } = useAuth();
  const { notifications, markNotificationRead, seedDatabase, isSyncing } = useHospital();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSeed = async () => {
    await seedDatabase();
    setSeedSuccess(true);
    setTimeout(() => setSeedSuccess(false), 3000);
  };

  const roles: RoleType[] = [
    'super_admin',
    'hospital_admin',
    'receptionist',
    'doctor',
    'accountant',
    'hr_manager'
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors print:hidden shadow-xs">
      {/* Left Area: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Administrative Management Console
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sync / Seed Database Quick Button */}
        <button
          onClick={handleSeed}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          title="Seed / Sync initial Firestore data for City Hospital"
        >
          {seedSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
          )}
          <span>{seedSuccess ? 'Database Synced!' : isSyncing ? 'Syncing...' : 'Sync Data'}</span>
        </button>

        {/* Role Switcher Dropdown (Essential for testing all role capabilities) */}
        <div className="relative">
          <button
            onClick={() => undefined}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
            title="Your role"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Role: {currentUser ? ROLE_LABELS[currentUser.role] : 'Guest'}</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role Preview
                </p>
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchRolePreview(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentUser?.role === r
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{ROLE_LABELS[r]}</span>
                  {currentUser?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  Notifications ({unreadCount})
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        !notif.isRead ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-slate-800 dark:text-white">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDateTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge & Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block leading-tight text-left">
              <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                {currentUser?.displayName || 'Administrator'}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {currentUser?.email || 'admin@cityhospital.pk'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
