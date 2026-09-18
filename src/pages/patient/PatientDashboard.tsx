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
  X,
  RefreshCw,
  XCircle,
  ArrowLeft,
  Mail,
  MessageSquare,
  PhoneCall
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { WelcomeSplashScreen } from '../../components/common/WelcomeSplashScreen';
import { AppFeaturesModal } from '../../components/common/AppFeaturesModal';
import { formatTime, getLocalDateString } from '../../utils/helpers';

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
  const [showGuideNote, setShowGuideNote] = useState(false);
  const [selectedEmergencyDoctorId, setSelectedEmergencyDoctorId] = useState<string>('');
  const [emergencyDate, setEmergencyDate] = useState<string>(() => getLocalDateString());
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

  const [showWelcomeSplash, setShowWelcomeSplash] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    const [aptsRes, waitRes, notifRes, docsRes] = await Promise.all([
      callBackend({ 
        action: 'GET_APPOINTMENTS', 
        data: { 
          role: 'patient', 
          userId: user?.id, 
          patientId: user?.id, 
          patient_id: user?.id,
          email: user?.email 
        } 
      }),
      callBackend({ action: 'GET_WAITLIST' }),
      callBackend({ action: 'GET_NOTIFICATIONS', data: { userId: user?.id } }),
      callBackend({ action: 'GET_DOCTORS' })
    ]);

    let docList: Doctor[] = [];
    if (docsRes.success && Array.isArray(docsRes.data)) {
      docList = docsRes.data;
      setDoctors(docList.filter((d: Doctor) => d.status === 'Active'));
    }

    if (aptsRes.success && Array.isArray(aptsRes.data)) {
      const userApts = user?.id 
        ? aptsRes.data.filter((a: Appointment) => {
            const aPid = (a.patientId || (a as any).patient_id || '').trim().toLowerCase();
            const uId = (user.id || '').trim().toLowerCase();
            const aEmail = (a.patientEmail || (a as any).email || '').trim().toLowerCase();
            const uEmail = (user.email || '').trim().toLowerCase();
            return aPid === uId || (uEmail && aEmail === uEmail);
          })
        : aptsRes.data;

      const enrichedApts = userApts.map((apt: Appointment) => {
        const matchedDoc = docList.find(d => d.id === apt.doctorId);
        return {
          ...apt,
          doctorName: apt.doctorName || matchedDoc?.name || (apt.doctorId ? `Doctor (${apt.doctorId})` : 'Doctor'),
          doctorSpecialization: apt.doctorSpecialization || matchedDoc?.specialization || matchedDoc?.department || ''
        };
      });

      setAppointments(enrichedApts);
    }
    if (waitRes.success && Array.isArray(waitRes.data)) {
      const uId = (user?.id || '').trim().toLowerCase();
      setWaitlist(waitRes.data.filter((w: WaitlistItem) => (w.patientId || (w as any).patient_id || '').trim().toLowerCase() === uId));
    }
    if (notifRes.success && Array.isArray(notifRes.data)) {
      setNotifications(notifRes.data.slice(0, 3));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, user?.email]);

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

  const nextAppointment = appointments.find(a => isAppointmentUpcoming(a));

  const attendedCount = appointments.filter(a => isAppointmentPast(a)).length;
  const rescheduledCount = appointments.filter(a => (a.status || '').toUpperCase() === 'RESCHEDULED').length;
  const cancelledCount = appointments.filter(a => isAppointmentCancelled(a)).length;
  const missedCount = appointments.filter(a => {
    const s = (a.status || '').toUpperCase();
    return s === 'NO_SHOW' || s === 'MISSED';
  }).length;

  const handleCancel = async (aptId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    const aptToCancel = appointments.find(a => a.id === aptId);
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

      {/* 🏥 OFFICIAL HOSPITAL DESK & COMMUNICATIONS BANNER 🏥 */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 p-5 rounded-3xl border-2 border-teal-500/30 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-500/20 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950">
                  Official Hospital Desk
                </span>
                <h3 className="text-base font-extrabold text-white">SNS Medical College & Hospital Contact Details</h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automated WhatsApp Reminders, Official Email Alerts & 24/7 Casualty Emergency Helpline
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
              24/7 Support Desk
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* WhatsApp No */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400 transition-colors flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Alerts No.</p>
              <a href="https://wa.me/918300096676" target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-300 text-sm hover:underline truncate block">
                +91 8300096676
              </a>
            </div>
          </div>

          {/* Email Address */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/30 hover:border-teal-400 transition-colors flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Email Desk</p>
              <a href="mailto:kanis.r.ad.2024@snsce.ac.in" className="font-mono font-bold text-teal-300 text-xs hover:underline truncate block">
                kanis.r.ad.2024@snsce.ac.in
              </a>
            </div>
          </div>

          {/* Emergency No */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-400 transition-colors flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">24/7 Emergency Helpline</p>
              <a href="tel:+914222661100" className="font-mono font-bold text-rose-300 text-sm hover:underline truncate block">
                +91 422 2661100
              </a>
            </div>
          </div>

          {/* Call Booking Support */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 transition-colors flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Call Booking Support</p>
              <a href="tel:+919876543210" className="font-mono font-bold text-amber-300 text-sm hover:underline truncate block">
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 PATIENT PORTAL 6 METRIC STATS BOXES IN ONE ROW 📊 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Box 1: Total Booking */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-teal-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={0} strokeLinecap="round" className="text-teal-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-slate-900 leading-none">{appointments.length}</p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('metric.total_booking')}</p>
          </div>
        </div>

        {/* Box 2: Total Attended */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-emerald-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={appointments.length > 0 ? 125.6 - (125.6 * (attendedCount / appointments.length)) : 0} strokeLinecap="round" className="text-emerald-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-emerald-600 leading-none">{attendedCount}</p>
            <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">{t('metric.total_attended')}</p>
          </div>
        </div>

        {/* Box 3: Total Rescheduled */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-blue-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={appointments.length > 0 ? 125.6 - (125.6 * (rescheduledCount / appointments.length)) : 125.6} strokeLinecap="round" className="text-blue-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-blue-600 leading-none">{rescheduledCount}</p>
            <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">{t('metric.total_rescheduled')}</p>
          </div>
        </div>

        {/* Box 4: Total Cancelled */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-rose-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={appointments.length > 0 ? 125.6 - (125.6 * (cancelledCount / appointments.length)) : 125.6} strokeLinecap="round" className="text-rose-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-rose-600 leading-none">{cancelledCount}</p>
            <p className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">{t('metric.total_cancelled')}</p>
          </div>
        </div>

        {/* Box 5: Total Missed */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-amber-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={appointments.length > 0 ? 125.6 - (125.6 * (missedCount / appointments.length)) : 125.6} strokeLinecap="round" className="text-amber-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-amber-600 leading-none">{missedCount}</p>
            <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">{t('metric.total_missed')}</p>
          </div>
        </div>

        {/* Box 6: Total Waitlist */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-purple-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={waitlist.length > 0 ? 0 : 90} strokeLinecap="round" className="text-purple-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-purple-600 leading-none">{waitlist.length}</p>
            <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">{t('metric.total_waitlist')}</p>
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
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-16 h-16 transform -rotate-90 absolute inset-0" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="4" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="#2DD4BF" strokeWidth="4" strokeDasharray={175.9} strokeDashoffset={25} strokeLinecap="round" className="animate-pulse" fill="transparent" />
                </svg>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                  {nextAppointment.doctorName.replace('Dr. ', '').charAt(0)}
                </div>
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

      {/* 📦 SQUARE ACTION BOXES WITH CIRCULAR ANIMATION RINGS 📦 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Box 1: Book Appointment */}
          <div
            onClick={() => navigate('/patient/book')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] cursor-pointer group"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" className="text-amber-100" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" strokeDasharray={125.6} strokeDashoffset={25} strokeLinecap="round" className="text-amber-500 group-hover:rotate-180 transition-transform duration-700" fill="transparent" />
              </svg>
              <div className="p-2.5 rounded-full bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <CalendarPlus className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">{t('nav.book_appointment')}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-0.5">Fast Slot Selection</p>
            </div>
          </div>

          {/* Box 2: Available Faculty Physicians */}
          <div
            onClick={() => setShowAllDoctorsModal(true)}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col items-center justify-center gap-2.5 text-center min-h-[120px] cursor-pointer group"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" className="text-teal-100" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" strokeDasharray={125.6} strokeDashoffset={15} strokeLinecap="round" className="text-teal-500 group-hover:rotate-180 transition-transform duration-700" fill="transparent" />
              </svg>
              <div className="p-2.5 rounded-full bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
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
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" className="text-indigo-100" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" strokeDasharray={125.6} strokeDashoffset={35} strokeLinecap="round" className="text-indigo-500 group-hover:rotate-180 transition-transform duration-700" fill="transparent" />
              </svg>
              <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
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
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" className="text-purple-100" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" strokeDasharray={125.6} strokeDashoffset={20} strokeLinecap="round" className="text-purple-500 group-hover:rotate-180 transition-transform duration-700" fill="transparent" />
              </svg>
              <div className="p-2.5 rounded-full bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">{t('nav.waitlist')}</p>
              <p className="text-[10px] font-bold text-purple-600 mt-0.5">{waitlist.length} Active Requests</p>
            </div>
          </div>
        </div>

      {/* 🏥 CAREPILOT SNS GUIDELINES INTERACTIVE BANNER (WHITE FORMAT WITH LINE BORDER) 🏥 */}
      <div
        onClick={() => setShowGuideNote(!showGuideNote)}
        className="p-4 md:p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 font-black flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            📋
          </div>
          <div>
            <h4 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-2 group-hover:text-teal-600 transition-colors">
              <span>{t('guidelines.banner_title')}</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t('guidelines.banner_sub')}
            </p>
          </div>
        </div>

        <div className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <span>{showGuideNote ? t('guidelines.close') : t('guidelines.open')}</span>
          <ChevronRight className={`w-4 h-4 text-white transition-transform ${showGuideNote ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
        </div>
      </div>

      {/* 📋 ELEGANT WHITE FORMAT CAREPILOT SNS GUIDELINES NOTE WITH LINE BORDER 📋 */}
      {showGuideNote && (
        <div className="p-6 md:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-md text-slate-900 space-y-4 relative overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between relative z-10 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 font-black flex items-center justify-center shadow-xs text-lg flex-shrink-0">
                📋
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{t('guidelines.main_title')}</h4>
                <p className="text-xs text-slate-500 font-semibold">{t('guidelines.main_sub')}</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 tracking-wider">
              {t('note.label')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-800 font-medium relative z-10">
            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-1 hover:border-teal-300 transition-colors">
              <p className="font-extrabold text-teal-800 flex items-center gap-1.5 text-xs">
                <span>{t('guidelines.card1_title')}</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t('guidelines.card1_desc')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-1 hover:border-blue-300 transition-colors">
              <p className="font-extrabold text-blue-900 flex items-center gap-1.5 text-xs">
                <span>{t('guidelines.card2_title')}</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t('guidelines.card2_desc')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-1 hover:border-emerald-300 transition-colors">
              <p className="font-extrabold text-emerald-800 flex items-center gap-1.5 text-xs">
                <span>{t('guidelines.card3_title')}</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t('guidelines.card3_desc')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-1 hover:border-rose-300 transition-colors">
              <p className="font-extrabold text-rose-800 flex items-center gap-1.5 text-xs">
                <span>{t('guidelines.card4_title')}</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t('guidelines.card4_desc')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-1 hover:border-purple-300 transition-colors">
              <p className="font-extrabold text-purple-800 flex items-center gap-1.5 text-xs">
                <span>{t('guidelines.card5_title')}</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t('guidelines.card5_desc')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-xs space-y-1 hover:border-indigo-300 transition-colors">
              <p className="font-extrabold text-indigo-800 flex items-center gap-1.5 text-xs">
                <span>{t('guidelines.card6_title')}</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t('guidelines.card6_desc')}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* 🚀 CAREPILOT APP FEATURES MODAL 🚀 */}
      <AppFeaturesModal isOpen={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
    </div>
  );
};
