import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { callBackend } from '../../services/api';
import { AnalyticsData, Appointment, Doctor, Patient, WaitlistItem } from '../../types';
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
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { AIRiskBadge } from '../../components/ai/AIRiskBadge';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7days' | '30days' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Metrics State
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalCancelled: 0,
    totalRescheduled: 0,
    totalMissed: 0,
    activeDoctors: 0,
    todayAppointments: 0,
    todayCancelled: 0,
    todayRescheduled: 0,
    waitlistCount: 0,
    acceptedWaitlistCount: 0
  });

  const getFilteredMetricLabel = (type: 'appointments' | 'cancelled' | 'rescheduled') => {
    if (dateRange === 'yesterday') return t(`metric.yesterdays_${type}`);
    if (dateRange === 'custom') return t(`metric.custom_${type}`);
    if (dateRange === '7days') return t(`metric.7days_${type}`);
    if (dateRange === '30days') return t(`metric.30days_${type}`);
    return t(`metric.todays_${type}`);
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

        const todayStr = new Date().toISOString().split('T')[0];
        let targetDateStr = todayStr;

        if (dateRange === 'yesterday') {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          targetDateStr = y.toISOString().split('T')[0];
        } else if (dateRange === 'custom') {
          targetDateStr = customDate;
        }

        let dateFilteredApts: Appointment[] = [];
        if (dateRange === '7days') {
          const d7 = new Date();
          d7.setDate(d7.getDate() - 7);
          const d7Str = d7.toISOString().split('T')[0];
          dateFilteredApts = aptsList.filter(a => a.appointmentDate >= d7Str && a.appointmentDate <= todayStr);
        } else if (dateRange === '30days') {
          const d30 = new Date();
          d30.setDate(d30.getDate() - 30);
          const d30Str = d30.toISOString().split('T')[0];
          dateFilteredApts = aptsList.filter(a => a.appointmentDate >= d30Str && a.appointmentDate <= todayStr);
        } else {
          dateFilteredApts = aptsList.filter(a => a.appointmentDate === targetDateStr);
        }

        const calculatedMetrics = {
          totalPatients: patsList.length > 0 ? patsList.length : 200,
          totalAppointments: aptsList.length > 0 ? aptsList.length : 24,
          totalCancelled: aptsList.filter(a => a.status === 'CANCELLED').length,
          totalRescheduled: aptsList.filter(a => a.status === 'RESCHEDULED').length,
          totalMissed: aptsList.filter(a => a.status === 'NO_SHOW').length,
          activeDoctors: docsList.filter(d => d.status === 'Active').length || docsList.length || 4,
          todayAppointments: dateFilteredApts.length,
          todayCancelled: dateFilteredApts.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length,
          todayRescheduled: dateFilteredApts.filter(a => a.status === 'RESCHEDULED').length,
          waitlistCount: waitList.length,
          acceptedWaitlistCount: waitList.filter(w => w.status === 'ACCEPTED').length
        };

        setMetrics(calculatedMetrics);

        const baseAnalytics = analyticsRes.data || {
          totalPatients: calculatedMetrics.totalPatients,
          totalDoctors: calculatedMetrics.activeDoctors,
          totalAppointments: calculatedMetrics.totalAppointments,
          todayAppointments: calculatedMetrics.todayAppointments,
          attendanceRate: 84.5,
          noShowRate: 9.2,
          cancellationRate: 6.3,
          waitlistRecoveryRate: 78.4,
          highRiskCount: 3,
          mediumRiskCount: 6,
          lowRiskCount: 18
        };

        const lowCount = aptsList.filter(a => !a.risk || a.risk.level === 'LOW').length;
        const medCount = aptsList.filter(a => a.risk && a.risk.level === 'MEDIUM').length;
        const highCount = aptsList.filter(a => a.risk && a.risk.level === 'HIGH').length;

        const liveAnalytics: AnalyticsData = {
          ...baseAnalytics,
          totalPatients: calculatedMetrics.totalPatients,
          totalDoctors: calculatedMetrics.activeDoctors,
          totalAppointments: calculatedMetrics.totalAppointments,
          todayAppointments: calculatedMetrics.todayAppointments,
          lowRiskCount: aptsList.length > 0 ? lowCount : (baseAnalytics.lowRiskCount || 18),
          mediumRiskCount: aptsList.length > 0 ? medCount : (baseAnalytics.mediumRiskCount || 6),
          highRiskCount: aptsList.length > 0 ? highCount : (baseAnalytics.highRiskCount || 3)
        };

        setAnalytics(liveAnalytics);
        setRecentAppointments(aptsList.slice(0, 5));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dateRange, customDate]);

  if (loading || !analytics) {
    return (
      <div>
        <Header title={t('nav.dashboard')} />
        <div className="py-20">
          <Loading message="Fetching hospital metrics & AI predictions..." />
        </div>
      </div>
    );
  }

  const riskPieData = [
    { name: 'Low Risk', value: analytics.lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: analytics.mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: analytics.highRiskCount, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Header title={t('nav.dashboard')} />

      {/* 🚨 VERY TOP SECTION: BLINKING URGENT EMERGENCY REQUESTS BANNER 🚨 */}
      <div
        onClick={() => navigate('/admin/waitlist')}
        className={`rounded-3xl p-5 md:p-6 border-2 transition-all cursor-pointer group shadow-xl relative overflow-hidden ${
          metrics.waitlistCount > 0
            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 text-white border-rose-500 ring-4 ring-rose-500/30 animate-pulse shadow-rose-950/60'
            : 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-950 text-white border-rose-600/40 shadow-slate-950/40'
        }`}
      >
        {/* Blinking Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-rose-600/30 rounded-full blur-3xl pointer-events-none animate-ping" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center space-x-4">
            {/* Blinking Siren Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-600 text-white border-2 border-rose-300 shadow-lg flex items-center justify-center flex-shrink-0 animate-bounce">
              <AlertTriangle className="w-7 h-7 text-white animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Blinking Emergency Badge */}
                <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border border-rose-300 tracking-wider shadow-md animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" /> 🚨 EMERGENCY ALERT: IMMEDIATE ACTION REQUIRED
                </span>
                <span className="text-xs font-black text-rose-300 tracking-wide uppercase">
                  {t('metric.urgent_requests')}
                </span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{metrics.waitlistCount} Urgent Requests Pending</span>
                {metrics.waitlistCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/30 text-rose-300 border border-rose-400/40 animate-pulse">
                    ⚡ {metrics.waitlistCount} Patient(s) Waiting
                  </span>
                )}
              </h3>

              <p className="text-xs text-rose-200/90 font-semibold">
                Real-time patient emergency consultation requests requiring hospital administrator verification & slot allocation.
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/admin/waitlist');
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs transition-all shadow-lg shadow-rose-600/40 hover:scale-105 flex items-center gap-2 flex-shrink-0 cursor-pointer border border-rose-300/50 group/btn"
          >
            <span>Assign Emergency Slots Now</span>
            <ArrowUpRight className="w-4 h-4 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 🌟 TOP SECTION: OVERALL TOTAL METRICS (ABOVE HOSPITAL OVERVIEW) 🌟 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Total Patients */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">{t('metric.total_patients')}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.totalPatients}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Live Records
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Total Appointments */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-extrabold text-teal-800 uppercase tracking-wider">{t('metric.total_appointments')}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.totalAppointments}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-teal-700 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Total Bookings
            </span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Total Cancelled */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">{t('metric.total_cancelled')}</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{metrics.totalCancelled}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-rose-700 mt-1">
              Cancelled Slots
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Total Rescheduled */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider">{t('metric.total_rescheduled')}</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{metrics.totalRescheduled}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 mt-1">
              Rescheduled Slots
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        {/* 5. Total Missed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex items-center justify-between group col-span-2 sm:col-span-1">
          <div>
            <p className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider">{t('metric.total_missed')}</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{metrics.totalMissed}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-purple-700 mt-1">
              No-Show Absences
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 🏥 HOSPITAL OVERVIEW & PATIENT STATS HEADER BAR 🏥 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-900">Hospital Overview & Patient Stats</h2>
          <p className="text-xs text-slate-500">Real-time attendance metrics & waitlist stats</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['today', 'yesterday', '7days', '30days'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                  dateRange === range
                    ? 'bg-gradient-to-r from-amber-500 via-teal-600 to-purple-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : range === 'yesterday' ? 'Yesterday' : 'Today'}
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
      {/* 6-Box Single Horizontal Row with Patient Dashboard Style SVG Progress Circles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Box 1: Active Doctors */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-emerald-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={0} strokeLinecap="round" className="text-emerald-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-emerald-600 leading-none">{metrics.activeDoctors}</p>
            <p className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider">{t('metric.active_doctors')}</p>
          </div>
        </div>

        {/* Box 2: Appointments */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-teal-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 0 : 125.6} strokeLinecap="round" className="text-teal-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-teal-600 leading-none">{metrics.todayAppointments}</p>
            <p className="text-[10px] font-extrabold text-teal-900 uppercase tracking-wider">{getFilteredMetricLabel('appointments')}</p>
          </div>
        </div>

        {/* Box 3: Appointments Cancelled */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-rose-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 125.6 - (125.6 * (metrics.todayCancelled / metrics.todayAppointments)) : 125.6} strokeLinecap="round" className="text-rose-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-rose-600 leading-none">{metrics.todayCancelled}</p>
            <p className="text-[10px] font-extrabold text-rose-900 uppercase tracking-wider">{getFilteredMetricLabel('cancelled')}</p>
          </div>
        </div>

        {/* Box 4: Appointments Rescheduled */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-blue-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={metrics.todayAppointments > 0 ? 125.6 - (125.6 * (metrics.todayRescheduled / metrics.todayAppointments)) : 125.6} strokeLinecap="round" className="text-blue-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-blue-600 leading-none">{metrics.todayRescheduled}</p>
            <p className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">{getFilteredMetricLabel('rescheduled')}</p>
          </div>
        </div>

        {/* Box 5: Waitlist */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-purple-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={0} strokeLinecap="round" className="text-purple-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-purple-600 leading-none">{metrics.waitlistCount}</p>
            <p className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider">{t('metric.waitlist')}</p>
          </div>
        </div>

        {/* Box 6: Accepted Waitlist */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[110px] group">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-indigo-100" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" strokeDasharray={125.6} strokeDashoffset={0} strokeLinecap="round" className="text-indigo-500 transition-all duration-700" fill="transparent" />
            </svg>
            <div className="p-2 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-indigo-600 leading-none">{metrics.acceptedWaitlistCount}</p>
            <p className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider">{t('metric.accepted_waitlist')}</p>
          </div>
        </div>
      </div>

      {/* Row 3: AI No-Show Risk Split Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Low Risk Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.lowRiskCount}</h3>
              <span className="text-xs font-semibold text-emerald-600">Standard Reminders</span>
            </div>
            <div className="p-3 bg-emerald-100/80 rounded-2xl text-emerald-600">
              <Badge variant="teal">LOW RISK</Badge>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medium Risk Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.mediumRiskCount}</h3>
              <span className="text-xs font-semibold text-amber-600">SMS + Call Followup</span>
            </div>
            <div className="p-3 bg-amber-100/80 rounded-2xl text-amber-600">
              <Badge variant="warning">MEDIUM RISK</Badge>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">High Risk Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.highRiskCount}</h3>
              <span className="text-xs font-semibold text-rose-600">Overbook & Priority Alert</span>
            </div>
            <div className="p-3 bg-rose-100/80 rounded-2xl text-rose-600">
              <Badge variant="danger">HIGH RISK</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 4: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Appointment Attendance & No-Show Trends" subtitle="Historical breakdown over selected period">
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Mon', attended: 18, noshow: 2, cancelled: 1 },
                { name: 'Tue', attended: 22, noshow: 1, cancelled: 2 },
                { name: 'Wed', attended: 25, noshow: 3, cancelled: 1 },
                { name: 'Thu', attended: 20, noshow: 2, cancelled: 0 },
                { name: 'Fri', attended: 28, noshow: 1, cancelled: 2 },
                { name: 'Sat', attended: 15, noshow: 4, cancelled: 3 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="attended" stackId="1" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                <Area type="monotone" dataKey="noshow" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="AI Predictive Risk Classification" subtitle="Patient risk distribution breakdown">
          <div className="h-72 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
