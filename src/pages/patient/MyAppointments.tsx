import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { Appointment } from '../../types';
import { Calendar, Clock, ChevronRight, XCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = () => {
    setLoading(true);
    callBackend({ action: 'GET_APPOINTMENTS', data: { patientId: user?.id } }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.id]);

  const filtered = appointments.filter(a => {
    if (tab === 'UPCOMING') return a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'RESCHEDULED';
    if (tab === 'PAST') return a.status === 'COMPLETED' || a.status === 'CHECKED_OUT' || a.status === 'NO_SHOW';
    if (tab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  const handleCancel = async (aptId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This slot will be offered to waitlisted patients.')) {
      return;
    }

    // Optimistically update state so card moves to Cancelled tab instantly
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'CANCELLED' as const } : a));

    const res = await callBackend({ action: 'CANCEL_APPOINTMENT', data: { appointmentId: aptId } });
    if (res.success) {
      showToast(res.message || 'Appointment cancelled successfully!', 'success');
      fetchAppointments();
    } else {
      showToast(res.message || 'Cancellation failed.', 'error');
      fetchAppointments();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="My Appointments" />

      {/* ⬅️ BACK TO DASHBOARD BUTTON ⬅️ */}
      <div>
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl transition-all capitalize ${
                tab === t ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.toLowerCase()} ({appointments.filter(a => {
                if (t === 'UPCOMING') return a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'RESCHEDULED';
                if (t === 'PAST') return a.status === 'COMPLETED' || a.status === 'CHECKED_OUT' || a.status === 'NO_SHOW';
                if (t === 'CANCELLED') return a.status === 'CANCELLED';
                return false;
              }).length})
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Calendar className="w-4 h-4" />}
          onClick={() => navigate('/patient/book')}
        >
          Book New Visit
        </Button>
      </div>

      <Card>
        {loading ? (
          <Loading message="Fetching your appointment records..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`No ${tab.toLowerCase()} appointments`}
            description="You do not have any appointments in this category."
            actionLabel="Book Appointment"
            onAction={() => navigate('/patient/book')}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(apt => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-base font-bold text-slate-900">{apt.doctorName}</h3>
                    <Badge variant={apt.status === 'CONFIRMED' ? 'info' : apt.status === 'COMPLETED' || apt.status === 'CHECKED_OUT' ? 'success' : 'danger'} size="sm">
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-teal-600">{apt.doctorSpecialization}</p>

                  <div className="flex items-center space-x-4 text-xs font-medium text-slate-600 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{apt.appointmentDate}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{apt.appointmentTime}</span>
                    </span>
                    <span>Type: {apt.appointmentType}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {(apt.status === 'CONFIRMED' || apt.status === 'RESCHEDULED' || apt.status === 'CHECKED_IN') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/patient/appointments/${apt.id}/reschedule`)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
