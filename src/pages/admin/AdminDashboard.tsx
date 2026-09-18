import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { getLocalDateString } from '../../utils/helpers';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { callBackend } from '../../services/api';
import { AnalyticsData, Appointment, Doctor, Patient, WaitlistItem, RiskLevel } from '../../types';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  RefreshCw,
  XCircle,
  UserCheck,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Mail,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  Hospital,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { AIRiskBadge } from '../../components/ai/AIRiskBadge';
import { Modal } from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(getLocalDateString());
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [allAppointmentsList, setAllAppointmentsList] = useState<Appointment[]>([]);
  const [expandedMetricKey, setExpandedMetricKey] = useState<
    'appointments' | 'attended' | 'cancelled' | 'rescheduled' | 'waitlist' | 'accepted_waitlist' | 'missed' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | null
  >(null);
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Metrics State
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalCancelled: 0,
    totalRescheduled: 0,
    totalMissed: 0,
    totalWaitlistCount: 0,
    activeDoctors: 0,
    todayAppointments: 0,
    todayAttended: 0,
    todayCancelled: 0,
    todayRescheduled: 0,
    todayMissed: 0,
    waitlistCount: 0,
    acceptedWaitlistCount: 0
  });

  const normalizeDateStr = (d: any): string => {
    if (!d) return '';
    const s = String(d).trim();
    if (s.includes('T')) return s.split('T')[0];
    if (s.includes(' ')) return s.split(' ')[0];
    return s;
  };

  const isAttendedStatus = (status: string | undefined): boolean => {
    if (!status) return false;
    const s = status.trim().toUpperCase();
    return s === 'COMPLETED' || s === 'ATTENDED' || s === 'CHECKED_IN' || s === 'CHECKED_OUT';
  };

  const getRiskLevel = (a: Appointment): 'LOW' | 'MEDIUM' | 'HIGH' => {
    const raw = ((a as any).risk_level || (a.risk && a.risk.level) || 'LOW').toString().trim().toUpperCase();
    if (raw === 'HIGH') return 'HIGH';
    if (raw === 'MEDIUM' || raw === 'MED') return 'MEDIUM';
    return 'LOW';
  };

  const getFilteredMetricLabel = (type: 'appointments' | 'cancelled' | 'rescheduled' | 'missed' | 'attended') => {
    if (type === 'attended') {
      if (dateRange === 'yesterday') return t('metric.yesterdays_attended');
      if (dateRange === 'custom') return t('metric.custom_attended');
      return t('metric.todays_attended');
    }
    if (type === 'appointments') {
      if (dateRange === 'yesterday') return t('metric.yesterdays_appointments');
      if (dateRange === 'custom') return t('metric.custom_appointments');
      return t('metric.todays_appointments');
    }
    if (type === 'cancelled') {
      if (dateRange === 'yesterday') return t('metric.yesterdays_cancelled');
      if (dateRange === 'custom') return t('metric.custom_cancelled');
      return t('metric.todays_cancelled');
    }
    if (type === 'rescheduled') {
      if (dateRange === 'yesterday') return t('metric.yesterdays_rescheduled');
      if (dateRange === 'custom') return t('metric.custom_rescheduled');
      return t('metric.todays_rescheduled');
    }
    if (type === 'missed') {
      if (dateRange === 'yesterday') return t('metric.yesterdays_missed');
      if (dateRange === 'custom') return t('metric.custom_missed');
      return t('metric.todays_missed');
    }
    return '';
  };

  const getFilteredRiskLabel = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') {
      if (dateRange === 'yesterday') return t('metric.yesterdays_low_risk');
      if (dateRange === 'custom') return t('metric.custom_low_risk');
      return t('metric.todays_low_risk');
    }
    if (level === 'medium') {
      if (dateRange === 'yesterday') return t('metric.yesterdays_medium_risk');
      if (dateRange === 'custom') return t('metric.custom_medium_risk');
      return t('metric.todays_medium_risk');
    }
    if (dateRange === 'yesterday') return t('metric.yesterdays_high_risk');
    if (dateRange === 'custom') return t('metric.custom_high_risk');
    return t('metric.todays_high_risk');
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      callBackend({ action: 'GET_ANALYTICS', data: { dateRange } }),
      callBackend({ action: 'GET_APPOINTMENTS', data: {} }),
      callBackend({ action: 'GET_PATIENTS', data: {} }),
      callBackend({ action: 'GET_DOCTORS', data: {} }),
      callBackend({ action: 'GET_WAITLIST', data: {} })
    ]).then(([analyticsRes, aptsRes, patsRes, docsRes, waitRes]) => {
      if (isMounted) {
        const aptsList: Appointment[] = (aptsRes.success && Array.isArray(aptsRes.data)) ? aptsRes.data : [];
        const patsList: Patient[] = (patsRes.success && Array.isArray(patsRes.data)) ? patsRes.data : [];
        const docsList: Doctor[] = (docsRes.success && Array.isArray(docsRes.data)) ? docsRes.data : [];
        const waitList: WaitlistItem[] = (waitRes.success && Array.isArray(waitRes.data)) ? waitRes.data : [];

        const todayStr = getLocalDateString();
        let targetDateStr = todayStr;

        if (dateRange === 'yesterday') {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          targetDateStr = getLocalDateString(y);
        } else if (dateRange === 'custom') {
          targetDateStr = normalizeDateStr(customDate) || todayStr;
        }

        const dateFilteredApts = aptsList.filter(a => normalizeDateStr(a.appointmentDate) === targetDateStr);
        const dateFilteredWaitlist = waitList.filter(w => normalizeDateStr(w.requestedDate) === targetDateStr || normalizeDateStr(w.createdAt) === targetDateStr);
        const activeDocsCount = docsList.filter(d => (d.status || '').toUpperCase() === 'ACTIVE').length || docsList.length || 4;
        const workingDocsCount = new Set(dateFilteredApts.map(a => a.doctorId)).size;

        const dateAttendedCount = dateFilteredApts.filter(a => isAttendedStatus(a.status)).length;

        const calculatedMetrics = {
          totalPatients: patsList.length,
          totalAppointments: aptsList.length,
          totalCancelled: aptsList.filter(a => (a.status || '').toUpperCase() === 'CANCELLED').length,
          totalRescheduled: aptsList.filter(a => (a.status || '').toUpperCase() === 'RESCHEDULED').length,
          totalMissed: aptsList.filter(a => (a.status || '').toUpperCase() === 'NO_SHOW' || (a.status || '').toUpperCase() === 'MISSED').length,
          totalWaitlistCount: waitList.length,
          activeDoctors: workingDocsCount > 0 ? workingDocsCount : activeDocsCount,
          todayAppointments: dateFilteredApts.length,
          todayAttended: dateAttendedCount,
          todayCancelled: dateFilteredApts.filter(a => (a.status || '').toUpperCase() === 'CANCELLED').length,
          todayRescheduled: dateFilteredApts.filter(a => (a.status || '').toUpperCase() === 'RESCHEDULED').length,
          todayMissed: dateFilteredApts.filter(a => (a.status || '').toUpperCase() === 'NO_SHOW' || (a.status || '').toUpperCase() === 'MISSED').length,
          waitlistCount: dateFilteredWaitlist.length,
          acceptedWaitlistCount: dateFilteredWaitlist.filter(w => (w.status || '').toUpperCase() === 'ACCEPTED' || (w.status || '').toUpperCase() === 'CONFIRMED').length
        };

        setMetrics(calculatedMetrics);

        const filteredLowCount = dateFilteredApts.filter(a => getRiskLevel(a) === 'LOW').length;
        const filteredMedCount = dateFilteredApts.filter(a => getRiskLevel(a) === 'MEDIUM').length;
        const filteredHighCount = dateFilteredApts.filter(a => getRiskLevel(a) === 'HIGH').length;

        const lowCount = aptsList.filter(a => getRiskLevel(a) === 'LOW').length;
        const medCount = aptsList.filter(a => getRiskLevel(a) === 'MEDIUM').length;
        const highCount = aptsList.filter(a => getRiskLevel(a) === 'HIGH').length;

        const liveAnalytics: AnalyticsData = {
          totalPatients: calculatedMetrics.totalPatients,
          totalDoctors: calculatedMetrics.activeDoctors,
          totalAppointments: calculatedMetrics.totalAppointments,
          todayAppointments: calculatedMetrics.todayAppointments,
          attendanceRate: aptsList.length > 0 ? parseFloat(((aptsList.filter(a => isAttendedStatus(a.status)).length / aptsList.length) * 100).toFixed(1)) : 0,
          noShowRate: aptsList.length > 0 ? parseFloat(((aptsList.filter(a => (a.status || '').toUpperCase() === 'NO_SHOW' || (a.status || '').toUpperCase() === 'MISSED').length / aptsList.length) * 100).toFixed(1)) : 0,
          cancellationRate: aptsList.length > 0 ? parseFloat(((aptsList.filter(a => (a.status || '').toUpperCase() === 'CANCELLED').length / aptsList.length) * 100).toFixed(1)) : 0,
          waitlistRecoveryRate: waitList.length > 0 ? parseFloat(((waitList.filter(w => (w.status || '').toUpperCase() === 'ACCEPTED' || (w.status || '').toUpperCase() === 'CONFIRMED').length / waitList.length) * 100).toFixed(1)) : 0,
          highRiskCount: dateFilteredApts.length > 0 ? filteredHighCount : highCount,
          mediumRiskCount: dateFilteredApts.length > 0 ? filteredMedCount : medCount,
          lowRiskCount: dateFilteredApts.length > 0 ? filteredLowCount : lowCount,
          doctorUtilization: 0,
          appointmentTrends: [],
          noShowTrends: [],
          doctorUtilizationData: [],
          waitlistRecoveryData: []
        };

        setAnalytics(liveAnalytics);
        setAllAppointmentsList(aptsList);
        setRecentAppointments(aptsList.slice(0, 5));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dateRange, customDate]);

  const getPatientsForMetricKey = (key: string): Appointment[] => {
    const todayStr = getLocalDateString();
    let targetDateStr = todayStr;
    if (dateRange === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      targetDateStr = getLocalDateString(y);
    } else if (dateRange === 'custom') {
      targetDateStr = normalizeDateStr(customDate) || todayStr;
    }

    const dateFiltered = allAppointmentsList.filter(a => normalizeDateStr(a.appointmentDate) === targetDateStr);
    const listToFilter = dateFiltered;

    if (key === 'LOW_RISK' || key === 'MEDIUM_RISK' || key === 'HIGH_RISK') {
      const targetLevel = key === 'LOW_RISK' ? 'LOW' : key === 'MEDIUM_RISK' ? 'MEDIUM' : 'HIGH';
      return listToFilter.filter(a => getRiskLevel(a) === targetLevel);
    }

    if (key === 'attended') {
      return listToFilter.filter(a => isAttendedStatus(a.status));
    }

    if (key === 'cancelled') {
      return listToFilter.filter(a => (a.status || '').toUpperCase() === 'CANCELLED');
    }

    if (key === 'rescheduled') {
      return listToFilter.filter(a => (a.status || '').toUpperCase() === 'RESCHEDULED');
    }

    if (key === 'missed') {
      return listToFilter.filter(a => (a.status || '').toUpperCase() === 'NO_SHOW' || (a.status || '').toUpperCase() === 'MISSED');
    }

    return listToFilter;
  };

  const formatStatus = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'CONFIRMED') return t('status.confirmed');
    if (s === 'COMPLETED' || s === 'ATTENDED') return t('status.completed');
    if (s === 'CHECKED_IN') return language === 'ta' ? 'பதிவு செய்யப்பட்டது' : 'CHECKED IN';
    if (s === 'CHECKED_OUT') return language === 'ta' ? 'முடிந்தது' : 'CHECKED OUT';
    if (s === 'CANCELLED') return t('status.cancelled');
    if (s === 'RESCHEDULED') return language === 'ta' ? 'மறுதேதியிடப்பட்டது' : 'RESCHEDULED';
    if (s === 'NO_SHOW' || s === 'MISSED') return t('status.not_attended');
    return status;
  };

  if (loading || !analytics) {
    return (
      <div>
        <Header title={t('nav.dashboard')} />
        <div className="py-20">
          <Loading message={t('dashboard.fetching_metrics')} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title={t('nav.dashboard')} />

      {/* 🏥 HOSPITAL OVERVIEW & PATIENT STATS HEADER BAR 🏥 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-900">{t('dashboard.daily_hospital_ops')}</h2>
          <p className="text-xs text-slate-500">{t('dashboard.realtime_schedules_sub')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['today', 'yesterday'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3.5 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                  dateRange === range
                    ? 'bg-gradient-to-r from-amber-500 via-teal-600 to-purple-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'yesterday' ? t('dashboard.yesterday') : t('dashboard.today')}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateRange('custom');
              }}
              className={`px-2 py-1 rounded-lg border text-xs bg-white text-slate-800 font-semibold focus:outline-none transition-all cursor-pointer ${
                dateRange === 'custom' ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 🌟 BOTTOM SECTION: TODAY'S & ACTIVE METRICS (BELOW HOSPITAL OVERVIEW) 🌟 */}
      {/* 7-Box Horizontal Row with Patient Dashboard Style SVG Progress Circles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Box 1: Appointments */}
        <div
          onClick={() => setExpandedMetricKey(expandedMetricKey === 'appointments' ? null : 'appointments')}
          className={`relative p-3.5 rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group cursor-pointer ${
            expandedMetricKey === 'appointments' ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-50/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMetricKey(expandedMetricKey === 'appointments' ? null : 'appointments');
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all cursor-pointer z-10 ${
              expandedMetricKey === 'appointments'
                ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-300'
                : 'bg-slate-100 hover:bg-teal-100 text-slate-400 hover:text-teal-700'
            }`}
            title={t('dashboard.click_view_apts_list')}
          >
            {expandedMetricKey === 'appointments' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0 animate-pulse" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-teal-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 0 : 125.6} strokeLinecap="round" className="text-teal-500 transition-all duration-700 animate-pulse" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform animate-pulse ring-2 ring-teal-400/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-teal-600 leading-none">{metrics.todayAppointments}</p>
            <p className="text-[10px] font-extrabold text-teal-900 uppercase tracking-wider">{getFilteredMetricLabel('appointments')}</p>
          </div>
        </div>

        {/* Box 2: Attended Appointments */}
        <div
          onClick={() => setExpandedMetricKey(expandedMetricKey === 'attended' ? null : 'attended')}
          className={`relative p-3.5 rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group cursor-pointer ${
            expandedMetricKey === 'attended' ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMetricKey(expandedMetricKey === 'attended' ? null : 'attended');
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all cursor-pointer z-10 ${
              expandedMetricKey === 'attended'
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                : 'bg-slate-100 hover:bg-emerald-100 text-slate-400 hover:text-emerald-700'
            }`}
            title={t('dashboard.click_view_attended_list')}
          >
            {expandedMetricKey === 'attended' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0 animate-pulse" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-emerald-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 125.6 - (125.6 * (metrics.todayAttended / metrics.todayAppointments)) : 0} strokeLinecap="round" className="text-emerald-500 transition-all duration-700 animate-pulse" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform animate-pulse ring-2 ring-emerald-400/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-emerald-600 leading-none">{metrics.todayAttended}</p>
            <p className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider">{getFilteredMetricLabel('attended')}</p>
          </div>
        </div>

        {/* Box 3: Appointments Cancelled */}
        <div
          onClick={() => setExpandedMetricKey(expandedMetricKey === 'cancelled' ? null : 'cancelled')}
          className={`relative p-3.5 rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group cursor-pointer ${
            expandedMetricKey === 'cancelled' ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMetricKey(expandedMetricKey === 'cancelled' ? null : 'cancelled');
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all cursor-pointer z-10 ${
              expandedMetricKey === 'cancelled'
                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                : 'bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700'
            }`}
            title={t('dashboard.click_view_cancelled_list')}
          >
            {expandedMetricKey === 'cancelled' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0 animate-pulse" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-rose-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 125.6 - (125.6 * (metrics.todayCancelled / metrics.todayAppointments)) : 125.6} strokeLinecap="round" className="text-rose-500 transition-all duration-700 animate-pulse" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform animate-pulse ring-2 ring-rose-400/40">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-rose-600 leading-none">{metrics.todayCancelled}</p>
            <p className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider">{getFilteredMetricLabel('cancelled')}</p>
          </div>
        </div>

        {/* Box 4: Appointments Rescheduled */}
        <div
          onClick={() => setExpandedMetricKey(expandedMetricKey === 'rescheduled' ? null : 'rescheduled')}
          className={`relative p-3.5 rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group cursor-pointer ${
            expandedMetricKey === 'rescheduled' ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMetricKey(expandedMetricKey === 'rescheduled' ? null : 'rescheduled');
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all cursor-pointer z-10 ${
              expandedMetricKey === 'rescheduled'
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                : 'bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-700'
            }`}
            title={t('dashboard.click_view_rescheduled_list')}
          >
            {expandedMetricKey === 'rescheduled' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0 animate-pulse" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-blue-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 125.6 - (125.6 * (metrics.todayRescheduled / metrics.todayAppointments)) : 125.6} strokeLinecap="round" className="text-blue-500 transition-all duration-700 animate-pulse" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform animate-pulse ring-2 ring-blue-400/40">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-blue-600 leading-none">{metrics.todayRescheduled}</p>
            <p className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">{getFilteredMetricLabel('rescheduled')}</p>
          </div>
        </div>

        {/* Box 5: Waitlist */}
        <div
          onClick={() => setExpandedMetricKey(expandedMetricKey === 'waitlist' ? null : 'waitlist')}
          className={`relative p-3.5 rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group cursor-pointer ${
            expandedMetricKey === 'waitlist' ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMetricKey(expandedMetricKey === 'waitlist' ? null : 'waitlist');
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all cursor-pointer z-10 ${
              expandedMetricKey === 'waitlist'
                ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                : 'bg-slate-100 hover:bg-amber-100 text-slate-400 hover:text-amber-700'
            }`}
            title={t('dashboard.click_view_waitlist_list')}
          >
            {expandedMetricKey === 'waitlist' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0 animate-pulse" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-amber-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={0} strokeLinecap="round" className="text-amber-500 transition-all duration-700 animate-pulse" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform animate-pulse ring-2 ring-amber-400/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-amber-600 leading-none">{metrics.waitlistCount}</p>
            <p className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider">{t('metric.emergency_waitlist')}</p>
          </div>
        </div>

        {/* Box 6: Accepted Waitlist */}
        <div
          onClick={() => setExpandedMetricKey(expandedMetricKey === 'accepted_waitlist' ? null : 'accepted_waitlist')}
          className={`relative p-3.5 rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group cursor-pointer ${
            expandedMetricKey === 'accepted_waitlist' ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMetricKey(expandedMetricKey === 'accepted_waitlist' ? null : 'accepted_waitlist');
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all cursor-pointer z-10 ${
              expandedMetricKey === 'accepted_waitlist'
                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                : 'bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-700'
            }`}
            title={t('dashboard.click_view_accepted_list')}
          >
            {expandedMetricKey === 'accepted_waitlist' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0 animate-pulse" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-indigo-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={0} strokeLinecap="round" className="text-indigo-500 transition-all duration-700 animate-pulse" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform animate-pulse ring-2 ring-indigo-400/40">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-indigo-600 leading-none">{metrics.acceptedWaitlistCount}</p>
            <p className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider">{t('metric.accepted_waitlist')}</p>
          </div>
        </div>

        {/* Box 7: Missed / No-Show Absences */}
        <div
          onClick={() => setExpandedMetricKey(expandedMetricKey === 'missed' ? null : 'missed')}
          className={`relative p-3.5 rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group col-span-2 sm:col-span-1 cursor-pointer ${
            expandedMetricKey === 'missed' ? 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-50/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedMetricKey(expandedMetricKey === 'missed' ? null : 'missed');
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all cursor-pointer z-10 ${
              expandedMetricKey === 'missed'
                ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                : 'bg-slate-100 hover:bg-purple-100 text-slate-400 hover:text-purple-700'
            }`}
            title={t('dashboard.click_view_missed_list')}
          >
            {expandedMetricKey === 'missed' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0 animate-pulse" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-purple-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 125.6 - (125.6 * (metrics.todayMissed / metrics.todayAppointments)) : 125.6} strokeLinecap="round" className="text-purple-500 transition-all duration-700 animate-pulse" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform animate-pulse ring-2 ring-purple-400/40">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-purple-600 leading-none">{metrics.todayMissed}</p>
            <p className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider">{getFilteredMetricLabel('missed')}</p>
          </div>
        </div>
      </div>

      {/* 📥 EXPANDABLE PATIENT LIST PANEL FOR TOP METRIC CARDS 📥 */}
      {expandedMetricKey && ['appointments', 'attended', 'cancelled', 'rescheduled', 'waitlist', 'accepted_waitlist', 'missed'].includes(expandedMetricKey) && (
        <div className="rounded-3xl bg-white border-2 border-slate-200 shadow-xl p-5 md:p-6 transition-all duration-300 animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-2xl text-white shadow-md ${
                expandedMetricKey === 'attended' ? 'bg-emerald-600' :
                expandedMetricKey === 'cancelled' ? 'bg-rose-600' :
                expandedMetricKey === 'rescheduled' ? 'bg-blue-600' :
                expandedMetricKey === 'missed' ? 'bg-purple-600' :
                expandedMetricKey === 'waitlist' ? 'bg-amber-600' :
                expandedMetricKey === 'accepted_waitlist' ? 'bg-indigo-600' : 'bg-teal-600'
              }`}>
                {expandedMetricKey === 'attended' && <CheckCircle2 className="w-5 h-5" />}
                {expandedMetricKey === 'cancelled' && <XCircle className="w-5 h-5" />}
                {expandedMetricKey === 'rescheduled' && <RefreshCw className="w-5 h-5" />}
                {expandedMetricKey === 'missed' && <AlertCircle className="w-5 h-5" />}
                {expandedMetricKey === 'waitlist' && <Clock className="w-5 h-5" />}
                {expandedMetricKey === 'accepted_waitlist' && <UserCheck className="w-5 h-5" />}
                {expandedMetricKey === 'appointments' && <Clock className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {dateRange === 'yesterday' ? t('dashboard.yesterdays') : dateRange === 'custom' ? t('dashboard.selected_dates') : t('dashboard.todays')} {
                      expandedMetricKey === 'attended' ? t('metric.attended_visits') :
                      expandedMetricKey === 'cancelled' ? t('metric.cancelled_slots') :
                      expandedMetricKey === 'rescheduled' ? t('metric.rescheduled_slots') :
                      expandedMetricKey === 'missed' ? t('metric.noshow_absences') :
                      expandedMetricKey === 'waitlist' ? t('metric.emergency_waitlist') :
                      expandedMetricKey === 'accepted_waitlist' ? t('metric.accepted_waitlist') : t('metric.todays_appointments')
                    } {t('dashboard.patient_list')}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                    {getPatientsForMetricKey(expandedMetricKey).length} {t('dashboard.patient_count')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {t('dashboard.patient_list_sub')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setExpandedMetricKey(null)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title={t('dashboard.close_patient_list')}
            >
              <X className="w-4 h-4" />
              <span>{t('dashboard.close')}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-xs bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-black uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 text-indigo-300">{t('table.appointment_id')}</th>
                  <th className="py-3.5 px-4 text-white">{t('table.patient_name')}</th>
                  <th className="py-3.5 px-4 text-purple-300">{t('table.physician_dept')}</th>
                  <th className="py-3.5 px-4 text-amber-300">{t('table.time_date')}</th>
                  <th className="py-3.5 px-4 text-teal-300">{t('table.ai_risk')}</th>
                  <th className="py-3.5 px-4 text-emerald-300">{t('table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {getPatientsForMetricKey(expandedMetricKey).map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{apt.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 via-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white">
                          {apt.patientName ? apt.patientName.charAt(0) : 'P'}
                        </div>
                        <span className="font-extrabold text-slate-900 text-xs">{apt.patientName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{apt.doctorName || t('dashboard.assigned_specialist')}</p>
                        <span className="text-[10px] font-semibold text-slate-500">{apt.doctorSpecialization || t('dashboard.general_practice')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700">
                        <span className="font-bold text-slate-900">{apt.appointmentTime || '09:00 AM'}</span>
                        <p className="text-[10px] text-slate-400">{apt.appointmentDate || (dateRange === 'yesterday' ? t('dashboard.yesterday') : dateRange === 'custom' ? customDate : t('dashboard.today'))}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <AIRiskBadge risk={apt.risk || { level: 'LOW', probability: 0.1, factors: [] }} showProbability size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider shadow-xs ${
                        apt.status === 'CONFIRMED' || apt.status === 'COMPLETED' || apt.status === 'CHECKED_IN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : apt.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : apt.status === 'RESCHEDULED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {formatStatus(apt.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔮 ROW 3: AI NO-SHOW RISK BREAKDOWN CARDS (TODAY'S / DATE-FILTERED LOW, MEDIUM, HIGH RISK IN NEW HIGH-TECH STYLE) 🔮 */}
      <div className="space-y-3">
        {/* Risk Section Title Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Sparkles className="w-4 h-4 animate-pulse text-indigo-600" />
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t('dashboard.ai_risk_breakdown')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                {dateRange === 'yesterday' ? t('dashboard.yesterday') : dateRange === 'custom' ? customDate : t('dashboard.today')}
              </span>
            </h3>
          </div>
        </div>

        {/* 3 High-Tech Styled Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Low Risk Card */}
          <div
            onClick={() => setExpandedMetricKey(expandedMetricKey === 'LOW_RISK' ? null : 'LOW_RISK')}
            className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-900/5 via-emerald-50/40 to-teal-50/30 border-2 transition-all group cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
              expandedMetricKey === 'LOW_RISK' ? 'border-emerald-500 ring-4 ring-emerald-500/30 shadow-xl' : 'border-emerald-300/80 shadow-md hover:shadow-xl hover:border-emerald-400'
            }`}
          >
            {/* Ambient Background Blur Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center space-x-3">
                {/* SVG Progress Circle */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-emerald-100" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (125.6 * (analytics.lowRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))))}
                      strokeLinecap="round"
                      className="text-emerald-500 transition-all duration-700 animate-pulse"
                      fill="transparent"
                    />
                  </svg>
                  <div className="p-2.5 rounded-full bg-emerald-100/80 text-emerald-700 shadow-inner">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                    {getFilteredRiskLabel('low')}
                  </p>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {analytics.lowRiskCount}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> {t('risk.low')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedMetricKey(expandedMetricKey === 'LOW_RISK' ? null : 'LOW_RISK');
                  }}
                  className={`p-1.5 rounded-full transition-all cursor-pointer z-10 ${
                    expandedMetricKey === 'LOW_RISK'
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800'
                  }`}
                  title={t('dashboard.click_view_low_risk_list')}
                >
                  {expandedMetricKey === 'LOW_RISK' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Percentage Bar & Protocol */}
            <div className="mt-4 pt-3 border-t border-emerald-200/60 relative z-10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                <span>{t('dashboard.distribution_volume')}</span>
                <span>
                  {Math.round((analytics.lowRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))) * 100)}%
                </span>
              </div>
              <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((analytics.lowRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))) * 100))}%`
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="flex items-center gap-1">
                  {t('dashboard.action_label')}: {t('dashboard.email')} <Mail className="w-3 h-3 inline text-emerald-600" /> & {t('dashboard.whatsapp')} <MessageSquare className="w-3 h-3 inline text-emerald-600" />
                </span>
              </div>
            </div>
          </div>

          {/* 2. Medium Risk Card */}
          <div
            onClick={() => setExpandedMetricKey(expandedMetricKey === 'MEDIUM_RISK' ? null : 'MEDIUM_RISK')}
            className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-amber-900/5 via-amber-50/40 to-orange-50/30 border-2 transition-all group cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
              expandedMetricKey === 'MEDIUM_RISK' ? 'border-amber-500 ring-4 ring-amber-500/30 shadow-xl' : 'border-amber-300/80 shadow-md hover:shadow-xl hover:border-amber-400'
            }`}
          >
            {/* Ambient Background Blur Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center space-x-3">
                {/* SVG Progress Circle */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-amber-100" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (125.6 * (analytics.mediumRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))))}
                      strokeLinecap="round"
                      className="text-amber-500 transition-all duration-700 animate-pulse"
                      fill="transparent"
                    />
                  </svg>
                  <div className="p-2.5 rounded-full bg-amber-100/80 text-amber-700 shadow-inner">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    {getFilteredRiskLabel('medium')}
                  </p>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {analytics.mediumRiskCount}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> {t('risk.medium')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedMetricKey(expandedMetricKey === 'MEDIUM_RISK' ? null : 'MEDIUM_RISK');
                  }}
                  className={`p-1.5 rounded-full transition-all cursor-pointer z-10 ${
                    expandedMetricKey === 'MEDIUM_RISK'
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-100/80 hover:bg-amber-200 text-amber-800'
                  }`}
                  title={t('dashboard.click_view_med_risk_list')}
                >
                  {expandedMetricKey === 'MEDIUM_RISK' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Percentage Bar & Protocol */}
            <div className="mt-4 pt-3 border-t border-amber-200/60 relative z-10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span>{t('dashboard.distribution_volume')}</span>
                <span>
                  {Math.round((analytics.mediumRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))) * 100)}%
                </span>
              </div>
              <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((analytics.mediumRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))) * 100))}%`
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 pt-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="flex items-center gap-1">
                  {t('dashboard.action_label')}: {t('dashboard.email')} <Mail className="w-3 h-3 inline text-amber-600" /> & {t('dashboard.whatsapp')} <MessageSquare className="w-3 h-3 inline text-amber-600" />
                </span>
              </div>
            </div>
          </div>

          {/* 3. High Risk Card */}
          <div
            onClick={() => setExpandedMetricKey(expandedMetricKey === 'HIGH_RISK' ? null : 'HIGH_RISK')}
            className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-rose-900/5 via-rose-50/40 to-red-50/30 border-2 transition-all group cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
              expandedMetricKey === 'HIGH_RISK' ? 'border-rose-500 ring-4 ring-rose-500/30 shadow-xl' : 'border-rose-300/80 shadow-md hover:shadow-xl hover:border-rose-400'
            }`}
          >
            {/* Ambient Background Blur Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center space-x-3">
                {/* SVG Progress Circle */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-rose-100" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (125.6 * (analytics.highRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))))}
                      strokeLinecap="round"
                      className="text-rose-500 transition-all duration-700 animate-pulse"
                      fill="transparent"
                    />
                  </svg>
                  <div className="p-2.5 rounded-full bg-rose-100/80 text-rose-700 shadow-inner animate-bounce">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-rose-900">
                    {getFilteredRiskLabel('high')}
                  </p>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {analytics.highRiskCount}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-100 text-rose-800 border border-rose-300 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> {t('risk.high')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedMetricKey(expandedMetricKey === 'HIGH_RISK' ? null : 'HIGH_RISK');
                  }}
                  className={`p-1.5 rounded-full transition-all cursor-pointer z-10 ${
                    expandedMetricKey === 'HIGH_RISK'
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                      : 'bg-rose-100/80 hover:bg-rose-200 text-rose-800'
                  }`}
                  title={t('dashboard.click_view_high_risk_list')}
                >
                  {expandedMetricKey === 'HIGH_RISK' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Percentage Bar & Protocol */}
            <div className="mt-4 pt-3 border-t border-rose-200/60 relative z-10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-rose-900">
                <span>{t('dashboard.distribution_volume')}</span>
                <span>
                  {Math.round((analytics.highRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))) * 100)}%
                </span>
              </div>
              <div className="w-full bg-rose-200/60 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((analytics.highRiskCount / Math.max(1, (analytics.lowRiskCount + analytics.mediumRiskCount + analytics.highRiskCount))) * 100))}%`
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800 pt-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="flex items-center gap-1">
                  {t('dashboard.action_label')}: {t('dashboard.email')} <Mail className="w-3 h-3 inline text-rose-600" /> & {t('dashboard.whatsapp')} <MessageSquare className="w-3 h-3 inline text-rose-600" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 📥 EXPANDABLE PATIENT LIST PANEL FOR LOW, MEDIUM, HIGH RISK CARDS (RENDERS BELOW RISK CARDS) 📥 */}
        {expandedMetricKey && ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'].includes(expandedMetricKey) && (
          <div className="rounded-3xl bg-white border-2 border-slate-200 shadow-xl p-5 md:p-6 transition-all duration-300 animate-fadeIn space-y-4 mt-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-2xl text-white shadow-md ${
                  expandedMetricKey === 'LOW_RISK' ? 'bg-emerald-600' :
                  expandedMetricKey === 'MEDIUM_RISK' ? 'bg-amber-600' : 'bg-rose-600'
                }`}>
                  {expandedMetricKey === 'LOW_RISK' && <ShieldCheck className="w-5 h-5" />}
                  {expandedMetricKey === 'MEDIUM_RISK' && <AlertTriangle className="w-5 h-5" />}
                  {expandedMetricKey === 'HIGH_RISK' && <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {dateRange === 'yesterday' ? t('dashboard.yesterdays') : dateRange === 'custom' ? t('dashboard.selected_dates') : t('dashboard.todays')} {
                        expandedMetricKey === 'LOW_RISK' ? t('dashboard.low_risk') :
                        expandedMetricKey === 'MEDIUM_RISK' ? t('dashboard.medium_risk') : t('dashboard.high_risk')
                      } {t('dashboard.patient_breakdown')}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                      {getPatientsForMetricKey(expandedMetricKey).length} {t('dashboard.patient_count')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {t('dashboard.risk_patient_sub').replace('{level}', (expandedMetricKey === 'LOW_RISK' ? t('dashboard.low_risk') : expandedMetricKey === 'MEDIUM_RISK' ? t('dashboard.medium_risk') : t('dashboard.high_risk')))}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpandedMetricKey(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                title={t('dashboard.close_patient_list')}
              >
                <X className="w-4 h-4" />
                <span>{t('dashboard.close')}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 font-black uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-4 text-indigo-300">{t('table.appointment_id')}</th>
                    <th className="py-3.5 px-4 text-white">{t('table.patient_name')}</th>
                    <th className="py-3.5 px-4 text-purple-300">{t('table.physician_dept')}</th>
                    <th className="py-3.5 px-4 text-amber-300">{t('table.time_date')}</th>
                    <th className="py-3.5 px-4 text-teal-300">{t('table.ai_risk')}</th>
                    <th className="py-3.5 px-4 text-emerald-300">{t('table.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {getPatientsForMetricKey(expandedMetricKey).map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{apt.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 via-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white">
                            {apt.patientName ? apt.patientName.charAt(0) : 'P'}
                          </div>
                          <span className="font-extrabold text-slate-900 text-xs">{apt.patientName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{apt.doctorName || t('dashboard.assigned_specialist')}</p>
                          <span className="text-[10px] font-semibold text-slate-500">{apt.doctorSpecialization || t('dashboard.general_practice')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700">
                          <span className="font-bold text-slate-900">{apt.appointmentTime || '09:00 AM'}</span>
                          <p className="text-[10px] text-slate-400">{apt.appointmentDate || (dateRange === 'yesterday' ? t('dashboard.yesterday') : dateRange === 'custom' ? customDate : t('dashboard.today'))}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <AIRiskBadge risk={apt.risk || { level: 'LOW', probability: 0.1, factors: [] }} showProbability size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider shadow-xs ${
                          apt.status === 'CONFIRMED' || apt.status === 'COMPLETED' || apt.status === 'CHECKED_IN'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : apt.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : apt.status === 'RESCHEDULED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {formatStatus(apt.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};


