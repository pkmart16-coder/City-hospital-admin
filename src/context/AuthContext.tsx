import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, RoleType, Permission } from '../types';

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  super_admin: [
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'doctors.manage',
    'staff.manage',
    'payments.verify',
    'payroll.read',
    'payroll.manage',
    'banners.manage',
    'users.manage',
    'reports.read',
    'settings.manage',
  ],
  hospital_admin: [
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'doctors.manage',
    'staff.manage',
    'banners.manage',
    'reports.read',
  ],
  receptionist: [
    'appointments.read',
    'appointments.create',
    'appointments.update',
  ],
  doctor: [
    'appointments.read',
    'appointments.update',
  ],
  accountant: [
    'appointments.read',
    'payments.verify',
    'payroll.read',
    'payroll.manage',
    'reports.read',
  ],
  hr_manager: [
    'staff.manage',
    'payroll.read',
    'payroll.manage',
    'reports.read',
  ],
  custom: [],
};

export const ROLE_LABELS: Record<RoleType, string> = {
  super_admin: 'Super Admin',
  hospital_admin: 'Hospital Admin',
  receptionist: 'Receptionist',
  doctor: 'Doctor / Consultant',
  accountant: 'Accountant',
  hr_manager: 'HR / Staff Manager',
  custom: 'Custom Role',
};

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRolePreview: (role: RoleType) => void;
  isConfigured: boolean;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured] = useState<boolean>(true);

  useEffect(() => {
    // Listen for Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'userProfiles', user.uid));
          const data = snap.exists() ? (snap.data() as UserProfile) : null;
          if (data && data.status !== 'suspended') {
            setCurrentUser(data);
          } else {
            await fbSignOut(auth);
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'custom' && currentUser.customPermissions) {
      return currentUser.customPermissions.includes(permission);
    }
    const permissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return permissions.includes(permission);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      // Attempt Firebase Authentication
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'userProfiles', cred.user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        if (data.status === 'suspended') {
          await fbSignOut(auth);
          setLoading(false);
          return { success: false, error: 'Your staff account has been deactivated by the administrator.' };
        }
        setCurrentUser(data);
        localStorage.setItem('ch_admin_user', JSON.stringify(data));
      } else {
        await fbSignOut(auth);
        setLoading(false);
        return { success: false, error: 'This account has no staff profile. Ask the Super Admin to set up your access.' };
      }
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {


      setLoading(false);
      void err;
      return { success: false, error: 'Wrong email or password, or this account is not allowed to sign in.' };
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('ch_admin_user');
  };

  const switchRolePreview = (role: RoleType) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role,
      displayName: `${currentUser.displayName.split(' (')[0]} (${ROLE_LABELS[role]})`,
      doctorId: role === 'doctor' ? 'doc-tariq' : undefined
    };
    setCurrentUser(updated);
    localStorage.setItem('ch_admin_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        hasPermission,
        login,
        logout,
        switchRolePreview,
        isConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
