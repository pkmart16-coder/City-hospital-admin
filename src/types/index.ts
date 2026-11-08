/**
 * City Hospital Admin Dashboard - Type Definitions
 * Shared schema compatible with the public hospital website
 */

export type RoleType = 
  | 'super_admin'
  | 'hospital_admin'
  | 'receptionist'
  | 'doctor'
  | 'accountant'
  | 'hr_manager'
  | 'custom';

export type Permission =
  | 'appointments.read'
  | 'appointments.create'
  | 'appointments.update'
  | 'doctors.manage'
  | 'staff.manage'
  | 'payments.verify'
  | 'payroll.read'
  | 'payroll.manage'
  | 'banners.manage'
  | 'users.manage'
  | 'reports.read'
  | 'settings.manage';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: RoleType;
  customPermissions?: Permission[];
  doctorId?: string; // If role === 'doctor'
  staffId?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
}

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked In'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export type PaymentStatus =
  | 'Unpaid'
  | 'Pending Verification'
  | 'Paid'
  | 'Partially Paid'
  | 'Rejected'
  | 'Refunded';

export type PaymentMethod =
  | 'Cash'
  | 'Card'
  | 'Bank Transfer'
  | 'Online'
  | 'Cheque';

export interface Appointment {
  id: string;
  bookingReference: string; // e.g. CH-2026-9041
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientCnic?: string;
  
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm or "10:30 AM"
  timeSlotIndex?: number;
  timeKey?: string; // 24h HH:mm, used for slot locking
  slotLockIds?: string[];
  publicToken?: string; // secret id of the public bookingStatus doc
  patientNotes?: string;
  
  consultationFee: number; // In PKR
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentReceiptNumber?: string;
  paymentReceivedBy?: string;
  
  status: AppointmentStatus;
  cancellationReason?: string;
  internalNotes?: string;
  
  source: 'Online Public' | 'Reception Walk-in' | 'Phone Call';
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorScheduleSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  maxPatients?: number;
}

export interface DoctorWeeklySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  enabled: boolean;
  slots: DoctorScheduleSlot[];
}

export interface DoctorLeave {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  isApproved: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  title: string; // Dr. / Prof. / Assoc. Prof.
  qualifications: string; // MBBS, FCPS (Cardiology)
  specialization: string; // Interventional Cardiologist
  departmentId: string;
  departmentName: string;
  
  email: string;
  phone: string;
  photoUrl: string;
  biography: string;
  experienceYears: number;
  roomNumber: string; // e.g., OPD Room 14, 2nd Floor
  consultationFee: number; // PKR
  
  isActive: boolean; // General account state
  isAvailableToday?: boolean; // Override flag
  scheduleConfigured: boolean;
  
  slotDurationMinutes: number; // 15, 20, 30
  weeklySchedule: DoctorWeeklySchedule[];
  leaves: DoctorLeave[];
  
  isPublicVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSubmission {
  id: string;
  appointmentId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  amountExpected: number;
  amountPaid: number;
  bankName: string;
  senderAccountTitle?: string;
  senderAccountNumber?: string;
  transactionReference: string;
  proofImageUrl?: string;
  
  status: 'Pending Verification' | 'Approved' | 'Rejected';
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string; // RCP-2026-0042
  appointmentId?: string;
  bookingReference?: string;
  patientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  type: 'Consultation Fee' | 'Diagnostic' | 'Pharmacy' | 'Procedure' | 'Refund';
  recordedBy: string;
  recordedByName: string;
  notes?: string;
  timestamp: string;
  status: 'Finalized' | 'Reversed' | 'Refunded';
}

export interface ExpenseRecord {
  id: string;
  voucherNumber: string;
  category: 'Medical Supplies' | 'Utilities' | 'Equipment Maintenance' | 'Hospitality' | 'Administrative' | 'Other';
  payee: string;
  amount: number;
  paymentMethod: PaymentMethod;
  approvedBy: string;
  date: string;
  description: string;
  receiptUrl?: string;
  createdAt: string;
}

export type SalaryBasis = 'Monthly' | 'Per Consultation' | 'Daily' | 'Hourly';
export type SalaryStatus = 'Draft' | 'Approved' | 'Partially Paid' | 'Paid' | 'On Hold' | 'Cancelled';

export interface SalaryRecord {
  id: string;
  voucherNumber: string; // SAL-2026-10-003
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  role: string;
  period: string; // e.g. "October 2026"
  salaryBasis: SalaryBasis;
  
