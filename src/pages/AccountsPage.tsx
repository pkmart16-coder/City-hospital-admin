import React, { useEffect, useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { KeyRound, UserPlus } from 'lucide-react';
import { auth, db, firebaseConfig } from '../config/firebase';
import { useHospital } from '../context/HospitalContext';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { RoleType, UserProfile } from '../types';

const ASSIGNABLE: RoleType[] = ['hospital_admin', 'receptionist', 'doctor', 'accountant', 'hr_manager'];

const makeTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(14));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('') + '!7';
};

export const AccountsPage: React.FC = () => {
  const { doctors } = useHospital();
  const { currentUser, hasPermission } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleType>('receptionist');
  const [doctorId, setDoctorId] = useState('');
  const [department, setDepartment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    return onSnapshot(
      collection(db, 'userProfiles'),
      (snap) => {
        const list: UserProfile[] = [];
        snap.forEach((d) => list.push(d.data() as UserProfile));
        list.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
        setProfiles(list);
      },
      () => setError('Could not load accounts. Only a Super Admin can view this list.')
    );
  }, []);

  if (!hasPermission('users.manage')) {
    return <p className="text-sm text-slate-500">You do not have permission to manage login accounts.</p>;
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setNotice('');

    const cleanEmail = email.trim().toLowerCase();
    if (name.trim().length < 3) return setError('Please enter the full name.');
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError('Please enter a valid email address.');
    if (role === 'doctor' && !doctorId) return setError('Choose which doctor profile this login belongs to.');

    setBusy(true);
    const password = makeTempPassword();
    // A second, temporary Firebase app so the Super Admin stays signed in on the main one
    const secondary = initializeApp(firebaseConfig, `account-create-${Date.now()}`);
    try {
      const cred = await createUserWithEmailAndPassword(getAuth(secondary), cleanEmail, password);
      await updateProfile(cred.user, { displayName: name.trim() });
      const uid = cred.user.uid;
      await signOut(getAuth(secondary));

      const profile: UserProfile = {
        uid,
        email: cleanEmail,
        displayName: name.trim(),
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        ...(department.trim() ? { department: department.trim() } : {}),
        ...(role === 'doctor' ? { doctorId } : {})
      };
      await setDoc(doc(db, 'userProfiles', uid), profile);

      let mailed = true;
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch {
        mailed = false;
      }
      setNotice(
        `Account created for ${cleanEmail} (${ROLE_LABELS[role]}). ` +
          (mailed
            ? 'A "set your password" email was sent (check spam). '
            : 'The password email could not be sent. ') +
          `Temporary password (shown once, give it privately): ${password}`
      );
      setName('');
      setEmail('');
      setDoctorId('');
      setDepartment('');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/email-already-in-use') setError('This email already has a login account.');
      else if (code === 'auth/invalid-email') setError('This email address is not valid.');
      else if (code === 'permission-denied') setError('The account was created but its profile could not be saved. Check Firestore rules.');
      else setError('Could not create the account. Please try again.');
    } finally {
      await deleteApp(secondary).catch(() => undefined);
      setBusy(false);
    }
  };

  const toggle = async (p: UserProfile) => {
    setError('');
    try {
      await updateDoc(doc(db, 'userProfiles', p.uid), { status: p.status === 'active' ? 'suspended' : 'active' });
    } catch {
      setError('Could not change this account.');
    }
  };

  const resetMail = async (p: UserProfile) => {
    setError('');
    setNotice('');
    try {
      await sendPasswordResetEmail(auth, p.email);
      setNotice(`Password reset email sent to ${p.email}.`);
    } catch {
      setError('Could not send the reset email.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-teal-500" /> Login Accounts
        </h1>
        <p className="text-xs text-slate-500">
          Create sign-in accounts for doctors, receptionists, accountants and other staff. Each person sets their own password from an email link.
        </p>
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
      {notice && <p className="text-xs text-emerald-700 dark:text-emerald-400 break-all">{notice}</p>}

      <form onSubmit={create} className="grid md:grid-cols-2 gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Full name *
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2" />
        </label>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Email *
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2" />
        </label>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Role *
          <select value={role} onChange={(e) => setRole(e.target.value as RoleType)} className="mt-1 w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
            {ASSIGNABLE.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </label>
        {role === 'doctor' ? (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Doctor profile * (add the doctor in "Doctors & Schedules" first)
            <select
              value={doctorId}
              onChange={(e) => {
                setDoctorId(e.target.value);
                const d = doctors.find((x) => x.id === e.target.value);
                if (d && !name) setName(`${d.title} ${d.name}`.trim());
              }}
              className="mt-1 w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.title} {d.name}</option>)}
            </select>
          </label>
        ) : (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Department (optional)
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2" />
          </label>
        )}
        <div className="md:col-span-2">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg">
            <UserPlus className="w-4 h-4" /> {busy ? 'Creating...' : 'Create login account'}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
        {profiles.length === 0 && <p className="p-4 text-sm text-slate-500">No accounts yet.</p>}
        {profiles.map((p) => (
          <div key={p.uid} className="p-3 flex items-center justify-between gap-3 flex-wrap text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{p.displayName}</p>
              <p className="text-slate-500">{p.email} · {ROLE_LABELS[p.role] || p.role}{p.doctorId ? ` · doctor: ${p.doctorId}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={p.status === 'active' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{p.status}</span>
              <button onClick={() => resetMail(p)} className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200">Send password email</button>
              <button
                onClick={() => toggle(p)}
                disabled={p.uid === currentUser?.uid}
                title={p.uid === currentUser?.uid ? 'You cannot suspend your own account' : ''}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                {p.status === 'active' ? 'Suspend' : 'Re-activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};