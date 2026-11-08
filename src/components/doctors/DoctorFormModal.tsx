import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { Doctor, DoctorWeeklySchedule } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { Check, X, Plus, Trash2 } from 'lucide-react';

interface DoctorFormModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

const defaultWeeklySchedule: DoctorWeeklySchedule[] = [
  { day: 'Monday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
  { day: 'Tuesday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
  { day: 'Wednesday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
  { day: 'Thursday', enabled: true, slots: [{ startTime: '09:00', endTime: '13:00' }] },
  { day: 'Friday', enabled: true, slots: [{ startTime: '09:00', endTime: '12:30' }] },
  { day: 'Saturday', enabled: false, slots: [] },
  { day: 'Sunday', enabled: false, slots: [] }
];

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  doctor,
  isOpen,
  onClose
}) => {
  const { departments, saveDoctor } = useHospital();

  const [title, setTitle] = useState('Dr.');
  const [name, setName] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [biography, setBiography] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [roomNumber, setRoomNumber] = useState('');
  const [consultationFee, setConsultationFee] = useState(3000);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(20);
  const [isActive, setIsActive] = useState(true);
  const [isAvailableToday, setIsAvailableToday] = useState(true);
  const [isPublicVisible, setIsPublicVisible] = useState(true);
  const [weeklySchedule, setWeeklySchedule] = useState<DoctorWeeklySchedule[]>(defaultWeeklySchedule);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctor) {
      setTitle(doctor.title);
      setName(doctor.name);
      setQualifications(doctor.qualifications);
      setSpecialization(doctor.specialization);
      setDepartmentId(doctor.departmentId);
      setEmail(doctor.email);
      setPhone(doctor.phone);
      setPhotoUrl(doctor.photoUrl);
      setBiography(doctor.biography);
      setExperienceYears(doctor.experienceYears);
      setRoomNumber(doctor.roomNumber);
      setConsultationFee(doctor.consultationFee);
      setSlotDurationMinutes(doctor.slotDurationMinutes);
      setIsActive(doctor.isActive);
      setIsAvailableToday(doctor.isAvailableToday ?? true);
      setIsPublicVisible(doctor.isPublicVisible);
      setWeeklySchedule(doctor.weeklySchedule.length > 0 ? doctor.weeklySchedule : defaultWeeklySchedule);
    } else {
      setTitle('Dr.');
      setName('');
      setQualifications('');
      setSpecialization('');
      setDepartmentId(departments[0]?.id || 'dept-general');
      setEmail('');
      setPhone('');
      setPhotoUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80');
      setBiography('');
      setExperienceYears(8);
      setRoomNumber('OPD Room 101');
      setConsultationFee(3000);
      setSlotDurationMinutes(20);
      setIsActive(true);
      setIsAvailableToday(true);
      setIsPublicVisible(true);
      setWeeklySchedule(defaultWeeklySchedule);
    }
  }, [doctor, departments, isOpen]);

  const handleToggleDay = (dayIndex: number) => {
    setWeeklySchedule(prev => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        enabled: !copy[dayIndex].enabled,
        slots: !copy[dayIndex].enabled && copy[dayIndex].slots.length === 0 
          ? [{ startTime: '09:00', endTime: '13:00' }] 
          : copy[dayIndex].slots
      };
      return copy;
    });
  };

  const handleSlotChange = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', val: string) => {
    setWeeklySchedule(prev => {
      const copy = [...prev];
      const slots = [...copy[dayIndex].slots];
      slots[slotIndex] = { ...slots[slotIndex], [field]: val };
      copy[dayIndex] = { ...copy[dayIndex], slots };
      return copy;
    });
  };

  const handleAddSlot = (dayIndex: number) => {
    setWeeklySchedule(prev => {
      const copy = [...prev];
      const slots = [...copy[dayIndex].slots, { startTime: '15:00', endTime: '18:00' }];
      copy[dayIndex] = { ...copy[dayIndex], slots };
      return copy;
    });
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    setWeeklySchedule(prev => {
      const copy = [...prev];
      const slots = copy[dayIndex].slots.filter((_, idx) => idx !== slotIndex);
      copy[dayIndex] = { ...copy[dayIndex], slots };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Doctor name is required.');
      return;
    }

    const dept = departments.find(d => d.id === departmentId);

    try {
      setIsSaving(true);
      await saveDoctor({
        id: doctor?.id,
        title,
        name: name.trim(),
        qualifications: qualifications.trim(),
        specialization: specialization.trim(),
        departmentId,
        departmentName: dept?.name || 'General Medicine',
        email: email.trim(),
        phone: phone.trim(),
        photoUrl: photoUrl.trim(),
        biography: biography.trim(),
        experienceYears,
        roomNumber: roomNumber.trim(),
        consultationFee,
        slotDurationMinutes,
        isActive,
        isAvailableToday,
        scheduleConfigured: true,
        weeklySchedule,
        isPublicVisible
      });
      setIsSaving(false);
      onClose();
    } catch (err: unknown) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : 'Failed to save doctor');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doctor ? `Edit Doctor: ${doctor.title} ${doctor.name}` : 'Add New Consultant Doctor'}
      subtitle="Configure clinical credentials, working days, time slots and consultation fee"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Dr.">Dr.</option>
              <option value="Prof. Dr.">Prof. Dr.</option>
              <option value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</option>
              <option value="Asst. Prof. Dr.">Asst. Prof. Dr.</option>
              <option value="Consultant">Consultant</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tariq Mahmood"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Qualifications & Degrees
            </label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="e.g. MBBS, FCPS (Cardiology), FACC (USA)"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Interventional Cardiologist"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Consultation Fee (PKR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Room / Location
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Suite 301, Heart Centre"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Slot Duration (Minutes)
            </label>
            <select
              value={slotDurationMinutes}
              onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Photo URL / Storage
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Active Profile</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailableToday}
              onChange={(e) => setIsAvailableToday(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-semibold text-teal-700 dark:text-teal-400">Available Today (Green Tick)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublicVisible}
              onChange={(e) => setIsPublicVisible(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Visible on Public Website</span>
          </label>
        </div>

        {/* Weekly Schedule & Slots Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Weekly OPD Schedule & Time Slots
            </h4>
            <span className="text-[11px] text-slate-500">
              Configure active clinic days and slot ranges
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {weeklySchedule.map((dayItem, dayIdx) => (
              <div 
                key={dayItem.day}
                className={`p-2.5 rounded-lg border text-xs transition-colors ${
                  dayItem.enabled 
                    ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700' 
                    : 'bg-slate-100/60 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-white">
                    <input
                      type="checkbox"
                      checked={dayItem.enabled}
                      onChange={() => handleToggleDay(dayIdx)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>{dayItem.day}</span>
                  </label>

                  {dayItem.enabled && (
                    <button
                      type="button"
                      onClick={() => handleAddSlot(dayIdx)}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Slot
                    </button>
                  )}
                </div>

                {dayItem.enabled && (
                  <div className="mt-2 space-y-1.5 pl-5">
                    {dayItem.slots.map((slot, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Shift {sIdx + 1}:</span>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(dayIdx, sIdx, 'startTime', e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(dayIdx, sIdx, 'endTime', e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        />
                        {dayItem.slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(dayIdx, sIdx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Clinical Biography & Background
          </label>
          <textarea
            rows={3}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            placeholder="Specialist medical background, fellowship credentials, publications..."
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : doctor ? 'Update Doctor' : 'Save Doctor Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
