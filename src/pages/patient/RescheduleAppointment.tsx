import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { callBackend } from '../../services/api';
import { Appointment, TimeSlot } from '../../types';
import { ArrowLeft, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatTime } from '../../utils/helpers';

export const RescheduleAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('2026-09-12');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    callBackend({ action: 'GET_APPOINTMENTS', data: {} }).then(res => {
      if (isMounted && res.success && Array.isArray(res.data)) {
        const found = res.data.find((a: Appointment) => a.id === id);
        setAppointment(found || null);

        if (found) {
          callBackend({ action: 'GET_DOCTOR_AVAILABILITY', data: { doctorId: found.doctorId } }).then(availRes => {
            if (isMounted && availRes.success && availRes.data) {
              const free = (availRes.data.weeklySchedule || []).filter((s: TimeSlot) => s.status === 'Available');
              setAvailableSlots(free);
              if (free.length > 0) setSelectedTime(free[0].startTime);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !selectedTime) {
      showToast('Please select a valid date and available time slot.', 'error');
      return;
    }

    setSaving(true);
    const res = await callBackend({
      action: 'RESCHEDULE_APPOINTMENT',
      data: {
        appointmentId: id,
        newDate,
        newTime: selectedTime
      }
    });

    setSaving(false);
    if (res.success) {
      showToast('Appointment rescheduled successfully! AI risk score updated.', 'success');
      navigate('/patient/appointments');
    } else {
      showToast(res.message || 'Reschedule failed.', 'error');
    }
  };

  if (loading || !appointment) {
    return (
      <div>
        <Header title="Reschedule Visit" />
        <div className="py-20">
          <Loading message="Loading appointment schedule..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title="Reschedule Appointment" />

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/patient/appointments')}>
          Back to Appointments
        </Button>
      </div>

      {/* 📋 CANCELLATION & RESCHEDULE POLICY NOTE 📋 */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-start space-x-3.5 max-w-2xl mx-auto">
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

      <Card title={`Rescheduling Visit: ${appointment.id}`} className="max-w-2xl mx-auto">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs text-slate-700">
          <p className="font-bold text-slate-900">{appointment.doctorName} ({appointment.doctorSpecialization})</p>
          <p className="mt-0.5">Current Date: {appointment.appointmentDate} at {appointment.appointmentTime}</p>
        </div>

        <form onSubmit={handleConfirmReschedule} className="space-y-6">
          <Input
            label="Select New Date"
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Available Time Slot
            </label>

            {availableSlots.length === 0 ? (
              <p className="text-xs text-amber-600 italic">No open slots available on this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableSlots.map(slot => (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => setSelectedTime(slot.startTime)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      selectedTime === slot.startTime
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(slot.startTime)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => navigate('/patient/appointments')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving} icon={<RefreshCw className="w-4 h-4" />}>
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
