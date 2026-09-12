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
  FileText,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { WelcomeSplashScreen } from '../../components/common/WelcomeSplashScreen';
import { AppFeaturesModal } from '../../components/common/AppFeaturesModal';
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
  const [showAllDoctorsModal, setShowAllDoctorsModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [selectedEmergencyDoctorId, setSelectedEmergencyDoctorId] = useState<string>('');
  const [emergencyDate, setEmergencyDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [emergencyReason, setEmergencyReason] = useState<string>('');
  const [priorityLevel, setPriorityLevel] = useState<'EMERGENCY' | 'HIGH' | 'STANDARD'>('HIGH');
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState(false);
  const [emergencySubmittedSuccess, setEmergencySubmittedSuccess] = useState(false);

  const handleSubmitEmergencyRequest = async () => {
    if (!emergencyReason.trim()) {
      showToast('Please type the reason for your priority booking request.', 'error');
      return;
    }

    setIsSubmittingEmergency(true);
    const selectedDoc = doctors.find(d => d.id === selectedEmergencyDoctorId) || doctors[0];

    const res = await callBackend({
      action: 'ADD_TO_WAITLIST',
      data: {
        patientId: user?.id,
        patientName: user?.name,
        doctorId: selectedDoc?.id,
        doctorName: selectedDoc?.name,
        requestedDate: emergencyDate,
        reason: `[${priorityLevel} PRIORITY] ${emergencyReason}`,
        priority: priorityLevel
      }
    });

    setIsSubmittingEmergency(false);
    if (res.success) {
      setEmergencySubmittedSuccess(true);
      showToast('Priority request submitted! Admin will verify and confirm.', 'success');
      fetchData();
    } else {
      showToast(res.message || 'Priority request submission failed.', 'error');
    }
  };

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

      {/* 📦 SQUARE ACTION BOXES: QUICK ACTIONS & MODAL TRIGGER 📦 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Box 1: Book Appointment */}
          <div
            onClick={() => navigate('/patient/book')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">{t('nav.book_appointment')}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-0.5">Fast Slot Selection</p>
            </div>
          </div>

          {/* Box 2: Available Faculty Physicians (Opens Modal) */}
          <div
            onClick={() => setShowAllDoctorsModal(true)}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">{t('dashboard.available_doctors')}</p>
              <p className="text-[10px] font-bold text-teal-600 mt-0.5">{doctors.length} Physicians • View All</p>
            </div>
          </div>

          {/* Box 3: Appointment History & Schedule */}
          <div
            onClick={() => navigate('/patient/appointments')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">{t('dashboard.history_title')}</p>
              <p className="text-[10px] font-bold text-indigo-600 mt-0.5">{appointments.length} Total Visits</p>
            </div>
          </div>

          {/* Box 4: Active Waitlist */}
          <div
            onClick={() => navigate('/patient/waitlist')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">{t('nav.waitlist')}</p>
              <p className="text-[10px] font-bold text-purple-600 mt-0.5">{waitlist.length} Active Requests</p>
            </div>
          </div>
        </div>

      {/* 🚨 SLEEK OBSIDIAN GLASSMORPHISM PRIORITY CARE CARD 🚨 */}
      <div id="priority-care-section" className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-950 text-white shadow-2xl shadow-slate-950/60 border-2 border-rose-500/60 ring-2 ring-amber-400/30 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden group transition-all">
        {/* Ambient Blurred Glowing Orbs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-rose-600/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 text-white border border-rose-400/50 shadow-lg shadow-rose-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300">
            <HeartPulse className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="bg-slate-900/90 text-amber-300 text-[10px] font-black uppercase px-3.5 py-1 rounded-full border border-amber-400/50 tracking-wider shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-xs shadow-rose-400" /> PRIORITY CONSULTATION
              </span>
              <span className="text-xs font-bold text-amber-300/90 tracking-wide">
                ⚡ Urgent Faculty Slot Request
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-sm">
              {t('dashboard.emergency_title')}
            </h3>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-medium pt-0.5">
              <span className="bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-700/80 text-slate-200 flex items-center gap-1.5">
                🩺 24/7 Specialist Availability
              </span>
              <span className="bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-700/80 text-slate-200 flex items-center gap-1.5">
                ⚡ Instant Admin Verification
              </span>
              <span className="bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-700/80 text-slate-200 flex items-center gap-1.5">
                📅 Same-Day Priority Request
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowEmergencyModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs transition-all shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-105 flex items-center gap-2 flex-shrink-0 cursor-pointer border border-rose-300/40 relative z-10 group/btn"
        >
          <span>{t('dashboard.emergency_button')}</span>
          <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 📋 IMPORTANT PATIENT ADVISORY & HOSPITAL NOTE 📋 */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border-2 border-amber-400/60 shadow-md space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs text-sm">
            📋
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>Important Hospital Advisory & Patient Guidelines</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-2xs">Note</span>
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
          <div className="p-3 rounded-2xl bg-white/80 border border-amber-200/80 space-y-1">
            <p className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>⏰ Reporting Time & Identity Verification</span>
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Please report to reception 15 mins prior to your scheduled consultation time. Bring your Patient ID (<strong className="text-slate-900">{user?.id || 'PAT-686'}</strong>) or registered phone number.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-teal-200/80 space-y-1">
            <p className="font-extrabold text-teal-950 flex items-center gap-1.5">
              <span>📞 Phone Call-In Booking Helpline</span>
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              For patients without smartphone/digital access, telephone call-in booking helpline (<strong className="text-slate-900">+91 422 2661100</strong>) allocates limited reserved daily slots on a 1st Come, 1st Serve basis.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-rose-200/80 space-y-1">
            <p className="font-extrabold text-rose-950 flex items-center gap-1.5">
              <span>⚡ Priority Care & Emergency Casualty</span>
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If regular slots are full, request an urgent priority consultation. For acute emergencies, visit our Casualty Unit or call emergency helpline (<strong className="text-slate-900">0422-2666222</strong>).
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-purple-200/80 space-y-1">
            <p className="font-extrabold text-purple-950 flex items-center gap-1.5">
              <span>🔄 Automatic Slot Reallocation</span>
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If you need to cancel or reschedule, please do so at least 2 hours in advance so your slot can be offered automatically to waitlisted patients.
            </p>
          </div>
        </div>
      </div>

      {/* 🏥 TOUCH TO VIEW 24/7 SUPPORT & APP FEATURES BANNER 🏥 */}
      <div
        onClick={() => setShowFeaturesModal(true)}
        className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white border-2 border-teal-500/40 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-extrabold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
              🏥 Touch Here: View 24/7 Healthcare Support & CarePilot App Features
            </h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Email (kanis.r.ad.2024@snsce.ac.in), Phone Helpline, Gmail/WhatsApp Alerts & AI Analytics
            </p>
          </div>
        </div>

        <div className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <span>Touch to View</span>
          <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 🩺 ALL FACULTY PHYSICIANS MODAL 🩺 */}
      {showAllDoctorsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAllDoctorsModal(false)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{t('dashboard.available_doctors')}</h3>
                <p className="text-xs text-slate-500 font-medium">{t('dashboard.doctors_subtitle')}</p>
              </div>
              <button
                onClick={() => setShowAllDoctorsModal(false)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc, idx) => {
                const badgeColors = [
                  'bg-amber-100 text-amber-900 border-amber-300',
                  'bg-blue-100 text-blue-900 border-blue-300',
                  'bg-teal-100 text-teal-900 border-teal-300',
                  'bg-purple-100 text-purple-900 border-purple-300'
                ][idx % 4];

                return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-400 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-teal-300 font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
                        {doc.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{doc.name}</h4>
                        <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border mt-1 ${badgeColors}`}>
                          {doc.specialization}
                        </span>
                        <p className="text-xs text-slate-500 font-medium mt-1">{doc.department} &bull; {doc.experience} {t('dashboard.exp_years')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Available Today
                      </span>
                      <button
                        onClick={() => {
                          setShowAllDoctorsModal(false);
                          navigate('/patient/book');
                        }}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition-all shadow-sm"
                      >
                        {t('dashboard.book_slot')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🚨 EMERGENCY PRIORITY BOOKING REQUEST MODAL 🚨 */}
      {showEmergencyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowEmergencyModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{t('emergency.modal_title')}</h3>
                  <p className="text-xs text-rose-600 font-bold">Priority Medical Verification Request</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emergencySubmittedSuccess ? (
              /* Success View */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h4 className="text-xl font-black text-slate-900">{t('emergency.success_title')}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {t('emergency.success_desc')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1 max-w-md mx-auto">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Verification Notice:
                  </p>
                  <p className="text-amber-800 font-medium leading-relaxed">
                    Your request for <strong>{(doctors.find(d => d.id === selectedEmergencyDoctorId) || doctors[0])?.name}</strong> on <strong>{emergencyDate}</strong> (Reason: "{emergencyReason}") has been logged. Admin will review and send you a confirmation message once slot is verified.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setShowEmergencyModal(false);
                      setEmergencySubmittedSuccess(false);
                    }}
                  >
                    Close & Check Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              /* Form View */
              <div className="space-y-5">
                {/* 1. Doctor Selection & Details */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    {t('emergency.select_doctor')}
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {doctors.map(doc => {
                      const isSelected = (selectedEmergencyDoctorId || doctors[0]?.id) === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedEmergencyDoctorId(doc.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/60 shadow-sm'
                              : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                              isSelected ? 'bg-rose-600 text-white' : 'bg-slate-900 text-teal-300'
                            }`}>
                              {doc.name.replace('Dr. ', '').charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-slate-900">{doc.name}</h5>
                              <p className="text-xs font-bold text-rose-600">{doc.specialization} &bull; {doc.department}</p>
                              <p className="text-[11px] text-slate-500 font-medium">{doc.experience} {t('dashboard.exp_years')}</p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="p-1.5 rounded-full bg-rose-600 text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Date Selection (Only Date) */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    {t('emergency.select_date')}
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={emergencyDate}
                    onChange={e => setEmergencyDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 font-bold text-sm bg-slate-50/50"
                  />
                </div>

                {/* 3. Priority Level Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    {t('emergency.priority_label')}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPriorityLevel('EMERGENCY')}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer space-y-1 ${
                        priorityLevel === 'EMERGENCY'
                          ? 'border-rose-600 bg-rose-50 text-rose-950 font-black shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-white'
                      }`}
                    >
                      <span className="block text-base">🔴</span>
                      <p className="text-[11px] leading-tight">{t('emergency.priority_emergency')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriorityLevel('HIGH')}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer space-y-1 ${
                        priorityLevel === 'HIGH'
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-white'
                      }`}
                    >
                      <span className="block text-base">🟠</span>
                      <p className="text-[11px] leading-tight">{t('emergency.priority_high')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriorityLevel('STANDARD')}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer space-y-1 ${
                        priorityLevel === 'STANDARD'
                          ? 'border-teal-500 bg-teal-50 text-teal-950 font-black shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-white'
                      }`}
                    >
                      <span className="block text-base">🟡</span>
                      <p className="text-[11px] leading-tight">{t('emergency.priority_standard')}</p>
                    </button>
                  </div>
                </div>

                {/* 3. Reason Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    {t('emergency.reason_label')} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={emergencyReason}
                    onChange={e => setEmergencyReason(e.target.value)}
                    placeholder={t('emergency.reason_placeholder')}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 text-xs font-medium bg-slate-50/50 resize-none"
                  />
                </div>

                {/* Admin Verification Information Note */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                  <p className="font-bold text-rose-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" /> Admin Verification Required:
                  </p>
                  <p className="text-rose-900 font-medium leading-relaxed">
                    {t('emergency.admin_note')}
                  </p>
                </div>

                {/* Action Submit Button */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitEmergencyRequest}
                    disabled={isSubmittingEmergency}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-xs transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingEmergency ? 'Submitting Request...' : t('emergency.submit_button')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚀 CAREPILOT APP FEATURES MODAL 🚀 */}
      <AppFeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
    </div>
  );
};
