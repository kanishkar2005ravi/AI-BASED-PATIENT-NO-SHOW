import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { Appointment, WaitlistItem, NotificationItem } from '../../types';
import { Calendar, Clock, ChevronRight, Bell, Sparkles, HeartPulse } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      callBackend({ action: 'GET_APPOINTMENTS', data: { patientId: user?.id } }),
      callBackend({ action: 'GET_WAITLIST', data: { patientId: user?.id } }),
      callBackend({ action: 'GET_NOTIFICATIONS', data: { userId: user?.id } })
    ]).then(([aptsRes, wtlRes, notifRes]) => {
      if (aptsRes.success && Array.isArray(aptsRes.data)) {
        setAppointments(aptsRes.data);
      }
      if (wtlRes.success && Array.isArray(wtlRes.data)) {
        setWaitlist(wtlRes.data.filter((w: WaitlistItem) => w.patientId === user?.id));
      }
      if (notifRes.success && Array.isArray(notifRes.data)) {
        setNotifications(notifRes.data.slice(0, 3));
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const nextAppointment = appointments.find(
    a => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'RESCHEDULED'
  );

  const handleCancel = async (aptId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    const res = await callBackend({ action: 'CANCEL_APPOINTMENT', data: { appointmentId: aptId } });
    if (res.success) {
      showToast(res.message, 'success');
      fetchData();
    } else {
      showToast(res.message || 'Cancellation failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Patient Portal" />
        <div className="py-20">
          <Loading message="Welcome back! Fetching your schedule..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title="Patient Dashboard" />

      {/* Greeting Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-teal-300" /> Patient Care Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Good morning, {user?.name || 'Patient'}
            </h1>
            <p className="text-xs md:text-sm text-teal-100 mt-1">
              View your medical appointments, request new consultations, and track waitlist updates.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="bg-white text-teal-900 hover:bg-teal-50 shadow-md border-0 font-bold"
            icon={<Calendar className="w-4 h-4 text-teal-700" />}
            onClick={() => navigate('/patient/book')}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Next Appointment Hero Card (NO AI Risk Details, NO Check-in button) */}
      {nextAppointment ? (
        <Card className="border-2 border-teal-500/40 bg-gradient-to-br from-white via-teal-50/20 to-white shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Your Next Scheduled Visit</h3>
            </div>
            <Badge variant={nextAppointment.status === 'CHECKED_IN' ? 'purple' : 'info'}>
              {nextAppointment.status}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs text-teal-700 font-bold uppercase">{nextAppointment.doctorSpecialization}</span>
              <h2 className="text-2xl font-extrabold text-slate-900">{nextAppointment.doctorName}</h2>
              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>{nextAppointment.appointmentDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{nextAppointment.appointmentTime}</span>
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-medium">
                  {nextAppointment.appointmentType}
                </span>
              </div>
            </div>

            {/* Patient Actions (Reschedule & Cancel ONLY) */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate(`/patient/appointments/${nextAppointment.id}/reschedule`)}
              >
                Reschedule Visit
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => handleCancel(nextAppointment.id)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="text-center p-8 bg-slate-50 border-dashed border-slate-300">
          <Calendar className="w-10 h-10 text-teal-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Upcoming Appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            You currently have no scheduled medical visits. Book a consultation or join the waitlist.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/patient/book')}>
            Book Appointment Now
          </Button>
        </Card>
      )}

      {/* Row 2: Upcoming List & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <Card title="Upcoming & Recent Appointments" className="lg:col-span-2">
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No appointment history found.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map(apt => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between hover:bg-white transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{apt.doctorName}</h4>
                    <p className="text-xs text-slate-500">
                      {apt.appointmentDate} at {apt.appointmentTime} ({apt.appointmentType})
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={apt.status === 'CONFIRMED' ? 'info' : apt.status === 'COMPLETED' ? 'success' : 'danger'} size="sm">
                      {apt.status}
                    </Badge>
                    <button
                      onClick={() => navigate(`/patient/appointments/${apt.id}`)}
                      className="p-1 text-slate-400 hover:text-teal-600"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notifications & Waitlist Summary */}
        <div className="space-y-6">
          <Card title="Notifications & Reminders">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No new notifications.</p>
            ) : (
              <div className="space-y-2.5">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {waitlist.length > 0 && (
            <Card title="Active Waitlist Requests">
              <div className="space-y-2">
                {waitlist.map(w => (
                  <div key={w.id} className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-teal-900">{w.doctorName}</p>
                      <p className="text-teal-700">{w.requestedDate}</p>
                    </div>
                    <Badge variant="teal" size="sm">
                      Pos #{w.position}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
