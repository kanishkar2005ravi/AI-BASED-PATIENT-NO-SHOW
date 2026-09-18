import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { callBackend, normalizeAppointment } from '../../services/api';
import { Doctor, Appointment } from '../../types';
import { Calendar, Clock, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatTime, getLocalDateString, getSlotAvailabilityStatus } from '../../utils/helpers';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotFetchError, setSlotFetchError] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('Routine Checkup');

  // Booking Result
  const [bookingResult, setBookingResult] = useState<Appointment | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingDoctors(true);
    callBackend({ action: 'GET_DOCTORS' }).then(res => {
      if (isMounted) {
        if (res.success && Array.isArray(res.data)) {
          const activeDocs = res.data.filter((d: Doctor) => d.status === 'Active');
          setDoctors(activeDocs);
          if (activeDocs.length > 0) {
            setSelectedDoctorId(activeDocs[0].id);
          }
        }
        setLoadingDoctors(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 25 slots per doctor per day (20 mins each)
  const ALL_25_SLOTS = useMemo(() => [
    // Morning Part 1 (5 slots: 09:00 - 10:40)
    '09:00', '09:20', '09:40', '10:00', '10:20',
    // Morning Part 2 (3 slots: 11:00 - 12:00)
    '11:00', '11:20', '11:40',
    // Afternoon (6 slots: 14:00 - 16:00)
    '14:00', '14:20', '14:40', '15:00', '15:20', '15:40',
    // Evening (11 slots: 16:20 - 20:00)
    '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40'
  ], []);

  const bookedSet = useMemo(() => new Set(bookedTimeSlots), [bookedTimeSlots]);

  // Fetch real-time appointments from Supabase/backend to detect booked slots
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctorId) return;
    setLoadingSlots(true);
    setSlotFetchError(null);
    try {
      const res = await callBackend({ action: 'GET_APPOINTMENTS', data: { doctorId: selectedDoctorId } });
      if (res.success && Array.isArray(res.data)) {
        const booked = res.data
          .filter((a: Appointment) => {
            const aDocId = a.doctorId || (a as any).doctor_id;
            const aDate = (a.appointmentDate || (a as any).appointment_date || '').trim();
            const isDocMatch = aDocId === selectedDoctorId;
            const isDateMatch = aDate === selectedDate;
            const isActive = a.status !== 'CANCELLED';
            return isDocMatch && isDateMatch && isActive;
          })
          .map((a: Appointment) => {
            const rawTime = (a.appointmentTime || (a as any).appointment_time || '').trim();
            return rawTime.length >= 5 ? rawTime.slice(0, 5) : rawTime;
          });

        setBookedTimeSlots(booked);

        const currentBookedSet = new Set(booked);
        const now = new Date();

        // Check if currently selected slot is available
        const currentSlotStatus = selectedTimeSlot ? getSlotAvailabilityStatus(selectedTimeSlot, selectedDate, currentBookedSet, now) : 'UNAVAILABLE';
        if (currentSlotStatus !== 'AVAILABLE') {
          const firstAvailable = ALL_25_SLOTS.find(slot => getSlotAvailabilityStatus(slot, selectedDate, currentBookedSet, now) === 'AVAILABLE');
          setSelectedTimeSlot(firstAvailable || '');
        }
      } else {
        setSlotFetchError(res.message || 'Unable to retrieve real-time slot availability from the server.');
      }
    } catch (err: any) {
      setSlotFetchError(err?.message || 'Error connecting to appointment service.');
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctorId, selectedDate, selectedTimeSlot, ALL_25_SLOTS]);

  useEffect(() => {
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const now = new Date();
  const availableCount = ALL_25_SLOTS.filter(s => getSlotAvailabilityStatus(s, selectedDate, bookedSet, now) === 'AVAILABLE').length;

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      showToast('Please select a doctor, date, and available time slot.', 'error');
      return;
    }

    setBookingLoading(true);

    // 1. Fresh pre-flight check from backend to prevent race condition (double booking)
    try {
      const preCheck = await callBackend({ action: 'GET_APPOINTMENTS', data: { doctorId: selectedDoctorId } });
      if (preCheck.success && Array.isArray(preCheck.data)) {
        const conflict = preCheck.data.some((a: Appointment) => {
          const aDocId = a.doctorId || (a as any).doctor_id;
          const aDate = (a.appointmentDate || (a as any).appointment_date || '').trim();
          const aTime = (a.appointmentTime || (a as any).appointment_time || '').trim().slice(0, 5);
          return aDocId === selectedDoctorId && aDate === selectedDate && aTime === selectedTimeSlot && a.status !== 'CANCELLED';
        });

        if (conflict) {
          setBookingLoading(false);
          showToast('This slot was just booked by another patient. Please choose another slot.', 'error');
          fetchSlots();
          return;
        }
      }
    } catch (e) {
      console.warn('Pre-check availability warning:', e);
    }

    const bookingPayload = {
      patient_id: user?.id || 'PAT-1',
      patientId: user?.id || 'PAT-1',
      doctor_id: selectedDoctorId,
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor?.name || '',
      doctor_name: selectedDoctor?.name || '',
      doctorSpecialization: selectedDoctor?.specialization || '',
      doctor_specialization: selectedDoctor?.specialization || '',
      appointment_date: selectedDate,
      appointmentDate: selectedDate,
      appointment_time: selectedTimeSlot,
      appointmentTime: selectedTimeSlot,
      reason: appointmentType,
      appointmentType,
      email: user?.email || '',
      patientEmail: user?.email || '',
      patient_email: user?.email || '',
      phone: user?.phone || '',
      patientPhone: user?.phone || '',
      patient_phone: user?.phone || '',
      patientName: user?.name || '',
      patient_name: user?.name || '',
      name: user?.name || ''
    };

function extractBookingResponse(res: any): { isSuccess: boolean; appointmentId?: string; appointmentData?: any; message?: string } {
  if (!res) return { isSuccess: false };

  // Explicit failure check
  if (res.success === false && !res.items && !res._responseData && !res.data) {
    return { isSuccess: false, message: res.message || res.error };
  }

  let isSuccess = false;
  let extractedId: string | undefined = undefined;
  let extractedData: any = null;
  let extractedMessage: string = (res.message && typeof res.message === 'string') ? res.message : '';

  // 1. Direct checks on root
  if (res.success === true || res.status === 'success' || res.status === 200 || res.status === 201) {
    isSuccess = true;
  }
  if (res.id || res.appointment_id || res.appointmentId) {
    extractedId = (res.id || res.appointment_id || res.appointmentId).toString();
  }
  if (res.appointment && typeof res.appointment === 'object') {
    extractedData = res.appointment;
    extractedId = extractedId || res.appointment.id || res.appointment.appointment_id || res.appointment.appointmentId;
  }
  if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
    extractedData = extractedData || res.data;
    extractedId = extractedId || res.data.id || res.data.appointment_id || res.data.appointmentId;
  }

  // 2. Deep recursive search into nested objects (items, json, _responseData, data)
  const inspectNode = (node: any, depth = 0) => {
    if (!node || typeof node !== 'object' || depth > 6) return;

    if (node.success === true || node.status === 'success' || node._responseCode === 200 || node._responseCode === 201) {
      isSuccess = true;
    }
    if (node.message && typeof node.message === 'string') {
      extractedMessage = extractedMessage || node.message;
    }
    if (node.id || node.appointment_id || node.appointmentId) {
      extractedId = extractedId || (node.id || node.appointment_id || node.appointmentId).toString();
    }
    if (node.appointment && typeof node.appointment === 'object') {
      extractedData = extractedData || node.appointment;
      extractedId = extractedId || node.appointment.id || node.appointment.appointment_id || node.appointment.appointmentId;
    }

    if (node._responseData) inspectNode(node._responseData, depth + 1);
    if (node.json) inspectNode(node.json, depth + 1);
    if (node.data) inspectNode(node.data, depth + 1);
    if (Array.isArray(node.items)) {
      for (const it of node.items) {
        inspectNode(it, depth + 1);
      }
    }
    if (Array.isArray(node)) {
      for (const it of node) {
        inspectNode(it, depth + 1);
      }
    }
  };

  inspectNode(res);

  // If no explicit error and we received a response, treat as success if not explicitly false
  if (!isSuccess && res.success !== false && !res.error && res.status !== 'error') {
    isSuccess = true;
  }

  return {
    isSuccess,
    appointmentId: extractedId,
    appointmentData: extractedData,
    message: extractedMessage || 'Appointment booked successfully!'
  };
}

    let res: any;
    try {
      res = await callBackend({
        action: 'BOOK_APPOINTMENT',
        data: bookingPayload
      });
    } catch (err) {
      console.error('[BOOK_APPOINTMENT] callBackend exception:', err);
      res = { success: false, error: String(err) };
    }

    setBookingLoading(false);

    // Extract booking success using safe helper supporting all response shapes
    const parsed = extractBookingResponse(res);

    if (parsed.isSuccess) {
      const respApt = res?.appointment || res?.data || parsed.appointmentData || {};
      const confirmedAppointment: Appointment = normalizeAppointment({
        ...bookingPayload,
        ...(typeof respApt === 'object' ? respApt : {}),
        id: parsed.appointmentId || respApt.id || (bookingPayload as any).id || undefined,
        doctorName: selectedDoctor?.name || respApt?.doctorName || bookingPayload.doctorName,
        doctorSpecialization: selectedDoctor?.specialization || respApt?.doctorSpecialization || bookingPayload.doctorSpecialization,
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        appointmentType: appointmentType
      });

      setBookingResult(confirmedAppointment);
      setStep(3);
      showToast(parsed.message || 'Appointment booked successfully!', 'success');
      // Refresh real-time slots immediately from backend
      fetchSlots();
    } else {
      showToast(res?.message || res?.error || parsed.message || 'Unable to complete appointment booking.', 'error');
      fetchSlots();
    }
  };

  const renderSlotButton = (tStr: string) => {
    const status = getSlotAvailabilityStatus(tStr, selectedDate, bookedSet, now);
    const isBooked = status === 'BOOKED';
    const isUnavailable = status === 'UNAVAILABLE';
    const isAvailable = status === 'AVAILABLE';
    const isSelected = selectedTimeSlot === tStr;

    return (
      <button
        type="button"
        key={tStr}
        disabled={!isAvailable}
        onClick={() => {
          if (isAvailable) setSelectedTimeSlot(tStr);
        }}
        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 ${
          isBooked
            ? 'bg-rose-50 text-rose-700 border-rose-200 cursor-not-allowed opacity-85'
            : isUnavailable
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            : isSelected
            ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-600/20 cursor-pointer'
            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer'
        }`}
      >
        <span>{formatTime(tStr)}</span>
        {isBooked ? (
          <span className="text-[9px] font-black text-rose-600 bg-rose-100/90 px-1.5 py-0.5 rounded">BOOKED</span>
        ) : isUnavailable ? (
          <span className="text-[9px] font-semibold text-slate-400">PAST</span>
        ) : isSelected ? (
          <span className="text-[9px] font-bold text-teal-100">SELECTED</span>
        ) : (
          <span className="text-[9px] font-bold text-teal-600">AVAILABLE</span>
        )}
      </button>
    );
  };

  if (loadingDoctors) {
    return (
      <div>
        <Header title="Book Consultation" />
        <div className="py-20">
          <Loading message="Loading available physicians & scheduling grid..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title={t('book.title')} />

      {/* ⬅️ BACK TO DASHBOARD BUTTON ⬅️ */}
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600 group-hover:-translate-x-1 transition-transform" />
          <span>{t('dashboard.back_to_dashboard')}</span>
        </button>
      </div>

      {/* 📋 CANCELLATION & RESCHEDULE POLICY NOTE 📋 */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-start space-x-3.5 max-w-3xl mx-auto">
        <div className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-extrabold text-xs uppercase tracking-wider flex-shrink-0 shadow-xs mt-0.5">
          {t('note.label')}
        </div>
        <div className="text-xs text-slate-700 font-medium leading-relaxed">
          <p className="font-extrabold text-slate-900 text-sm mb-0.5">{t('note.policy_title')}</p>
          <p className="text-slate-600 text-xs">
            {t('note.policy_desc')}
          </p>
        </div>
      </div>

      {/* Progress Wizard Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between max-w-3xl mx-auto">
        <div className={`flex items-center space-x-2 text-xs font-bold ${step >= 1 ? 'text-teal-700' : 'text-slate-400'}`}>
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">1</span>
          <span>{t('book.step1')}</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className={`flex items-center space-x-2 text-xs font-bold ${step >= 2 ? 'text-teal-700' : 'text-slate-400'}`}>
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">2</span>
          <span>{t('book.step2')}</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className={`flex items-center space-x-2 text-xs font-bold ${step === 3 ? 'text-teal-700' : 'text-slate-400'}`}>
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">3</span>
          <span>{t('book.step3')}</span>
        </div>
      </div>

      {/* STEP 1: Select Doctor, Date, Slot & Type */}
      {step === 1 && (
        <Card title={t('book.title')} className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {t('book.choose_doctor')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc, idx) => {
                  const docColors = [
                    { bg: 'bg-amber-100 text-amber-900', border: 'border-amber-500 bg-amber-50/60 ring-amber-500/20', text: 'text-amber-700' },
                    { bg: 'bg-blue-100 text-blue-900', border: 'border-blue-500 bg-blue-50/60 ring-blue-500/20', text: 'text-blue-700' },
                    { bg: 'bg-purple-100 text-purple-900', border: 'border-purple-500 bg-purple-50/60 ring-purple-500/20', text: 'text-purple-700' },
                    { bg: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-500 bg-emerald-50/60 ring-emerald-500/20', text: 'text-emerald-700' },
                    { bg: 'bg-rose-100 text-rose-900', border: 'border-rose-500 bg-rose-50/60 ring-rose-500/20', text: 'text-rose-700' },
                    { bg: 'bg-pink-100 text-pink-900', border: 'border-pink-500 bg-pink-50/60 ring-pink-500/20', text: 'text-pink-700' }
                  ][idx % 6];

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3.5 ${
                        selectedDoctorId === doc.id
                          ? `${docColors.border} ring-2 shadow-sm font-bold`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl ${docColors.bg} flex items-center justify-center font-black text-base shadow-xs`}>
                        {doc.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{doc.name}</h4>
                        <p className={`text-xs font-bold ${docColors.text}`}>{doc.specialization}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('book.preferred_date')}
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={e => setSelectedDate(e.target.value)}
                required
              />

              <Select
                label={t('book.visit_purpose')}
                value={appointmentType}
                onChange={e => setAppointmentType(e.target.value)}
                options={[
                  { value: 'Routine Checkup', label: 'Routine Checkup' },
                  { value: 'Follow-up', label: 'Follow-up' },
                  { value: 'Consultation', label: 'Consultation' },
                  { value: 'Emergency', label: 'Emergency' },
                  { value: 'Specialist Assessment', label: 'Specialist Assessment' }
                ]}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Select Time Slot (25 Slots Daily)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    availableCount > 0 ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    {availableCount} / 25 Available
                  </span>
                  <button
                    type="button"
                    onClick={fetchSlots}
                    disabled={loadingSlots}
                    className="p-1 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-all"
                    title="Refresh Slot Availability"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSlots ? 'animate-spin text-teal-600' : ''}`} />
                  </button>
                </div>
              </div>

              {slotFetchError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{slotFetchError}</span>
                  </div>
                  <button
                    onClick={fetchSlots}
                    className="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loadingSlots ? (
                <p className="text-xs text-slate-500 italic py-3">Verifying live real-time slot availability for {selectedDoctor?.name}...</p>
              ) : (
                <div className="space-y-4">
                  {/* Morning Session Part 1 (5 Slots: 09:00 - 10:40 AM) */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" /> Morning Session (9:00 AM – 10:40 AM &bull; 5 Slots)
                    </h5>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {ALL_25_SLOTS.slice(0, 5).map(renderSlotButton)}
                    </div>
                  </div>

                  {/* ☕ Morning Tea Break Banner: 10:40 AM - 11:00 AM */}
                  <div className="py-2 px-3 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs font-semibold text-amber-900 flex items-center justify-center space-x-2">
                    <span>☕ 10:40 AM – 11:00 AM Morning Tea Break</span>
                  </div>

                  {/* Morning Session Part 2 (3 Slots: 11:00 AM - 12:00 PM) */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" /> Late Morning Session (11:00 AM – 12:00 PM &bull; 3 Slots)
                    </h5>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {ALL_25_SLOTS.slice(5, 8).map(renderSlotButton)}
                    </div>
                  </div>

                  {/* 🍱 Lunch Break Banner: 12:00 PM - 2:00 PM */}
                  <div className="py-2 px-3 bg-slate-100 rounded-xl border border-slate-200 text-center text-xs font-semibold text-slate-600 flex items-center justify-center space-x-2">
                    <span>🍱 12:00 PM – 02:00 PM Lunch Break (Doctor Unavailable &bull; 2 Hours)</span>
                  </div>

                  {/* Afternoon Session (6 Slots: 02:00 PM - 04:00 PM) */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Afternoon Session (2:00 PM – 4:00 PM &bull; 6 Slots)
                    </h5>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {ALL_25_SLOTS.slice(8, 14).map(renderSlotButton)}
                    </div>
                  </div>

                  {/* ☕ Evening Tea Break Banner: 04:00 PM - 04:20 PM */}
                  <div className="py-2 px-3 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs font-semibold text-amber-900 flex items-center justify-center space-x-2">
                    <span>☕ 04:00 PM – 04:20 PM Evening Tea Break</span>
                  </div>

                  {/* Evening Session (11 Slots: 04:20 PM - 08:00 PM) */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-purple-600" /> Evening Session (4:20 PM – 8:00 PM &bull; 11 Slots)
                    </h5>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {ALL_25_SLOTS.slice(14).map(renderSlotButton)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedTimeSlot || availableCount === 0 || loadingSlots || !!slotFetchError}
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(2)}
              >
                {t('book.next_step')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Review Booking */}
      {step === 2 && selectedDoctor && (
        <Card title={t('book.step2')} className="max-w-2xl mx-auto space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-semibold">{t('label.doctor')}</span>
              <span className="text-sm font-bold text-slate-900">{selectedDoctor.name} ({selectedDoctor.specialization})</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-semibold">{t('label.date')} & {t('label.time')}</span>
              <span className="text-sm font-bold text-slate-900">{selectedDate} at {formatTime(selectedTimeSlot)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold">{t('label.reason')}</span>
              <span className="text-sm font-bold text-slate-900">{appointmentType}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(1)}>
              {t('book.prev_step')}
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={bookingLoading}
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleConfirmBooking}
            >
              {t('book.confirm_button')}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Booking Success */}
      {step === 3 && bookingResult && (
        <Card className="max-w-2xl mx-auto text-center p-8 border-2 border-emerald-500/40 bg-gradient-to-br from-white to-emerald-50/20 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">{t('book.step3')}</h2>
          <p className="text-xs text-slate-600 mt-2 mb-4">Your reservation with {bookingResult.doctorName} for {bookingResult.appointmentDate} at {formatTime(bookingResult.appointmentTime)} has been confirmed by the backend.</p>

          {/* Structured Confirmation Details */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 max-w-md mx-auto mb-6 text-left space-y-2.5 text-xs shadow-xs">
            {bookingResult.id && (
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">{t('appointments.col_id') || 'Appointment ID'}</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg">{bookingResult.id}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-semibold">{t('label.doctor')}</span>
              <span className="font-bold text-slate-900">{bookingResult.doctorName} {bookingResult.doctorSpecialization ? `(${bookingResult.doctorSpecialization})` : ''}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-semibold">{t('label.date')}</span>
              <span className="font-bold text-slate-900">{bookingResult.appointmentDate}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-semibold">{t('label.time')}</span>
              <span className="font-bold text-slate-900">{formatTime(bookingResult.appointmentTime)} ({bookingResult.appointmentTime})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">{t('label.reason')}</span>
              <span className="font-bold text-slate-900">{bookingResult.appointmentType}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button variant="primary" onClick={() => navigate('/patient/dashboard')}>
              {t('nav.dashboard')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/patient/appointments')}>
              {t('nav.my_appointments')}
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
