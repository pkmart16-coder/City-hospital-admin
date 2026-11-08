/**
 * Utility functions for City Hospital Admin Portal
 */

export const formatPKR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
};

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (isoString: string | undefined | null): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return isoString;
  }
};

export const generateBookingRef = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CH-2026-${random}`;
};

export const generateReceiptNumber = (): string => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `RCP-2026-${random}`;
};

export const generateSalaryVoucher = (month = '10'): string => {
  const random = Math.floor(100 + Math.random() * 900);
  return `SAL-2026-${month}-${random}`;
};

export const generateEmployeeId = (): string => {
  const random = Math.floor(100 + Math.random() * 900);
  return `EMP-${random}`;
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
