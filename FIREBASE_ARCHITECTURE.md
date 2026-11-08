# City Hospital Management System — Firebase Architecture & Integration Guide

This document specifies the shared Firestore architecture, collection schemas, security model, and integration contract between the **City Hospital Public Website** (Project 1) and the **City Hospital Admin Dashboard** (Project 2).

---

## 1. Firebase Project Identity

Both applications connect to the shared production Firebase project:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAiViLGS4-qPQg7WngNCP",
  authDomain: "city-hospital-f534f.firebaseapp.com",
  projectId: "city-hospital-f534f",
  storageBucket: "city-hospital-f534f.firebasestorage.app",
  messagingSenderId: "96664392162",
  appId: "1:96664392162:web:758e8d8f59b09efefc29bb",
  measurementId: "G-QKPPNKH9JL"
};
```

---

## 2. Shared Firestore Schema & Collections

| Collection | Description | Access Policy |
| :--- | :--- | :--- |
| `hospitalSettings/global` | Hospital identity, contact numbers, emergency hotline, Meezan bank details, booking rules | Public Read / Admin Write |
| `departments` | Clinical wings (Cardiology, Neurology, Pediatrics, etc.) | Public Read / Admin Write |
| `doctors` | Physician profiles, specialization, fees in PKR, room locations, weekly schedules | Public Read / Admin & Doctor Write |
| `appointments` | Patient appointments, booking refs (`CH-2026-XXXX`), visit & payment statuses | Restricted Read / Public Create / Staff Update |
| `paymentSubmissions` | Bank transfer receipts and transaction IDs uploaded by patients | Restricted Read (Accountants) / Public Create |
| `payments` | Immutable payment ledger for finalized receipts (`RCP-2026-XXXX`) | Restricted Read & Write (Accountant, Admin) |
| `expenses` | Hospital operational expenditures (medical supplies, utilities, equipment maintenance) | Restricted (Accountant, Admin) |
| `salaryRecords` | Employee and physician monthly payroll vouchers (`SAL-2026-10-XXX`) | Strictly Private (HR, Accountant, Super Admin) |
| `staff` | Hospital employees, employment status, shift hours, private compensation details | Strictly Private (HR, Super Admin) |
| `banners` | Promotional campaign hero banners and sliders | Public Read / Admin Write |
| `announcements` | Urgent health alerts, viral fever notices, and holiday schedules | Public Read / Admin Write |
| `auditLogs` | Authoritative security log of status changes, approvals, and user actions | Immutable / Admin Read Only |

---

## 3. Role-Based Permissions (RBAC) Matrix

| Permission | Super Admin | Hospital Admin | Receptionist | Doctor | Accountant | HR Manager |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `appointments.read` | ✅ | ✅ | ✅ | ✅ (Assigned only) | ✅ | ❌ |
| `appointments.create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `appointments.update` | ✅ | ✅ | ✅ | ✅ (Visit status) | ❌ | ❌ |
| `doctors.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `staff.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `payments.verify` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `payroll.read` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `payroll.manage` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `banners.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `users.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `reports.read` | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `settings.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Integration Contracts with Public Website

1. **Doctor Availability**: When marked unavailable in the admin panel, the public website booking engine disables their calendar slots.
2. **Bank Transfer Submissions**: Patient uploads receipt and transaction ID on the website -> lands in Admin `paymentSubmissions` queue -> Accountant verifies -> Appointment marked `Paid` & `Confirmed` -> Public booking tracker reflects `Confirmed`.
3. **Promotional Banners**: Newly created banners appear immediately on the website homepage within their scheduled start and expiry window.
4. **Staff Profiles**: Only employees with `isPublicVisible: true` are displayed on the public doctor & specialist directory. Confidential salaries and private employee records never leak to the client.

---

## 5. Deployment Instructions

1. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```
3. **Deploy Cloud Functions**:
   ```bash
   cd functions && npm install && npm run build
   firebase deploy --only functions
   ```
4. **Deploy Admin Web Portal**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