  baseSalary: number;
  allowances: {
    medical?: number;
    transport?: number;
    housing?: number;
    other?: number;
  };
  totalAllowances: number;
  
  deductions: {
    tax?: number;
    unpaidLeave?: number;
    providentFund?: number;
    other?: number;
  };
  totalDeductions: number;
  
  netPayable: number;
  paidAmount: number;
  remainingBalance: number;
  status: SalaryStatus;
  
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  employeeId: string; // EMP-0104
  name: string;
  designation: string;
  department: string;
  employmentType: 'Full-time' | 'Part-time' | 'Visiting' | 'Contract';
  joiningDate: string;
  phone: string;
  email: string;
  cnic?: string;
  photoUrl: string;
  biography?: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  
  salaryBasis: SalaryBasis;
  baseSalary: number;
  
  workingDays: string[]; // ['Monday', 'Tuesday', ...]
  shiftTiming: string; // "08:00 AM - 04:00 PM"
  isPublicVisible: boolean;
  
  createdAt: string;
}

export interface StaffAttendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'On Leave' | 'Half Day';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  destinationUrl?: string;
  startDate: string;
  expiryDate: string;
  priority: number;
  isActive: boolean;
  placement: 'Home Hero' | 'Top Announcement Bar' | 'Popup Modal' | 'Sidebar';
  videoUrl?: string;
  countdownEnd?: string; // ISO date-time with +05:00, offer timer end
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: 'Notice' | 'Emergency' | 'Health Alert' | 'Holiday';
  isActive: boolean;
  publishedDate: string;
  expiresDate?: string;
  targetAudience: 'All Patients' | 'OPD Only' | 'Staff Only';
}

export interface Department {
  id: string;
  name: string;
  code: string; // CARD, ORTH, NEUR, PEDI
  description: string;
  headOfDepartment: string;
  location: string; // e.g. Building A, Floor 2
  contactExtension: string;
  iconName: string;
  activeDoctorsCount?: number;
  isActive: boolean;
}

export interface MedicalService {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  description: string;
  standardFee: number;
  estimatedDuration: string;
  isEmergencyAvailable: boolean;
  isActive: boolean;
}

export interface HospitalSettings {
  hospitalName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  city: string;
  country: string;
  mainPhone: string;
  emergencyHotline: string;
  email: string;
  websiteUrl: string;
  googleMapsEmbedUrl?: string;
  currency: string; // PKR
  currencySymbol: string; // Rs.
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branchCode: string;
    instructions: string;
  };
  openingHours: {
    emergency: string;
    opdWeekdays: string;
    opdSaturday: string;
    opdSunday: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  policies: {
    appointmentBookingWindowDays: number;
    cancellationNoticeHours: number;
    paymentVerificationGracePeriodHours: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  userRole: string;
  action: string; // e.g. 'Appointment Cancelled', 'Doctor Updated', 'Payment Approved'
  module: 'Appointments' | 'Doctors' | 'Payments' | 'Payroll' | 'Staff' | 'Settings' | 'CMS';
  targetId?: string;
  details: string;
  ipAddress?: string;
}

export interface HospitalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  timestamp: string;
  isRead: boolean;
  link?: string;
}
export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: 'New' | 'Answered';
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface Review {
  id: string;
  patientName: string;
  rating: number; // 1-5
  comment: string;
  doctorName?: string;
  status: 'Pending' | 'Approved' | 'Hidden';
  isPinned: boolean;
  isVerified: boolean;
  reply?: string;
  createdAt: string;
}