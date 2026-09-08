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
import { formatTime } from '../../utils/helpers';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
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

  // Fetch Available Slots when Doctor or Date Changes & Deduplicate
  useEffect(() => {
    if (!selectedDoctorId) return;
    setLoadingSlots(true);
    callBackend({ action: 'GET_DOCTOR_AVAILABILITY', data: { doctorId: selectedDoctorId } }).then(res => {
      if (res.success && res.data) {
        const schedule: TimeSlot[] = res.data.weeklySchedule || [];
        const freeSlots = schedule.filter(s => s.status === 'Available');

        const rawTimes: string[] = [];
        freeSlots.forEach(s => {
          const startH = parseInt(s.startTime.split(':')[0], 10);
          const endH = parseInt(s.endTime.split(':')[0], 10);
          if (!isNaN(startH) && !isNaN(endH) && endH > startH) {
            for (let h = startH; h < endH; h++) {
              rawTimes.push(`${String(h).padStart(2, '0')}:00`);
            }
          } else {
            rawTimes.push(s.startTime);
          }
        });

        let uniqueTimes = Array.from(new Set(rawTimes));
        // Fallback default slots if schedule has no entries
        if (uniqueTimes.length === 0) {
          uniqueTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
        }

        setAvailableSlots(uniqueTimes);

        if (uniqueTimes.length > 0) {
          setSelectedTimeSlot(uniqueTimes[0]);
        } else {
          setSelectedTimeSlot('');
        }
      } else {
        const defaultSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
        setAvailableSlots(defaultSlots);
        setSelectedTimeSlot(defaultSlots[0]);
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
        patient_id: user?.id || 'PAT-001',
        doctor_id: selectedDoctorId,
        appointment_date: selectedDate,
        appointment_time: selectedTimeSlot,
        reason: appointmentType,
        patientId: user?.id || 'PAT-001',
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        appointmentType
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
      <Header title="Book New Appointment" />

      {/* Progress Wizard Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between max-w-3xl mx-auto">
        <div className={`flex items-center space-x-2 text-xs font-bold ${step >= 1 ? 'text-teal-700' : 'text-slate-400'}`}>
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">1</span>
          <span>Select Doctor & Time</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className={`flex items-center space-x-2 text-xs font-bold ${step >= 2 ? 'text-teal-700' : 'text-slate-400'}`}>
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">2</span>
          <span>Review Details</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className={`flex items-center space-x-2 text-xs font-bold ${step === 3 ? 'text-teal-700' : 'text-slate-400'}`}>
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">3</span>
          <span>Confirmation</span>
        </div>
      </div>

      {/* STEP 1: Select Doctor, Date, Slot & Type */}
      {step === 1 && (
        <Card title="Appointment Selection Wizard" className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Choose Active Physician
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3.5 ${
                      selectedDoctorId === doc.id
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-teal-600 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="2. Preferred Date"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                required
              />

              <Select
                label="3. Visit Purpose / Type"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                4. Select Available Time Slot
              </label>

              {loadingSlots ? (
                <p className="text-xs text-slate-500 italic py-3">Fetching open slots for {selectedDoctor?.name}...</p>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  No open slots found for this doctor on the selected date. Please select another doctor or date, or join the waitlist.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((tStr, index) => (
                    <button
                      type="button"
                      key={`${tStr}-${index}`}
                      onClick={() => setSelectedTimeSlot(tStr)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        selectedTimeSlot === tStr
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(tStr)}</span>
                    </button>
                  ))}
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
                Proceed to Review
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Review Booking */}
      {step === 2 && selectedDoctor && (
        <Card title="Review & Confirm Appointment" className="max-w-2xl mx-auto space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-semibold">Physician</span>
              <span className="text-sm font-bold text-slate-900">{selectedDoctor.name} ({selectedDoctor.specialization})</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-semibold">Date & Time</span>
              <span className="text-sm font-bold text-slate-900">{selectedDate} at {formatTime(selectedTimeSlot)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold">Appointment Type</span>
              <span className="text-sm font-bold text-slate-900">{appointmentType}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(1)}>
              Back to Selection
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={bookingLoading}
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleConfirmBooking}
            >
              Book Appointment
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

          <h2 className="text-2xl font-black text-slate-900">Appointment booked successfully</h2>
          <p className="text-xs text-slate-600 mt-2 mb-6">Your reservation with {bookingResult.doctorName} for {bookingResult.appointmentDate} at {formatTime(bookingResult.appointmentTime)} has been confirmed by the backend.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button variant="primary" onClick={() => navigate('/patient/dashboard')}>
              Go to Patient Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/patient/appointments')}>
              View My Appointments
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
