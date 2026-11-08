import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building, 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickFill = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Hospital@2026!');
    setLoading(true);
    const res = await login(roleEmail, 'Hospital@2026!');
    setLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 font-bold mb-4 shadow-lg shadow-teal-500/20">
          <Building className="w-8 h-8 text-slate-950" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          City Hospital & Medical Centre
        </h2>
        <p className="mt-1 text-xs text-teal-400 font-mono uppercase tracking-wider font-semibold">
          Authorized Administrative Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl border border-slate-700/80 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 text-xs bg-rose-950/60 text-rose-300 border border-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hospital Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cityhospital.pk"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Staff Sign-In Shortcut Buttons */}
          <div className="pt-4 border-t border-slate-700/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick Role Authentication
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@cityhospital.pk')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors truncate"
              >
                <span className="font-bold text-teal-400 block truncate">Super Admin</span>
                <span className="text-[10px] text-slate-400 truncate">admin@cityhospital.pk</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('reception@cityhospital.pk')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors truncate"
              >
                <span className="font-bold text-white block truncate">Receptionist</span>
                <span className="text-[10px] text-slate-400 truncate">reception@cityhospital.pk</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('doctor@cityhospital.pk')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors truncate"
              >
                <span className="font-bold text-white block truncate">Doctor</span>
                <span className="text-[10px] text-slate-400 truncate">doctor@cityhospital.pk</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('accountant@cityhospital.pk')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left transition-colors truncate"
              >
                <span className="font-bold text-white block truncate">Accountant</span>
                <span className="text-[10px] text-slate-400 truncate">accountant@cityhospital.pk</span>
              </button>
            </div>
          </div>

          {/* First Super Admin bootstrap link */}
          <div className="pt-2 text-center text-[11px] text-slate-400">
            Initial deployment?{' '}
            <Link to="/bootstrap-admin" className="text-teal-400 hover:underline font-semibold">
              Initialize First Super Admin
            </Link>
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-[11px] text-slate-500 mt-6 font-mono">
          Protected by Firebase Auth · Connected to city-hospital-f534f
        </p>
      </div>
    </div>
  );
};
