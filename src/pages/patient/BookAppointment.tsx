import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { Doctor, TimeSlot, Appointment } from '../../types';
import { Calendar, Clock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatTime } from '../../utils/helpers';

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
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-10');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
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

  // Generate 25 slots per doctor per day (20 mins each with Morning & Evening Tea Breaks)
  // Morning: 09:00-10:40 (5 slots) + ☕ Tea Break 10:40-11:00 + 11:00-12:00 (3 slots) = 8 slots
  // Evening: 14:00-16:00 (6 slots) + ☕ Tea Break 16:00-16:20 + 16:20-20:00 (11 slots) = 17 slots
  // Total = 8 + 17 = 25 SLOTS PER DAY
  const ALL_25_SLOTS = [
    // Morning Part 1 (5 slots)
    '09:00', '09:20', '09:40', '10:00', '10:20',
    // Morning Part 2 (3 slots after 10:40 AM Tea Break)
    '11:00', '11:20', '11:40',
    // Evening Part 1 (6 slots after 12:00-14:00 Lunch Break)
    '14:00', '14:20', '14:40', '15:00', '15:20', '15:40',
    // Evening Part 2 (11 slots after 16:00 Tea Break)
    '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40'
  ];

  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);

  // Fetch Appointments to find Booked 20-minute slots for selected doctor & date
  useEffect(() => {
    if (!selectedDoctorId) return;
    setLoadingSlots(true);
    callBackend({ action: 'GET_APPOINTMENTS', data: { doctorId: selectedDoctorId } }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        const booked = res.data
          .filter((a: Appointment) => 
            a.doctorId === selectedDoctorId && 
            a.appointmentDate === selectedDate && 
            a.status !== 'CANCELLED'
          )
          .map((a: Appointment) => a.appointmentTime);
        
        setBookedTimeSlots(booked);

        // Find first available unbooked slot
        const firstAvailable = ALL_25_SLOTS.find(slot => !booked.includes(slot));
        if (firstAvailable) {
          setSelectedTimeSlot(firstAvailable);
        } else {
          setSelectedTimeSlot('');
        }
      } else {
        setBookedTimeSlots([]);
        setSelectedTimeSlot(ALL_25_SLOTS[0]);
      }
      setLoadingSlots(false);
    });
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      showToast('Please select a doctor, date, and available time slot.', 'error');
      return;
    }

    setBookingLoading(true);
    const res = await callBackend({
      action: 'BOOK_APPOINTMENT',
      data: {
        patient_id: user?.id || 'PAT-1001',
        patientId: user?.id || 'PAT-1001',
        doctor_id: selectedDoctorId,
        doctorId: selectedDoctorId,
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
      }
    });


    setBookingLoading(false);
    if (res.success) {
      setBookingResult(res.appointment || {
        id: `APT-${Date.now()}`,
        patientId: user?.id || 'PAT-001',
        patientName: user?.name || 'Kiran Raj',
        patientEmail: user?.email || 'patient@example.com',
        doctorId: selectedDoctorId,
        doctorName: selectedDoctor?.name || 'Doctor',
        doctorSpecialization: selectedDoctor?.specialization || 'Medicine',
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        appointmentType: appointmentType as any,
        status: 'CONFIRMED',
        risk: { level: 'LOW', probability: 0.15, factors: [] },
        confirmedByPatient: true,
        createdAt: new Date().toISOString()
      });
      setStep(3);
      showToast(res.message || 'Appointment booked successfully', 'success');
    } else {
      showToast(res.message || 'Unable to connect to appointment service.', 'error');
    }
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
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* 📋 CANCELLATION & RESCHEDULE POLICY NOTE 📋 */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-start space-x-3.5 max-w-3xl mx-auto">
        <div className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-extrabold text-xs uppercase tracking-wider flex-shrink-0 shadow-xs mt-0.5">
          NOTE
        </div>
        <div className="text-xs text-slate-700 font-medium leading-relaxed">
          <p className="font-extrabold text-slate-900 text-sm mb-0.5">Cancellation & Rescheduling Policy:</p>
          <p className="text-slate-600 text-xs">
            You can <strong className="text-slate-900 font-bold">cancel</strong> or <strong className="text-slate-900 font-bold">reschedule</strong> your appointment up to <strong className="text-teal-700 font-extrabold">6 hours</strong> prior to your scheduled time slot.
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  4. Select Time Slot (25 Slots Daily)
                </label>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  {25 - bookedTimeSlots.length} / 25 Available
                </span>
              </div>

              {loadingSlots ? (
                <p className="text-xs text-slate-500 italic py-3">Checking slot availability for {selectedDoctor?.name}...</p>
              ) : (
                <div className="space-y-4">
                  {/* Morning Session Part 1 (5 Slots: 09:00 - 10:40 AM) */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" /> Morning Session (9:00 AM – 10:40 AM &bull; 5 Slots)
                    </h5>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {ALL_25_SLOTS.slice(0, 5).map((tStr) => {
                        const isBooked = bookedTimeSlots.includes(tStr);
                        const isSelected = selectedTimeSlot === tStr;

                        return (
                          <button
                            type="button"
                            key={tStr}
                            disabled={isBooked}
                            onClick={() => setSelectedTimeSlot(tStr)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-600/20'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                            }`}
                          >
                            <span>{formatTime(tStr)}</span>
                            {isBooked && (
                              <span className="text-[10px] font-medium">BOOKED</span>
                            )}
                          </button>
                        );
                      })}
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
                      {ALL_25_SLOTS.slice(5, 8).map((tStr) => {
                        const isBooked = bookedTimeSlots.includes(tStr);
                        const isSelected = selectedTimeSlot === tStr;

                        return (
                          <button
                            type="button"
                            key={tStr}
                            disabled={isBooked}
                            onClick={() => setSelectedTimeSlot(tStr)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-600/20'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                            }`}
                          >
                            <span>{formatTime(tStr)}</span>
                            {isBooked && (
                              <span className="text-[10px] font-medium">BOOKED</span>
                            )}
                          </button>
                        );
                      })}
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
                      {ALL_25_SLOTS.slice(8, 14).map((tStr) => {
                        const isBooked = bookedTimeSlots.includes(tStr);
                        const isSelected = selectedTimeSlot === tStr;

                        return (
                          <button
                            type="button"
                            key={tStr}
                            disabled={isBooked}
                            onClick={() => setSelectedTimeSlot(tStr)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-600/20'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                            }`}
                          >
                            <span>{formatTime(tStr)}</span>
                            {isBooked && (
                              <span className="text-[10px] font-medium">BOOKED</span>
                            )}
                          </button>
                        );
                      })}
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
                      {ALL_25_SLOTS.slice(14).map((tStr) => {
                        const isBooked = bookedTimeSlots.includes(tStr);
                        const isSelected = selectedTimeSlot === tStr;

                        return (
                          <button
                            type="button"
                            key={tStr}
                            disabled={isBooked}
                            onClick={() => setSelectedTimeSlot(tStr)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 ${
                              isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-600/20'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                            }`}
                          >
                            <span>{formatTime(tStr)}</span>
                            {isBooked && (
                              <span className="text-[10px] font-medium">BOOKED</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedTimeSlot}
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
          <p className="text-xs text-slate-600 mt-2 mb-6">Your reservation with {bookingResult.doctorName} for {bookingResult.appointmentDate} at {formatTime(bookingResult.appointmentTime)} has been confirmed by the backend.</p>

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
