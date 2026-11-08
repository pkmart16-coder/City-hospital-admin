import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query,
  where,
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Appointment, 
  Doctor, 
  PaymentSubmission, 
  PaymentTransaction, 
  ExpenseRecord, 
  SalaryRecord, 
  StaffMember, 
  Department, 
  MedicalService, 
  BannerItem, 
  AnnouncementItem, 
  HospitalSettings, 
  AuditLog, 
  HospitalNotification,
  Inquiry,
  Review,
  AppointmentStatus,
  PaymentStatus,
  PaymentMethod,
  SalaryStatus
} from '../types';
import { 
  initialHospitalSettings, 
  initialDepartments, 
  initialDoctors, 
  initialAppointments, 
  initialPaymentSubmissions, 
  initialPaymentTransactions, 
  initialExpenses, 
  initialStaffMembers, 
  initialSalaryRecords, 
  initialBanners, 
  initialAnnouncements, 
  initialServices, 
  initialAuditLogs, 
  initialNotifications 
} from '../utils/seedData';
import { useAuth } from './AuthContext';
import { generateReceiptNumber } from '../utils/formatters';

const to24h = (t: string): string => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec((t || '').trim());
  if (!m) return t;
  let h = Number(m[1]);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};
const makeLockId = (doctorId: string, date: string, time12: string) =>
  `${doctorId}_${date}_${to24h(time12)}_1`;

interface HospitalContextType {
  settings: HospitalSettings;
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  paymentSubmissions: PaymentSubmission[];
  transactions: PaymentTransaction[];
  expenses: ExpenseRecord[];
  salaryRecords: SalaryRecord[];
  staff: StaffMember[];
  banners: BannerItem[];
  announcements: AnnouncementItem[];
  services: MedicalService[];
  auditLogs: AuditLog[];
  notifications: HospitalNotification[];
  inquiries: Inquiry[];
  reviews: Review[];
  isSyncing: boolean;
  firestoreConnected: boolean;
  
