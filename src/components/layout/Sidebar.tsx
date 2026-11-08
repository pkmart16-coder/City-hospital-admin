import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Stethoscope, 
  CreditCard, 
  Banknote, 
  Users, 
  Clock, 
  Image as ImageIcon, 
  Building2, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  MessageSquare,
  KeyRound,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { hasPermission, currentUser } = useAuth();
  const { appointments, paymentSubmissions, salaryRecords, settings, inquiries } = useHospital();
  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;

  const pendingAppointmentsCount = appointments.filter(a => a.status === 'Pending').length;
  const pendingPaymentsCount = paymentSubmissions.filter(p => p.status === 'Pending Verification').length;
  const unpaidSalaryCount = salaryRecords.filter(s => s.status === 'Approved' || s.status === 'Draft').length;

  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
      allowed: true
    },
    {
      to: '/appointments',
      label: 'Appointments',
      icon: CalendarCheck2,
      badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : undefined,
      badgeColor: 'bg-amber-500',
      allowed: hasPermission('appointments.read')
    },
    {
      to: '/inquiries',
      label: 'Website Questions',
      icon: MessageSquare,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
      badgeColor: 'bg-sky-500',
      allowed: hasPermission('appointments.read')
    },
    {
      to: '/doctors',
      label: 'Doctors & Schedules',
      icon: Stethoscope,
      allowed: hasPermission('doctors.manage') || currentUser?.role === 'doctor'
    },
    {
      to: '/finance',
      label: 'Finance & Payments',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
      badgeColor: 'bg-rose-500',
      allowed: hasPermission('payments.verify')
    },
    {
      to: '/payroll',
      label: 'Staff Payroll',
      icon: Banknote,
      badge: unpaidSalaryCount > 0 ? unpaidSalaryCount : undefined,
      badgeColor: 'bg-teal-500',
      allowed: hasPermission('payroll.read')
    },
    {
      to: '/reviews',
      label: 'Patient Reviews',
      icon: Star,
      allowed: hasPermission('banners.manage')
    },
    {
      to: '/accounts',
      label: 'Login Accounts',
      icon: KeyRound,
      allowed: hasPermission('users.manage')
    },
    {
      to: '/staff',
      label: 'Staff & Roles',
      icon: Users,
      allowed: hasPermission('staff.manage') || hasPermission('users.manage')
    },
    {
      to: '/attendance',
      label: 'Attendance & Roster',
      icon: Clock,
      allowed: true
    },
    {
      to: '/cms',
      label: 'Website CMS & Banners',
      icon: ImageIcon,
      allowed: hasPermission('banners.manage')
    },
    {
      to: '/departments',
      label: 'Departments & Services',
      icon: Building2,
      allowed: true
    },
    {
      to: '/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      allowed: hasPermission('reports.read')
    },
    {
      to: '/audit',
      label: 'Security & Audit Logs',
      icon: ShieldAlert,
      allowed: currentUser?.role === 'super_admin' || currentUser?.role === 'hospital_admin'
    },
    {
      to: '/settings',
      label: 'Hospital Settings',
      icon: Settings,
      allowed: hasPermission('settings.manage')
    }
  ];

  return (
    <aside 
      className={`relative z-20 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-200 select-none print:hidden ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-500 text-slate-950 font-bold shrink-0 shadow-sm">
            <Building className="w-5 h-5 text-slate-950" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight truncate">
              <span className="font-bold text-white text-sm tracking-wide block truncate">
                {settings.hospitalName.split(' ')[0]} {settings.hospitalName.split(' ')[1] || 'Hospital'}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-teal-400 font-semibold block">
                Admin Management
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems
          .filter(item => item.allowed)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {item.badge !== undefined && (
                      <span 
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          isActive 
                            ? 'bg-slate-950 text-white' 
                            : `${item.badgeColor || 'bg-teal-500'} text-white`
                        } ${isCollapsed ? 'absolute top-1 right-1' : ''}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="truncate">
              <p className="text-[11px] font-semibold text-slate-200 truncate">Firebase Connected</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">city-hospital-f534f</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Firebase Connected">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
