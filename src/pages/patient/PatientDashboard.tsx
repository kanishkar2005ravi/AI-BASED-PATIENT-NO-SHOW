import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { CarePilotLogo } from '../../components/common/CarePilotLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { callBackend } from '../../services/api';
import { Appointment, WaitlistItem, NotificationItem, Doctor } from '../../types';
import {
  Calendar,
  CalendarPlus,
  CalendarCheck,
  Clock,
  ChevronRight,
  Bell,
  Sparkles,
  HeartPulse,
  Play,
  Stethoscope,
  ShieldCheck,
  Award,
  Activity,
  UserCheck,
  AlertCircle,
  Hospital,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { WelcomeSplashScreen } from '../../components/common/WelcomeSplashScreen';
import { formatTime } from '../../utils/helpers';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('carepilot_patient_splash_shown');
  });

  useEffect(() => {
    if (showWelcomeSplash) {
      sessionStorage.setItem('carepilot_patient_splash_shown', 'true');
    }
  }, [showWelcomeSplash]);

  const fetchData = async () => {
    setLoading(true);
    const [aptsRes, waitRes, notifRes, docsRes] = await Promise.all([
      callBackend({ action: 'GET_APPOINTMENTS', data: { role: 'patient', userId: user?.id } }),
      callBackend({ action: 'GET_WAITLIST' }),
      callBackend({ action: 'GET_NOTIFICATIONS', data: { userId: user?.id } }),
      callBackend({ action: 'GET_DOCTORS' })
    ]);

    if (aptsRes.success && Array.isArray(aptsRes.data)) {
      setAppointments(aptsRes.data);
    }
    if (waitRes.success && Array.isArray(waitRes.data)) {
      setWaitlist(waitRes.data.filter((w: WaitlistItem) => w.patientId === user?.id));
    }
    if (notifRes.success && Array.isArray(notifRes.data)) {
      setNotifications(notifRes.data.slice(0, 3));
    }
    if (docsRes.success && Array.isArray(docsRes.data)) {
      setDoctors(docsRes.data.filter((d: Doctor) => d.status === 'Active'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const nextAppointment = appointments.find(
    a => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN' || a.status === 'RESCHEDULED'
  );

  const attendedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const noShowCount = appointments.filter(a => a.status === 'NO_SHOW').length;

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
        <Header title={t('nav.dashboard')} />
        <div className="py-20">
          <Loading message="Loading your personal health command center..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title={t('nav.dashboard')} />

      {/* 5-Second 7-Color Animated Welcome Entrance Screen */}
      {showWelcomeSplash && (
        <WelcomeSplashScreen
          userName={user?.name || 'Patient'}
          role="patient"
          onComplete={() => setShowWelcomeSplash(false)}
        />
      )}

      {/* 🌟 SIMPLE CLEAN TEXT GREETING MESSAGE 🌟 */}
      <div className="space-y-1 py-1">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {t('welcome.hello')}, <span className="text-teal-600 font-extrabold">{user?.name || 'Patient'}</span>
        </h1>
        <p className="text-xs md:text-sm font-bold text-slate-500">
          {t('dashboard.patient_id')}: <span className="font-mono font-bold text-slate-800">{user?.id || 'PAT-1001'}</span>
        </p>
      </div>

      {/* 📊 SIMPLE SIDE-BY-SIDE SQUARE METRIC BOXES 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Box 1: Total Visits */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[96px]">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-black text-slate-900 leading-none">{appointments.length}</p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{t('metric.total_visits')}</p>
          </div>
        </div>

        {/* Box 2: Attended Visits */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[96px]">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-black text-emerald-600 leading-none">{attendedCount}</p>
            <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">{t('metric.attended')}</p>
          </div>
        </div>

        {/* Box 3: Missed Visits */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[96px]">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-black text-rose-600 leading-none">{noShowCount}</p>
            <p className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">{t('metric.missed')}</p>
          </div>
        </div>

        {/* Box 4: Waitlist Requests */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[96px]">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-black text-purple-600 leading-none">{waitlist.length}</p>
            <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">{t('metric.waitlist')}</p>
          </div>
        </div>
      </div>

      {/* ⚡ QUICK NAVIGATION ACTION BOXES ⚡ */}
      <div className="grid grid-cols-3 gap-3">
        {/* Book Appointment Box */}
        <div
          onClick={() => navigate('/patient/book')}
          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[96px] cursor-pointer group"
        >
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
            <CalendarPlus className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-extrabold text-slate-800 tracking-tight leading-tight">{t('nav.book_appointment')}</p>
        </div>

        {/* My Appointments Box */}
        <div
          onClick={() => navigate('/patient/appointments')}
          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[96px] cursor-pointer group"
        >
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-extrabold text-slate-800 tracking-tight leading-tight">{t('nav.my_appointments')}</p>
        </div>

        {/* Waitlist Box */}
        <div
          onClick={() => navigate('/patient/waitlist')}
          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-pink-400 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[96px] cursor-pointer group"
        >
          <div className="p-2 rounded-lg bg-pink-50 text-pink-600 border border-pink-100 group-hover:scale-110 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-extrabold text-slate-800 tracking-tight leading-tight">{t('nav.waitlist')}</p>
        </div>
      </div>

      {/* 🎟️ HERO FEATURED MEDICAL BOARDING PASS (NEXT APPOINTMENT) 🎟️ */}
      {nextAppointment ? (
        <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border-2 border-teal-400/40 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-teal-300">{t('dashboard.next_ticket')}</span>
            </div>
            <Badge variant="teal" size="md">
              {nextAppointment.status === 'CONFIRMED' ? t('status.confirmed') : nextAppointment.status}
            </Badge>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                {nextAppointment.doctorName.replace('Dr. ', '').charAt(0)}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  {nextAppointment.doctorSpecialization}
                </span>
                <h2 className="text-2xl font-black text-white">{nextAppointment.doctorName}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-200 pt-1">
                  <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>{nextAppointment.appointmentDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{formatTime(nextAppointment.appointmentTime)}</span>
                  </span>
                  <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-xl border border-teal-400/30 font-extrabold">
                    {nextAppointment.appointmentType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2 lg:pt-0">
              <button
                onClick={() => navigate(`/patient/appointments/${nextAppointment.id}/reschedule`)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
              >
                {t('dashboard.reschedule')}
              </button>
              <button
                onClick={() => handleCancel(nextAppointment.id)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold text-xs border border-rose-400/30 transition-all"
              >
                {t('dashboard.cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 text-center text-slate-300">
          <Calendar className="w-12 h-12 text-teal-400 mx-auto mb-3 animate-bounce" />
          <h3 className="text-lg font-black text-white">{t('dashboard.no_upcoming')}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 font-medium">
            {t('dashboard.no_upcoming_desc')}
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/patient/book')}>
            {t('nav.book_appointment')}
          </Button>
        </div>
      )}

      {/* 🩺 SPECIALIST PHYSICIANS CAROUSEL / FAST BOOKING 🩺 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('dashboard.available_doctors')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('dashboard.doctors_subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/patient/book')}
            className="text-xs font-black text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>{t('dashboard.view_all_doctors')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctors.slice(0, 4).map((doc, idx) => {
            const badgeColors = [
              'bg-amber-100 text-amber-900 border-amber-300',
              'bg-blue-100 text-blue-900 border-blue-300',
              'bg-teal-100 text-teal-900 border-teal-300',
              'bg-purple-100 text-purple-900 border-purple-300'
            ][idx % 4];

            return (
              <div
                key={doc.id}
                onClick={() => navigate('/patient/book')}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 hover:border-teal-400 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-300 font-black text-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    {doc.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-teal-600 transition-colors">{doc.name}</h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeColors}`}>
                      {doc.specialization}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">{doc.experience} {t('dashboard.exp_years')}</span>
                  <span className="font-bold text-teal-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {t('dashboard.book_slot')} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📋 ROW 3: APPOINTMENT HISTORY & NOTIFICATIONS HUB 📋 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <Card title={t('dashboard.history_title')} className="lg:col-span-2">
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No appointment history found.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map(apt => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900">{apt.doctorName}</h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                      <span>📅 {apt.appointmentDate}</span>
                      <span>⏰ {formatTime(apt.appointmentTime)}</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold text-[10px]">{apt.appointmentType}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={apt.status === 'CONFIRMED' ? 'info' : apt.status === 'COMPLETED' ? 'success' : 'danger'} size="sm">
                      {apt.status}
                    </Badge>
                    <button
                      onClick={() => navigate(`/patient/appointments/${apt.id}`)}
                      className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right Column: Unique Patient Profile Card & Hospital Notices */}
        <div className="space-y-6">
          {/* 🌟 UNIQUE PATIENT PROFILE CARD 🌟 */}
          <div className="p-[2px] rounded-3xl bg-gradient-to-br from-teal-400 via-amber-400 to-indigo-500 shadow-lg">
            <div className="p-5 rounded-[22px] bg-slate-950 text-white space-y-4 relative overflow-hidden">
              <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-base font-black text-white leading-tight truncate">{user?.name || 'Patient'}</h3>
                  <p className="text-xs font-bold text-amber-400 mt-0.5">{t('dashboard.patient_id')}: {user?.id || 'PAT-686'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Verified
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus</span>
                  <span className="text-xs font-black text-teal-300 mt-0.5 truncate block">SNS Medical</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/patient/profile')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer hover:scale-[1.02]"
              >
                {t('nav.profile')}
              </button>
            </div>
          </div>

          <Card title="Hospital Alerts & Notices">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No new notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/80 text-xs space-y-1">
                    <p className="font-bold text-teal-950 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-teal-600" /> {n.title}
                    </p>
                    <p className="text-teal-800 font-medium leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {waitlist.length > 0 && (
            <Card title="Active Waitlist Position">
              <div className="space-y-2">
                {waitlist.map(w => (
                  <div key={w.id} className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-purple-950">{w.doctorName}</p>
                      <p className="text-purple-700 font-medium">{w.requestedDate}</p>
                    </div>
                    <Badge variant="purple" size="md">
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
