import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { callBackend, normalizeAppointment, normalizeDoctor } from '../../services/api';
import { Appointment, Doctor } from '../../types';
import { Calendar, Clock, ChevronRight, XCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeId = (id: any): string => (id || '').toString().trim().toUpperCase();

  const isAppointmentCancelled = (apt: Appointment): boolean => {
    const s = (apt.status || '').toUpperCase();
    return s === 'CANCELLED' || s === 'CANCELED';
  };

  const isAppointmentPast = (apt: Appointment): boolean => {
    const s = (apt.status || '').toUpperCase();
    if (s === 'CANCELLED' || s === 'CANCELED') return false;
    if (s === 'COMPLETED' || s === 'CHECKED_OUT' || s === 'NO_SHOW' || s === 'ATTENDED' || s === 'MISSED') {
      return true;
    }
    if (apt.appointmentDate) {
      try {
        const timeStr = apt.appointmentTime && apt.appointmentTime.includes(':')
          ? (apt.appointmentTime.length === 5 ? `${apt.appointmentTime}:00` : apt.appointmentTime)
          : '00:00:00';
        const aptDateTime = new Date(`${apt.appointmentDate}T${timeStr}`);
        if (!isNaN(aptDateTime.getTime())) {
          return aptDateTime.getTime() < Date.now();
        }
      } catch (e) {
        // Fallback
      }
    }
    return false;
  };

  const isAppointmentUpcoming = (apt: Appointment): boolean => {
    if (isAppointmentCancelled(apt)) return false;
    if (isAppointmentPast(apt)) return false;
    return true;
  };

  const fetchAppointments = () => {
    setLoading(true);
    Promise.all([
      callBackend({ 
        action: 'GET_APPOINTMENTS', 
        data: { 
          patientId: user?.id,
          patient_id: user?.id,
          userId: user?.id,
          email: user?.email,
          role: 'patient'
        } 
      }),
      callBackend({ action: 'GET_DOCTORS' })
    ]).then(([aptsRes, docsRes]) => {
      // 1. Process Doctors Independently
      const rawDoctors = docsRes.success && Array.isArray(docsRes.data) ? docsRes.data : [];
      const doctors: Doctor[] = rawDoctors
        .filter((d: any) => d && (d.id?.startsWith?.('DOC-') || d.specialization || d.department || (d.name && !d.appointment_date && !d.appointmentDate)))
        .map(normalizeDoctor);

      console.log('[GET_DOCTORS] DOCTOR DATA ONLY:', doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization
      })));

      // 2. Process Appointments Independently
      const rawAppointments = aptsRes.success && Array.isArray(aptsRes.data) ? aptsRes.data : [];
      const validAptItems = rawAppointments.filter((a: any) => {
        if (!a || typeof a !== 'object') return false;
        // Never allow doctor-only objects to be processed as appointments
        if (a.specialization && !a.appointmentDate && !a.appointment_date && !a.patientId && !a.patient_id && !a.appointmentType && !a.reason) {
          return false;
        }
        if (typeof a.id === 'string' && a.id.startsWith('DOC-') && !a.appointmentDate && !a.appointment_date && !a.patientId && !a.patient_id) {
          return false;
        }
        return true;
      });

      const normalizedAppointments: Appointment[] = validAptItems.map(normalizeAppointment);

      console.log('[GET_APPOINTMENTS] APPOINTMENT DATA ONLY:', normalizedAppointments.map(a => ({
        id: a.id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        appointmentDate: a.appointmentDate,
        appointmentTime: a.appointmentTime,
        appointmentType: a.appointmentType,
        status: a.status
      })));

      // 3. Enrich appointments with doctor metadata without mutating or replacing appointments
      const enrichedAppointments = normalizedAppointments.map(appointment => {
        const matchedDoc = doctors.find(
          d => normalizeId(d.id) === normalizeId(appointment.doctorId)
        );

        return {
          ...appointment,
          doctorName: matchedDoc?.name || appointment.doctorName || (appointment.doctorId ? `Doctor (${appointment.doctorId})` : 'Doctor'),
          doctorSpecialization: matchedDoc?.specialization || appointment.doctorSpecialization || 'General Physician'
        };
      });

      console.log('[GET_APPOINTMENTS] normalized appointments:', enrichedAppointments);
      console.log('[GET_APPOINTMENTS] current patient ID:', user?.id);

      const patientMatched = user?.id
        ? enrichedAppointments.filter(a => {
            const aPid = normalizeId(a.patientId);
            const uId = normalizeId(user.id);
            const aEmail = (a.patientEmail || '').trim().toLowerCase();
            const uEmail = (user.email || '').trim().toLowerCase();
            return aPid === uId || (uEmail && aEmail === uEmail);
          })
        : enrichedAppointments;

      console.log('[GET_APPOINTMENTS] patient-matched appointments:', patientMatched);
      console.log('[GET_APPOINTMENTS] FINAL appointment objects:', patientMatched);
      setAppointments(patientMatched);
      setLoading(false);
    }).catch(err => {
      console.error('[GET_APPOINTMENTS] error fetching appointments:', err);
      setAppointments([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.id, user?.email]);

  const filtered = appointments.filter(a => {
    if (tab === 'UPCOMING') return isAppointmentUpcoming(a);
    if (tab === 'PAST') return isAppointmentPast(a);
    if (tab === 'CANCELLED') return isAppointmentCancelled(a);
    return true;
  });

  const handleCancel = async (aptId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This slot will be offered to waitlisted patients.')) {
      return;
    }

    const aptToCancel = appointments.find(a => a.id === aptId);

    // Optimistically update state so card moves to Cancelled tab instantly
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'CANCELLED' as const } : a));

    const res = await callBackend({ 
      action: 'CANCEL_APPOINTMENT', 
      data: { 
        appointmentId: aptId,
        patient_name: aptToCancel?.patientName || user?.name,
        email: aptToCancel?.patientEmail || user?.email,
        patient_email: aptToCancel?.patientEmail || user?.email,
        phone: aptToCancel?.patientPhone || user?.phone,
        patient_phone: aptToCancel?.patientPhone || user?.phone,
        doctor_name: aptToCancel?.doctorName,
        appointment_date: aptToCancel?.appointmentDate,
        appointment_time: aptToCancel?.appointmentTime
      } 
    });
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
      <Header title={t('appointments.title')} />

      {/* ⬅️ BACK TO DASHBOARD BUTTON ⬅️ */}
      <div>
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600 group-hover:-translate-x-1 transition-transform" />
          <span>{t('dashboard.back_to_dashboard')}</span>
        </button>
      </div>

      {/* 📋 CANCELLATION & RESCHEDULE POLICY NOTE 📋 */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-start space-x-3.5">
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

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map(tabKey => {
            const count = appointments.filter(a => {
              if (tabKey === 'UPCOMING') return isAppointmentUpcoming(a);
              if (tabKey === 'PAST') return isAppointmentPast(a);
              if (tabKey === 'CANCELLED') return isAppointmentCancelled(a);
              return false;
            }).length;

            return (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`px-4 py-2 rounded-xl transition-all capitalize ${
                  tab === tabKey ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tabKey === 'UPCOMING' ? t('appointments.tab_upcoming') : tabKey === 'PAST' ? t('appointments.tab_past') : t('appointments.tab_cancelled')} ({count})
              </button>
            );
          })}
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Calendar className="w-4 h-4" />}
          onClick={() => navigate('/patient/book')}
        >
          {t('appointments.book_new')}
        </Button>
      </div>

      <Card>
        {loading ? (
          <Loading message={t('appointments.fetching')} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={t('appointments.no_records')}
            description=""
            actionLabel={t('action.book')}
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
                    <h3 className="text-base font-bold text-slate-900">
                      {apt.doctorName || (apt.doctorId ? `Doctor (${apt.doctorId})` : 'Doctor')}
                    </h3>
                    <Badge
                      variant={
                        isAppointmentCancelled(apt) || apt.status?.toUpperCase() === 'CANCELLED' || apt.status?.toUpperCase() === 'CANCELED'
                          ? 'danger'
                          : isAppointmentPast(apt)
                          ? apt.status?.toUpperCase() === 'NO_SHOW'
                            ? 'danger'
                            : 'success'
                          : apt.status?.toUpperCase() === 'RESCHEDULED'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {isAppointmentCancelled(apt) || apt.status?.toUpperCase() === 'CANCELLED' || apt.status?.toUpperCase() === 'CANCELED'
                        ? 'Cancelled'
                        : isAppointmentPast(apt)
                        ? apt.status?.toUpperCase() === 'NO_SHOW'
                          ? 'NO SHOW'
                          : 'Completed'
                        : apt.status?.toUpperCase() === 'RESCHEDULED'
                        ? 'Rescheduled'
                        : 'Confirmed'}
                    </Badge>
                  </div>
                  {apt.doctorSpecialization ? (
                    <p className="text-xs font-semibold text-teal-600">{apt.doctorSpecialization}</p>
                  ) : null}

                  <div className="flex items-center space-x-4 text-xs font-medium text-slate-600 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{apt.appointmentDate}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{apt.appointmentTime}</span>
                    </span>
                    <span>{t('label.reason')}: {apt.appointmentType}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {isAppointmentUpcoming(apt) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/patient/appointments/${apt.id}/reschedule`)}
                      >
                        {t('appointments.reschedule')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleCancel(apt.id)}
                      >
                        {t('appointments.cancel')}
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
