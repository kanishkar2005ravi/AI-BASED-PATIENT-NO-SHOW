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

      {/* 🌟 SIMPLE CLEAN HERO BANNER 🌟 */}
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 border-2 border-teal-500/30 shadow-2xl">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Hello, <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">{user?.name || 'Patient'}</span>
          </h1>
          <p className="text-sm font-bold text-slate-300">
            Patient ID: <span className="font-mono font-black text-amber-400">{user?.id || 'PAT-1001'}</span>
          </p>
        </div>
      </div>

      {/* 📊 4-GRID DISTINCTIVE MEDICAL STATS CARDS 📊 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Appointments */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-slate-700/80 text-white shadow-md relative overflow-hidden group hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Visits</span>
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{appointments.length}</p>
          <p className="text-[11px] text-teal-300/80 font-medium mt-1">Scheduled Consultations</p>
        </div>

        {/* Metric 2: Attended Visits */}
        <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 p-5 rounded-2xl border border-emerald-800/60 text-white shadow-md relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Attended Visits</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-300 mt-3">{attendedCount}</p>
          <p className="text-[11px] text-emerald-200/80 font-medium mt-1">🟢 Completed Consultations</p>
        </div>

        {/* Metric 3: Missed / No-Show */}
        <div className="bg-gradient-to-br from-rose-950/80 to-slate-900 p-5 rounded-2xl border border-rose-800/60 text-white shadow-md relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Missed Visits</span>
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-300 mt-3">{noShowCount}</p>
          <p className="text-[11px] text-rose-200/80 font-medium mt-1">🔴 No-Show Records</p>
        </div>

        {/* Metric 4: Active Waitlist */}
        <div className="bg-gradient-to-br from-purple-950/80 to-slate-900 p-5 rounded-2xl border border-purple-800/60 text-white shadow-md relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Waitlist Requests</span>
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-300 mt-3">{waitlist.length}</p>
          <p className="text-[11px] text-purple-200/80 font-medium mt-1">Pending Slot Alerts</p>
        </div>
      </div>

      {/* 🎟️ HERO FEATURED MEDICAL BOARDING PASS (NEXT APPOINTMENT) 🎟️ */}
      {nextAppointment ? (
        <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border-2 border-teal-400/40 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-teal-300">Your Next Confirmed Medical Ticket</span>
            </div>
            <Badge variant="teal" size="md">
              {nextAppointment.status}
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
                Reschedule Visit
              </button>
              <button
                onClick={() => handleCancel(nextAppointment.id)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold text-xs border border-rose-400/30 transition-all"
              >
                Cancel Visit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 text-center text-slate-300">
          <Calendar className="w-12 h-12 text-teal-400 mx-auto mb-3 animate-bounce" />
          <h3 className="text-lg font-black text-white">No Upcoming Consultations</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 font-medium">
            You currently have no scheduled appointments. Select a physician from SNS Medical College and book your consultation slot.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/patient/book')}>
            Book Appointment Now
          </Button>
        </div>
      )}

      {/* 🩺 SPECIALIST PHYSICIANS CAROUSEL / FAST BOOKING 🩺 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Available Faculty Physicians</h2>
            <p className="text-xs text-slate-500 font-medium">SNS Medical College and Hospital Specialists</p>
          </div>
          <button
            onClick={() => navigate('/patient/book')}
            className="text-xs font-black text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All Doctors</span>
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
                  <span className="font-medium">{doc.experience} Years Exp.</span>
                  <span className="font-bold text-teal-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Book Slot <ArrowRight className="w-3 h-3" />
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
        <Card title="Appointment History & Schedule" className="lg:col-span-2">
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

        {/* Notifications & Announcements Hub */}
        <div className="space-y-6">
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
