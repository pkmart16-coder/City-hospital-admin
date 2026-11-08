import React, { useState } from 'react';
import { Printer, X, Download } from 'lucide-react';
import { Appointment, HospitalSettings } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

interface AppointmentSlipProps {
  appointment: Appointment;
  settings: HospitalSettings;
  isOpen: boolean;
  onClose: () => void;
  isReprint?: boolean;
}

export const AppointmentSlip: React.FC<AppointmentSlipProps> = ({
  appointment,
  settings,
  isOpen,
  onClose,
  isReprint = false
}) => {
  const [layoutMode, setLayoutMode] = useState<'a4' | 'thermal'>('a4');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isReprint ? 'Reprint Appointment Slip' : 'Print Appointment Slip'}
            </h3>
            <p className="text-xs text-slate-500">
              Reference: {appointment.bookingReference} · Mode: {layoutMode === 'a4' ? 'A4 Standard' : 'Thermal POS'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Layout switch */}
            <div className="flex items-center p-0.5 bg-slate-200 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setLayoutMode('a4')}
                className={`px-2.5 py-1 rounded-md transition-colors ${layoutMode === 'a4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                A4 Standard
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('thermal')}
                className={`px-2.5 py-1 rounded-md transition-colors ${layoutMode === 'thermal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Thermal Slip (80mm)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Slip
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-8 overflow-y-auto bg-slate-100 flex justify-center">
          {layoutMode === 'a4' ? (
            /* A4 Document View */
            <div 
              id="printable-slip" 
              className="w-full max-w-2xl bg-white p-8 border border-slate-300 shadow-md text-slate-900 print:m-0 print:p-6 print:border-none print:shadow-none print:w-full"
            >
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl rounded-lg">
                    CH
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                      {settings.hospitalName}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      {settings.tagline}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {settings.address} · Tel: {settings.mainPhone}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 text-xs font-bold tracking-wider rounded-sm uppercase">
                    OPD Appointment Slip
                  </div>
                  {isReprint && (
                    <p className="text-[10px] font-bold text-rose-600 mt-1 uppercase tracking-wide">
                      ** DUPLICATE / REPRINT **
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    Token #{appointment.timeSlotIndex ? `T-${appointment.timeSlotIndex}` : 'GEN-01'}
                  </p>
                </div>
              </div>

              {/* Booking Reference Bar */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 border-b border-slate-200 py-3 px-4 my-4 rounded-sm text-xs">
                <div>
                  <span className="text-slate-500 block">Booking Reference:</span>
                  <span className="font-bold font-mono text-sm text-slate-900">{appointment.bookingReference}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Issued Date:</span>
                  <span className="font-semibold text-slate-900">{formatDate(new Date().toISOString())}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Counter / Station:</span>
                  <span className="font-semibold text-slate-900">Central OPD Desk</span>
                </div>
              </div>

              {/* Patient Details & Doctor Details (2 Columns) */}
              <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                    Patient Information
                  </h4>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="col-span-2 font-bold text-slate-900 text-sm">{appointment.patientName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Contact:</span>
                    <span className="col-span-2 font-medium text-slate-800">{appointment.patientPhone}</span>
                  </div>
                  {appointment.patientAge && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-slate-500">Age / Gender:</span>
                      <span className="col-span-2 font-medium text-slate-800">
                        {appointment.patientAge} Years · {appointment.patientGender || '—'}
                      </span>
                    </div>
                  )}
                  {appointment.patientCnic && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-slate-500">CNIC / ID:</span>
                      <span className="col-span-2 font-mono text-slate-800">{appointment.patientCnic}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                    Consultant & Schedule
                  </h4>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="col-span-2 font-bold text-slate-900 text-sm">{appointment.doctorName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Department:</span>
                    <span className="col-span-2 font-medium text-slate-800">{appointment.departmentName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Appt Date:</span>
                    <span className="col-span-2 font-bold text-teal-700">{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Time Slot:</span>
                    <span className="col-span-2 font-bold text-slate-900">{appointment.appointmentTime}</span>
                  </div>
                </div>
              </div>

              {/* Financial Section */}
              <div className="py-4 border-b border-slate-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <th className="text-left py-1.5 font-semibold">Description</th>
                      <th className="text-center py-1.5 font-semibold">Payment Status</th>
                      <th className="text-center py-1.5 font-semibold">Method</th>
                      <th className="text-right py-1.5 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 font-semibold text-slate-900">
                        OPD Specialist Consultation Fee
                      </td>
                      <td className="py-2.5 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          appointment.paymentStatus === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : appointment.paymentStatus === 'Pending Verification'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {appointment.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-slate-700">
                        {appointment.paymentMethod || 'On-site Desk'}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatPKR(appointment.consultationFee)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right py-2 font-bold text-slate-700">
                        Paid Amount:
                      </td>
                      <td className="text-right py-2 font-mono font-bold text-emerald-700 text-sm">
                        {formatPKR(appointment.paidAmount || 0)}
                      </td>
                    </tr>
                    {appointment.consultationFee > (appointment.paidAmount || 0) && (
                      <tr>
                        <td colSpan={3} className="text-right py-1 font-bold text-rose-700">
                          Balance Due at Counter:
                        </td>
                        <td className="text-right py-1 font-mono font-bold text-rose-700 text-sm">
                          {formatPKR(appointment.consultationFee - (appointment.paidAmount || 0))}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              {/* Instructions & Policies */}
              <div className="pt-4 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Important Instructions for Patients:
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-500">
                  <li>Please arrive 15 minutes prior to your scheduled consultation time.</li>
                  <li>Present this slip at OPD reception counter for patient vitals checking.</li>
                  <li>Bring previous medical reports, prescriptions and diagnostic investigations.</li>
                  <li>In case of emergency rescheduling, call hospital helpline at {settings.emergencyHotline}.</li>
                </ul>
              </div>

              {/* Verification & Signatures Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                <div>
                  <p>Authorized Staff: <span className="font-semibold text-slate-800">{appointment.paymentReceivedBy || 'Central Reception'}</span></p>
                  <p className="text-[10px] mt-0.5">System Generated Document · No signature required</p>
                </div>
                <div className="text-right">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span className="text-[10px]">Doctor / Officer Stamp</span>
                </div>
              </div>
            </div>
          ) : (
            /* Compact Thermal Receipt Mode (80mm) */
            <div 
              id="printable-slip"
              className="w-80 bg-white p-5 border border-slate-400 shadow-md text-slate-900 font-mono text-xs print:m-0 print:p-2 print:border-none print:shadow-none print:w-full"
            >
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <h2 className="font-bold text-sm uppercase">{settings.hospitalName}</h2>
                <p className="text-[10px] text-slate-600">{settings.address}</p>
                <p className="text-[10px] text-slate-600">TEL: {settings.mainPhone}</p>
                <div className="mt-2 font-bold text-xs uppercase bg-slate-100 py-1">
                  APPOINTMENT TOKEN
                </div>
                {isReprint && <p className="text-[10px] text-rose-600 font-bold mt-1">** DUPLICATE REPRINT **</p>}
              </div>

              <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>REF:</span>
                  <span className="font-bold">{appointment.bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{appointment.appointmentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIME:</span>
                  <span className="font-bold">{appointment.appointmentTime}</span>
                </div>
              </div>

              <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-[11px]">
                <div>
                  <span className="text-slate-500">PATIENT:</span>
                  <p className="font-bold text-xs">{appointment.patientName}</p>
                  <p className="text-[10px]">{appointment.patientPhone}</p>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500">CONSULTANT:</span>
                  <p className="font-bold">{appointment.doctorName}</p>
                  <p className="text-[10px]">{appointment.departmentName}</p>
                </div>
              </div>

              <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>FEE:</span>
                  <span>{formatPKR(appointment.consultationFee)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>PAID:</span>
                  <span>{formatPKR(appointment.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="uppercase font-bold">{appointment.paymentStatus}</span>
                </div>
              </div>

              <div className="pt-3 text-center text-[10px] text-slate-500 space-y-1">
                <p>Please arrive 15 minutes before slot.</p>
                <p>Thank you for choosing City Hospital.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