  // Actions
  updateAppointment: (id: string, updates: Partial<Appointment>, auditMsg?: string) => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  cancelAppointment: (id: string, reason: string) => Promise<void>;
  verifyPaymentSubmission: (id: string, approved: boolean, reason?: string) => Promise<void>;
  recordDirectPayment: (
    appointmentId: string, 
    amount: number, 
    method: PaymentMethod, 
    notes?: string
  ) => Promise<string>;
  saveDoctor: (doctor: Partial<Doctor>) => Promise<string>;
  toggleDoctorAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  saveStaff: (staffMember: Partial<StaffMember>) => Promise<string>;
  saveSalaryRecord: (record: Partial<SalaryRecord>) => Promise<string>;
  approveSalaryRecord: (id: string) => Promise<void>;
  recordSalaryPayment: (
    id: string, 
    amount: number, 
    method: PaymentMethod, 
    ref?: string, 
    notes?: string
  ) => Promise<void>;
  saveExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => Promise<string>;
  saveBanner: (banner: Partial<BannerItem>) => Promise<string>;
  deleteBanner: (id: string) => Promise<void>;
  saveAnnouncement: (announcement: Partial<AnnouncementItem>) => Promise<string>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateSettings: (newSettings: HospitalSettings) => Promise<void>;
  markNotificationRead: (id: string) => void;
  seedDatabase: () => Promise<void>;
  replyInquiry: (id: string, reply: string, publishToFaq: boolean) => Promise<void>;
  updateReview: (id: string, updates: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<HospitalSettings>(initialHospitalSettings);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>(initialPaymentSubmissions);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialPaymentTransactions);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(initialSalaryRecords);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffMembers);
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [services] = useState<MedicalService[]>(initialServices);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<HospitalNotification[]>(initialNotifications);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);

  // Helper to log actions
  const logAudit = useCallback(async (
    action: string, 
    module: AuditLog['module'], 
    details: string, 
    targetId?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: currentUser?.email || 'admin@cityhospital.pk',
      userName: currentUser?.displayName || 'Authorized Staff',
      userRole: currentUser?.role || 'Admin',
      action,
      module,
      targetId,
      details
    };

    setAuditLogs(prev => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch {
      // Fallback local
    }
  }, [currentUser]);

  // Initial Firestore real-time listeners with graceful fallback
  useEffect(() => {
    let isMounted = true;
    setIsSyncing(true);

    const unsubscribers: (() => void)[] = [];

    const setupListeners = async () => {
      try {
        // Appointments listener
        const appointmentsSource = currentUser?.role === 'doctor'
          ? query(collection(db, 'appointments'), where('doctorId', '==', currentUser.doctorId || '__none__'))
          : collection(db, 'appointments');
        const unsubAppointments = onSnapshot(appointmentsSource, (snapshot) => {
          if (!snapshot.empty) {
            const list: Appointment[] = [];
            snapshot.forEach(d => list.push(d.data() as Appointment));
            if (isMounted) setAppointments(list);
          }
          if (isMounted) setFirestoreConnected(true);
        }, () => {
          // Fallback to local
        });
        unsubscribers.push(unsubAppointments);

        // Doctors listener
        const unsubDoctors = onSnapshot(collection(db, 'doctors'), (snapshot) => {
          if (!snapshot.empty) {
            const list: Doctor[] = [];
            snapshot.forEach(d => list.push(d.data() as Doctor));
            if (isMounted) setDoctors(list);
          }
        }, () => {});
        unsubscribers.push(unsubDoctors);

        // Payment Submissions listener
        const unsubSubmissions = onSnapshot(collection(db, 'paymentSubmissions'), (snapshot) => {
          if (!snapshot.empty) {
            const list: PaymentSubmission[] = [];
            snapshot.forEach(d => list.push(d.data() as PaymentSubmission));
            if (isMounted) setPaymentSubmissions(list);
          }
        }, () => {});
        unsubscribers.push(unsubSubmissions);

        // Departments listener
        const unsubDepartments = onSnapshot(collection(db, 'departments'), (snapshot) => {
          if (!snapshot.empty) {
            const list: Department[] = [];
            snapshot.forEach(d => list.push(d.data() as Department));
            if (isMounted) setDepartments(list);
          }
        }, () => {});
        unsubscribers.push(unsubDepartments);

        // Staff listener (staff only)
        const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
          if (!snapshot.empty) {
            const list: StaffMember[] = [];
            snapshot.forEach(d => list.push(d.data() as StaffMember));
            if (isMounted) setStaff(list);
          }
        }, () => {});
        unsubscribers.push(unsubStaff);

        // Website questions
        const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
          const list: Inquiry[] = [];
          snapshot.forEach(d => list.push(d.data() as Inquiry));
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          if (isMounted) setInquiries(list);
        }, () => {});
        unsubscribers.push(unsubInquiries);

        // Website banners / offers (always mirror Firestore)
        const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
          const list: BannerItem[] = [];
          snapshot.forEach(d => list.push(d.data() as BannerItem));
          list.sort((a, b) => (a.priority || 0) - (b.priority || 0));
          if (isMounted) setBanners(list);
        }, () => {});
        unsubscribers.push(unsubBanners);

        // Patient reviews (staff only)
        const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
          const list: Review[] = [];
          snapshot.forEach(d => list.push(d.data() as Review));
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          if (isMounted) setReviews(list);
        }, () => {});
        unsubscribers.push(unsubReviews);

        // Hospital Settings
        const unsubSettings = onSnapshot(doc(db, 'hospitalSettings', 'global'), (docSnap) => {
          if (docSnap.exists()) {
            if (isMounted) setSettings(docSnap.data() as HospitalSettings);
          }
        }, () => {});
        unsubscribers.push(unsubSettings);

      } catch {
        // Continue with local storage/seed
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    setupListeners();

    return () => {
      isMounted = false;
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser?.uid]);

  // Update appointment
  const updateAppointment = async (id: string, updates: Partial<Appointment>, auditMsg?: string) => {
    const updatedDate = new Date().toISOString();
    const payload = { ...updates, updatedAt: updatedDate, updatedBy: currentUser?.email };

    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...payload } : a));

    try {
      await updateDoc(doc(db, 'appointments', id), payload);
    } catch {
      // Local state is already updated
    }

    // Keep the patient's public status page + slot locks in sync with the website
    const existing = appointments.find(a => a.id === id);
    if (existing) {
      const merged = { ...existing, ...payload };
      try {
        if (merged.publicToken) {
          await setDoc(doc(db, 'bookingStatus', merged.publicToken), {
            status: merged.status,
            paymentStatus: merged.paymentStatus,
            paidAmount: merged.paidAmount || 0,
            appointmentDate: merged.appointmentDate,
            appointmentTime: merged.appointmentTime,
            cancellationReason: merged.cancellationReason || '',
            updatedAt: updatedDate
          }, { merge: true });
        }
        const moved =
          (updates.appointmentDate && updates.appointmentDate !== existing.appointmentDate) ||
          (updates.appointmentTime && updates.appointmentTime !== existing.appointmentTime);
        if (updates.status === 'Cancelled' || moved) {
          for (const lid of existing.slotLockIds || []) {
            await deleteDoc(doc(db, 'slotLocks', lid));
          }
        }
        if (moved && merged.status !== 'Cancelled') {
          const lid = makeLockId(existing.doctorId, merged.appointmentDate, merged.appointmentTime);
          await setDoc(doc(db, 'slotLocks', lid), {
            doctorId: existing.doctorId,
            date: merged.appointmentDate,
            time: to24h(merged.appointmentTime),
            seat: 1,
            appointmentId: id,
            createdAt: updatedDate
          });
          await updateDoc(doc(db, 'appointments', id), { slotLockIds: [lid], timeKey: to24h(merged.appointmentTime) });
        }
      } catch {
        // sync is best-effort
      }
    }

    if (auditMsg) {
      await logAudit('Appointment Updated', 'Appointments', auditMsg, id);
    }
  };

  // Create appointment
  const createAppointment = async (
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const id = `apt-${Date.now()}`;
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser?.email || 'Receptionist',
      timeKey: to24h(data.appointmentTime),
      slotLockIds: [makeLockId(data.doctorId, data.appointmentDate, data.appointmentTime)]
    };

    setAppointments(prev => [newAppointment, ...prev]);

    try {
      await setDoc(doc(db, 'appointments', id), newAppointment);
      await setDoc(doc(db, 'slotLocks', newAppointment.slotLockIds![0]), {
        doctorId: data.doctorId,
        date: data.appointmentDate,
        time: to24h(data.appointmentTime),
        seat: 1,
        appointmentId: id,
        createdAt: now
      });
    } catch {
      // Handled
    }

    await logAudit(
      'Appointment Booked', 
      'Appointments', 
      `Booked appointment ${newAppointment.bookingReference} for ${newAppointment.patientName} with ${newAppointment.doctorName}`,
      id
    );

    return id;
  };

  // Cancel appointment with recorded reason
  const cancelAppointment = async (id: string, reason: string) => {
    const apt = appointments.find(a => a.id === id);
    await updateAppointment(
      id, 
      { 
        status: 'Cancelled' as AppointmentStatus, 
        cancellationReason: reason 
      },
      `Cancelled appointment ${apt?.bookingReference || id}. Reason: ${reason}`
    );
  };

  // Verify bank transfer payment submission
  const verifyPaymentSubmission = async (id: string, approved: boolean, reason?: string) => {
    const submission = paymentSubmissions.find(s => s.id === id);
    if (!submission) return;

    const now = new Date().toISOString();
    const verifier = currentUser?.displayName || currentUser?.email || 'Authorized Accountant';

    if (approved) {
      const receiptNo = generateReceiptNumber();
      // 1. Update payment submission
      const updatedSub: PaymentSubmission = {
        ...submission,
        status: 'Approved',
        verifiedAt: now,
        verifiedBy: verifier
      };
      setPaymentSubmissions(prev => prev.map(s => s.id === id ? updatedSub : s));

      // 2. Create payment transaction record
      const txn: PaymentTransaction = {
        id: `txn-${Date.now()}`,
        receiptNumber: receiptNo,
        appointmentId: submission.appointmentId,
        bookingReference: submission.bookingReference,
        patientName: submission.patientName,
        amount: submission.amountPaid,
        paymentMethod: 'Bank Transfer',
        type: 'Consultation Fee',
        recordedBy: currentUser?.email || 'accountant@cityhospital.pk',
        recordedByName: verifier,
        notes: `Bank transfer approved. Transaction Ref: ${submission.transactionReference}`,
        timestamp: now,
        status: 'Finalized'
      };
      setTransactions(prev => [txn, ...prev]);

      // 3. Update appointment
      await updateAppointment(
        submission.appointmentId,
        {
          paymentStatus: 'Paid' as PaymentStatus,
          paidAmount: submission.amountPaid,
          paymentMethod: 'Bank Transfer',
          paymentReference: submission.transactionReference,
          paymentReceiptNumber: receiptNo,
          paymentReceivedBy: verifier,
          status: 'Confirmed' as AppointmentStatus
        },
        `Approved bank payment of Rs. ${submission.amountPaid} for booking ${submission.bookingReference}`
      );

      try {
        await updateDoc(doc(db, 'paymentSubmissions', id), {
          status: 'Approved',
          verifiedAt: now,
          verifiedBy: verifier
        });
        await setDoc(doc(db, 'payments', txn.id), txn);
      } catch {
        // Local handled
      }

    } else {
      // Rejected
      const updatedSub: PaymentSubmission = {
        ...submission,
        status: 'Rejected',
        verifiedAt: now,
        verifiedBy: verifier,
        rejectionReason: reason || 'Receipt details or reference number could not be verified'
      };
      setPaymentSubmissions(prev => prev.map(s => s.id === id ? updatedSub : s));

      await updateAppointment(
        submission.appointmentId,
        {
          paymentStatus: 'Rejected' as PaymentStatus
        },
        `Rejected bank payment for booking ${submission.bookingReference}. Reason: ${reason}`
      );

      try {
        await updateDoc(doc(db, 'paymentSubmissions', id), {
          status: 'Rejected',
          verifiedAt: now,
          verifiedBy: verifier,
          rejectionReason: reason
        });
      } catch {
        // Handled
      }
    }
  };

  // Record on-site payment at reception
  const recordDirectPayment = async (
    appointmentId: string, 
    amount: number, 
    method: PaymentMethod, 
    notes?: string
  ): Promise<string> => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    const receiptNo = generateReceiptNumber();
    const now = new Date().toISOString();
    const recorder = currentUser?.displayName || currentUser?.email || 'Reception Desk';

    const txn: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      receiptNumber: receiptNo,
      appointmentId: apt.id,
      bookingReference: apt.bookingReference,
      patientName: apt.patientName,
      amount,
      paymentMethod: method,
      type: 'Consultation Fee',
      recordedBy: currentUser?.email || 'staff@cityhospital.pk',
      recordedByName: recorder,
      notes: notes || `Direct on-site payment collected via ${method}`,
      timestamp: now,
      status: 'Finalized'
    };

    setTransactions(prev => [txn, ...prev]);

    const newPaidAmount = (apt.paidAmount || 0) + amount;
    const isFullyPaid = newPaidAmount >= apt.consultationFee;
    const newPaymentStatus: PaymentStatus = isFullyPaid ? 'Paid' : 'Partially Paid';

    await updateAppointment(
      appointmentId,
      {
        paidAmount: newPaidAmount,
        paymentStatus: newPaymentStatus,
        paymentMethod: method,
        paymentReceiptNumber: receiptNo,
        paymentReceivedBy: recorder,
        status: apt.status === 'Pending' ? 'Confirmed' : apt.status
      },
      `Recorded on-site payment of Rs. ${amount} via ${method} for ${apt.bookingReference}`
    );

    try {
      await setDoc(doc(db, 'payments', txn.id), txn);
    } catch {
      // Local
    }

    return receiptNo;
  };

  // Save / Update doctor
  const saveDoctor = async (doctorData: Partial<Doctor>): Promise<string> => {
    const id = doctorData.id || `doc-${Date.now()}`;
    const now = new Date().toISOString();

    const isNew = !doctorData.id;
    const completeDoctor: Doctor = {
      id,
      name: doctorData.name || 'New Doctor',
      title: doctorData.title || 'Dr.',
      qualifications: doctorData.qualifications || 'MBBS',
      specialization: doctorData.specialization || 'General Physician',
      departmentId: doctorData.departmentId || departments[0]?.id || 'dept-general',
      departmentName: doctorData.departmentName || departments[0]?.name || 'Internal Medicine',
      email: doctorData.email || 'doctor@cityhospital.pk',
      phone: doctorData.phone || '+92 300 0000000',
      photoUrl: doctorData.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      biography: doctorData.biography || '',
      experienceYears: doctorData.experienceYears || 5,
      roomNumber: doctorData.roomNumber || 'Room 101',
      consultationFee: doctorData.consultationFee || 2500,
      isActive: doctorData.isActive ?? true,
      isAvailableToday: doctorData.isAvailableToday ?? true,
      scheduleConfigured: doctorData.scheduleConfigured ?? true,
      slotDurationMinutes: doctorData.slotDurationMinutes || 20,
      weeklySchedule: doctorData.weeklySchedule || [
        { day: 'Monday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Tuesday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Wednesday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Thursday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Friday', enabled: true, slots: [{ startTime: '09:00', endTime: '12:00' }] },
        { day: 'Saturday', enabled: false, slots: [] },
        { day: 'Sunday', enabled: false, slots: [] }
      ],
      leaves: doctorData.leaves || [],
      isPublicVisible: doctorData.isPublicVisible ?? true,
      createdAt: doctorData.createdAt || now,
      updatedAt: now
    };

    if (isNew) {
      setDoctors(prev => [completeDoctor, ...prev]);
    } else {
      setDoctors(prev => prev.map(d => d.id === id ? completeDoctor : d));
    }

    try {
      await setDoc(doc(db, 'doctors', id), completeDoctor);
    } catch {
      // Local
    }

    await logAudit(
      isNew ? 'Doctor Added' : 'Doctor Updated',
      'Doctors',
      `${isNew ? 'Added' : 'Updated profile for'} ${completeDoctor.title} ${completeDoctor.name} (${completeDoctor.specialization})`,
      id
    );

    return id;
  };

  // Toggle Doctor availability
  const toggleDoctorAvailability = async (id: string, isAvailable: boolean) => {
    const docItem = doctors.find(d => d.id === id);
    if (!docItem) return;

    setDoctors(prev => prev.map(d => d.id === id ? { ...d, isAvailableToday: isAvailable } : d));

    try {
      await updateDoc(doc(db, 'doctors', id), { isAvailableToday: isAvailable });
    } catch {
      // Local
    }

    await logAudit(
      'Doctor Availability Changed',
      'Doctors',
      `Marked ${docItem.title} ${docItem.name} as ${isAvailable ? 'Available' : 'Unavailable'} today`,
      id
    );
  };

  // Staff member save
  const saveStaff = async (staffData: Partial<StaffMember>): Promise<string> => {
    const id = staffData.id || `staff-${Date.now()}`;
    const completeStaff: StaffMember = {
      id,
      employeeId: staffData.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: staffData.name || 'New Staff',
      designation: staffData.designation || 'Staff',
      department: staffData.department || 'Administration',
      employmentType: staffData.employmentType || 'Full-time',
      joiningDate: staffData.joiningDate || new Date().toISOString().slice(0, 10),
      phone: staffData.phone || '+92 300 0000000',
      email: staffData.email || 'staff@cityhospital.pk',
      photoUrl: staffData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      biography: staffData.biography || '',
      status: staffData.status || 'Active',
      salaryBasis: staffData.salaryBasis || 'Monthly',
      baseSalary: staffData.baseSalary || 50000,
      workingDays: staffData.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      shiftTiming: staffData.shiftTiming || '09:00 AM - 05:00 PM',
      isPublicVisible: staffData.isPublicVisible ?? false,
      createdAt: staffData.createdAt || new Date().toISOString()
    };

    const isNew = !staffData.id;
    if (isNew) {
      setStaff(prev => [completeStaff, ...prev]);
    } else {
      setStaff(prev => prev.map(s => s.id === id ? completeStaff : s));
    }

    try {
      await setDoc(doc(db, 'staff', id), completeStaff);
    } catch {
      // Local
    }

    // Public website copy: only name/designation/photo/bio/hours, only when explicitly public
    try {
      if (completeStaff.isPublicVisible && completeStaff.status === 'Active') {
        await setDoc(doc(db, 'staffPublicProfiles', id), {
          id,
          name: completeStaff.name,
          designation: completeStaff.designation,
          department: completeStaff.department,
          photoUrl: completeStaff.photoUrl,
          biography: completeStaff.biography || '',
          workingDays: completeStaff.workingDays,
          shiftTiming: completeStaff.shiftTiming
        });
      } else {
        await deleteDoc(doc(db, 'staffPublicProfiles', id));
      }
    } catch {
      // Local
    }

    await logAudit(
      isNew ? 'Staff Member Added' : 'Staff Profile Updated',
      'Staff',
      `${isNew ? 'Added employee' : 'Updated details for'} ${completeStaff.name} (${completeStaff.employeeId})`,
      id
    );

    return id;
  };

  // Save / Update salary record
  const saveSalaryRecord = async (data: Partial<SalaryRecord>): Promise<string> => {
    const id = data.id || `sal-${Date.now()}`;
    const now = new Date().toISOString();
    const isNew = !data.id;

    const record: SalaryRecord = {
      id,
      voucherNumber: data.voucherNumber || `SAL-2026-10-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: data.employeeId || 'EMP-001',
      employeeName: data.employeeName || 'Staff Member',
      designation: data.designation || 'Staff',
      department: data.department || 'General',
      role: data.role || 'Staff',
      period: data.period || 'October 2026',
      salaryBasis: data.salaryBasis || 'Monthly',
      baseSalary: data.baseSalary || 50000,
      allowances: data.allowances || {},
      totalAllowances: data.totalAllowances || 0,
      deductions: data.deductions || {},
      totalDeductions: data.totalDeductions || 0,
      netPayable: data.netPayable || 50000,
      paidAmount: data.paidAmount || 0,
      remainingBalance: (data.netPayable || 50000) - (data.paidAmount || 0),
      status: data.status || 'Draft',
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
      notes: data.notes,
      createdAt: data.createdAt || now,
      updatedAt: now
    };

    if (isNew) {
      setSalaryRecords(prev => [record, ...prev]);
    } else {
      setSalaryRecords(prev => prev.map(s => s.id === id ? record : s));
    }

    try {
      await setDoc(doc(db, 'salaryRecords', id), record);
    } catch {
      // Handled
    }

    await logAudit(
      isNew ? 'Payroll Generated' : 'Salary Record Updated',
      'Payroll',
      `${isNew ? 'Generated' : 'Updated'} payroll voucher ${record.voucherNumber} for ${record.employeeName} (${record.period})`,
      id
    );

    return id;
  };

  const approveSalaryRecord = async (id: string) => {
    const rec = salaryRecords.find(s => s.id === id);
    if (!rec) return;

    const now = new Date().toISOString();
    const approver = currentUser?.displayName || 'Super Admin';

    const updated: SalaryRecord = {
      ...rec,
      status: 'Approved' as SalaryStatus,
      approvedBy: approver,
      approvedAt: now,
      updatedAt: now
    };

    setSalaryRecords(prev => prev.map(s => s.id === id ? updated : s));

    try {
      await updateDoc(doc(db, 'salaryRecords', id), {
        status: 'Approved',
        approvedBy: approver,
        approvedAt: now,
        updatedAt: now
      });
    } catch {
      // Local
    }

    await logAudit(
      'Payroll Approved',
      'Payroll',
      `Approved salary voucher ${rec.voucherNumber} for ${rec.employeeName} (${rec.period}) - Rs. ${rec.netPayable}`,
      id
    );
  };

  const recordSalaryPayment = async (
    id: string, 
    amount: number, 
    method: PaymentMethod, 
    ref?: string, 
    notes?: string
  ) => {
    const rec = salaryRecords.find(s => s.id === id);
    if (!rec) return;

    const now = new Date().toISOString();
    const newPaidAmount = (rec.paidAmount || 0) + amount;
    const remaining = rec.netPayable - newPaidAmount;
    const newStatus: SalaryStatus = remaining <= 0 ? 'Paid' : 'Partially Paid';

    const updated: SalaryRecord = {
      ...rec,
      paidAmount: newPaidAmount,
      remainingBalance: Math.max(0, remaining),
      status: newStatus,
      paymentDate: now.slice(0, 10),
      paymentMethod: method,
      paymentReference: ref || `PAY-${Date.now()}`,
      notes: notes || rec.notes,
      updatedAt: now
    };

    setSalaryRecords(prev => prev.map(s => s.id === id ? updated : s));

    try {
      await updateDoc(doc(db, 'salaryRecords', id), updated);
    } catch {
      // Local
    }

    await logAudit(
      'Salary Payment Disbursed',
      'Payroll',
      `Disbursed Rs. ${amount} via ${method} for ${rec.employeeName} (${rec.voucherNumber}). Status: ${newStatus}`,
      id
    );
  };

  // Expenses
  const saveExpense = async (data: Omit<ExpenseRecord, 'id' | 'createdAt'>): Promise<string> => {
    const id = `exp-${Date.now()}`;
    const newExpense: ExpenseRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    setExpenses(prev => [newExpense, ...prev]);

    try {
      await setDoc(doc(db, 'expenses', id), newExpense);
    } catch {
      // Local
    }

    await logAudit(
      'Expense Recorded',
      'Payments',
      `Recorded expense voucher ${newExpense.voucherNumber} of Rs. ${newExpense.amount} for ${newExpense.payee} (${newExpense.category})`,
      id
    );

    return id;
  };

  // CMS Banners
  const saveBanner = async (data: Partial<BannerItem>): Promise<string> => {
    const id = data.id || `ban-${Date.now()}`;
    const banner: BannerItem = {
      id,
      title: data.title || 'Special Hospital Announcement',
      subtitle: data.subtitle || '',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80',
      ctaText: data.ctaText || 'Learn More',
      destinationUrl: data.destinationUrl || '/appointments',
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      expiryDate: data.expiryDate || '2026-12-31',
      priority: data.priority || 1,
      isActive: data.isActive ?? true,
      placement: data.placement || 'Home Hero',
      videoUrl: data.videoUrl || '',
      countdownEnd: data.countdownEnd || ''
    };

    const isNew = !data.id;
    if (isNew) {
      setBanners(prev => [banner, ...prev]);
    } else {
      setBanners(prev => prev.map(b => b.id === id ? banner : b));
    }

    try {
      await setDoc(doc(db, 'banners', id), banner);
    } catch {
      // Local
    }

    await logAudit(
      isNew ? 'Banner Created' : 'Banner Updated',
      'CMS',
      `${isNew ? 'Created' : 'Updated'} website banner "${banner.title}"`,
      id
    );

    return id;
  };

  const deleteBanner = async (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch {
      // Local
    }
    await logAudit('Banner Deleted', 'CMS', `Deleted website banner ID: ${id}`, id);
  };

  // Announcements
  const saveAnnouncement = async (data: Partial<AnnouncementItem>): Promise<string> => {
    const id = data.id || `ann-${Date.now()}`;
    const item: AnnouncementItem = {
      id,
      title: data.title || 'Public Notice',
      content: data.content || '',
      type: data.type || 'Notice',
      isActive: data.isActive ?? true,
      publishedDate: data.publishedDate || new Date().toISOString().slice(0, 10),
      expiresDate: data.expiresDate,
      targetAudience: data.targetAudience || 'All Patients'
    };

    const isNew = !data.id;
    if (isNew) {
      setAnnouncements(prev => [item, ...prev]);
    } else {
      setAnnouncements(prev => prev.map(a => a.id === id ? item : a));
    }

    try {
      await setDoc(doc(db, 'announcements', id), item);
    } catch {
      // Local
    }

    await logAudit(
      isNew ? 'Announcement Published' : 'Announcement Updated',
      'CMS',
      `${isNew ? 'Published' : 'Updated'} notice: "${item.title}"`,
      id
    );

    return id;
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch {
      // Local
    }
    await logAudit('Announcement Deleted', 'CMS', `Deleted announcement ID: ${id}`, id);
  };

  // Settings
  const updateSettings = async (newSettings: HospitalSettings) => {
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'hospitalSettings', 'global'), newSettings);
    } catch {
      // Local
    }
    await logAudit('Hospital Settings Updated', 'Settings', 'Updated core hospital settings, contact numbers and policies');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Reply to a question asked on the public website
  const replyInquiry = async (id: string, reply: string, publishToFaq: boolean) => {
    const inq = inquiries.find(i => i.id === id);
    if (!inq) return;
    const now = new Date().toISOString();
    const by = currentUser?.displayName || currentUser?.email || 'Hospital Staff';
    const upd = { reply, status: 'Answered' as const, repliedAt: now, repliedBy: by };
    await updateDoc(doc(db, 'inquiries', id), upd);
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, ...upd } : i));
    if (publishToFaq) {
      await setDoc(doc(db, 'faqs', id), {
        id,
        question: inq.message,
        answer: reply,
        isActive: true,
        createdAt: now
      });
    }
    await logAudit('Inquiry Answered', 'CMS', `Replied to website question from ${inq.name}`, id);
  };

  // Reviews moderation
  const updateReview = async (id: string, updates: Partial<Review>) => {
    await updateDoc(doc(db, 'reviews', id), updates);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    await logAudit('Review Updated', 'CMS', `Updated review ${id}`, id);
  };

  const deleteReview = async (id: string) => {
    await deleteDoc(doc(db, 'reviews', id));
    setReviews(prev => prev.filter(r => r.id !== id));
    await logAudit('Review Deleted', 'CMS', `Deleted review ${id}`, id);
  };

  // Seed Firestore
  const seedDatabase = async () => {
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);

      // Hospital Settings
      batch.set(doc(db, 'hospitalSettings', 'global'), initialHospitalSettings);

      // Departments
      for (const d of initialDepartments) {
        batch.set(doc(db, 'departments', d.id), d);
      }

      // Doctors
      for (const d of initialDoctors) {
        batch.set(doc(db, 'doctors', d.id), d);
      }

      // Appointments
      for (const a of initialAppointments) {
        batch.set(doc(db, 'appointments', a.id), a);
      }

      // Payments
      for (const p of initialPaymentSubmissions) {
        batch.set(doc(db, 'paymentSubmissions', p.id), p);
      }
      for (const t of initialPaymentTransactions) {
        batch.set(doc(db, 'payments', t.id), t);
      }

      // Expenses
      for (const e of initialExpenses) {
        batch.set(doc(db, 'expenses', e.id), e);
      }

      // Staff
      for (const s of initialStaffMembers) {
        batch.set(doc(db, 'staff', s.id), s);
      }

      // Salaries
      for (const sal of initialSalaryRecords) {
        batch.set(doc(db, 'salaryRecords', sal.id), sal);
      }

      // CMS
      for (const b of initialBanners) {
        batch.set(doc(db, 'banners', b.id), b);
      }
      for (const an of initialAnnouncements) {
        batch.set(doc(db, 'announcements', an.id), an);
      }

      await batch.commit();
      setFirestoreConnected(true);
      await logAudit('System Database Seeded', 'Settings', 'Seeded initial hospital departments, doctors, and configurations to Firestore');
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <HospitalContext.Provider
      value={{
        settings,
        departments,
        doctors,
        appointments,
        paymentSubmissions,
        transactions,
        expenses,
        salaryRecords,
        staff,
        banners,
        announcements,
        services,
        auditLogs,
        notifications,
        inquiries,
        reviews,
        isSyncing,
        firestoreConnected,
        updateAppointment,
        createAppointment,
        cancelAppointment,
        verifyPaymentSubmission,
        recordDirectPayment,
        saveDoctor,
        toggleDoctorAvailability,
        saveStaff,
        saveSalaryRecord,
        approveSalaryRecord,
        recordSalaryPayment,
        saveExpense,
        saveBanner,
        deleteBanner,
        saveAnnouncement,
        deleteAnnouncement,
        updateSettings,
        markNotificationRead,
        seedDatabase,
        replyInquiry,
        updateReview,
        deleteReview
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) throw new Error('useHospital must be used within HospitalProvider');
  return context;
};
