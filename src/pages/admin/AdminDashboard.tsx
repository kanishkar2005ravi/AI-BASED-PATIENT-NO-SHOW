import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { callBackend } from '../../services/api';
import { AnalyticsData, Appointment } from '../../types';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Percent,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft
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
import { WelcomeSplashScreen } from '../../components/common/WelcomeSplashScreen';

export const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState<boolean>(false);
  const navigate = useNavigate();


  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      callBackend({ action: 'GET_ANALYTICS', data: { dateRange } }),
      callBackend({ action: 'GET_APPOINTMENTS', data: {} }),
      callBackend({ action: 'GET_PATIENTS', data: {} }),
      callBackend({ action: 'GET_DOCTORS', data: {} })
    ]).then(([analyticsRes, aptsRes, patsRes, docsRes]) => {
      if (isMounted) {
        const aptsList: Appointment[] = (aptsRes.success && Array.isArray(aptsRes.data)) ? aptsRes.data : [];
        const patsList = (patsRes.success && Array.isArray(patsRes.data)) ? patsRes.data : [];
        const docsList = (docsRes.success && Array.isArray(docsRes.data)) ? docsRes.data : [];

        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = aptsList.filter(a => a.appointmentDate === todayStr).length;

        const baseAnalytics = analyticsRes.data || {
          totalPatients: 0,
          totalDoctors: 0,
          totalAppointments: 0,
          todayAppointments: 0,
          attendanceRate: 84.5,
          noShowRate: 9.2,
          cancellationRate: 6.3,
          waitlistRecoveryRate: 78.4,
          highRiskCount: 0,
          mediumRiskCount: 0,
          lowRiskCount: 0
        };

        const lowCount = aptsList.filter(a => !a.risk || a.risk.level === 'LOW').length;
        const medCount = aptsList.filter(a => a.risk && a.risk.level === 'MEDIUM').length;
        const highCount = aptsList.filter(a => a.risk && a.risk.level === 'HIGH').length;

        const liveAnalytics: AnalyticsData = {
          ...baseAnalytics,
          totalPatients: patsList.length > 0 ? patsList.length : baseAnalytics.totalPatients,
          totalDoctors: docsList.length > 0 ? docsList.length : baseAnalytics.totalDoctors,
          totalAppointments: aptsList.length > 0 ? aptsList.length : baseAnalytics.totalAppointments,
          todayAppointments: todayCount > 0 ? todayCount : (aptsList.length > 0 ? todayCount : baseAnalytics.todayAppointments),
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
  }, [dateRange]);

  if (loading || !analytics) {
    return (
      <div>
        <Header title="Hospital Analytics & Overview" />
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
      <Header title="Admin Dashboard" />

      {/* 🔙 BACK TO LOGIN PORTAL BUTTON 🔙 */}
      <div>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login Portal</span>
        </button>
      </div>

      {/* 5-Second 7-Color Animated Welcome Entrance Screen */}
      {showWelcomeSplash && (
        <WelcomeSplashScreen
          userName="Administrator"
          role="admin"
          onComplete={() => setShowWelcomeSplash(false)}
        />
      )}


      {/* Date Range Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">Hospital Overview & Patient Stats</h2>
          <p className="text-xs text-slate-500">Real-time attendance metrics & waitlist stats</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {(['today', '7days', '30days'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                dateRange === range
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-teal-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Top Statistics with SNS Design Thinking Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 🟡 Amber Gold (#F59E0B) */}
        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.totalPatients}</h3>
              <span className="inline-flex items-center text-xs font-bold text-amber-700 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12% this month
              </span>
            </div>
            <div className="p-3 bg-amber-100/80 rounded-2xl text-amber-600 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 💙 Royal Blue (#3B82F6) */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Active Doctors</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.totalDoctors}</h3>
              <span className="inline-flex items-center text-xs font-semibold text-blue-700 mt-1">
                Across 6 Departments
              </span>
            </div>
            <div className="p-3 bg-blue-100/80 rounded-2xl text-blue-600 shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 💜 Purple (#8B5CF6) */}
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Total Appointments</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.totalAppointments}</h3>
              <span className="inline-flex items-center text-xs font-bold text-purple-700 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +8.4% volume
              </span>
            </div>
            <div className="p-3 bg-purple-100/80 rounded-2xl text-purple-600 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 🟢 Emerald & Teal (#0D9488 & #10B981) */}
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Today's Appointments</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.todayAppointments}</h3>
              <span className="inline-flex items-center text-xs font-semibold text-teal-700 mt-1">
                Scheduled Today
              </span>
            </div>
            <div className="p-3 bg-emerald-100/80 rounded-2xl text-emerald-600 shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: AI No-Show Risk Split Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Low Risk Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.lowRiskCount}</h3>
              <span className="text-xs font-semibold text-emerald-600">Standard 10h Reminders</span>
            </div>
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 font-bold text-xs">
              LOW
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medium Risk Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.mediumRiskCount}</h3>
              <span className="text-xs font-semibold text-amber-600">Priority 10h Reminders</span>
            </div>
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 font-bold text-xs">
              MED
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">High Risk Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.highRiskCount}</h3>
              <span className="text-xs font-semibold text-rose-600">Urgent 24h, 12h, 6h Reminders</span>
            </div>
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 font-bold text-xs">
              HIGH
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Appointments Table */}
      <Card
        title="Recent Hospital Appointments & AI Risk"
        action={
          <button
            onClick={() => navigate('/admin/appointments')}
            className="text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            View All Appointments &rarr;
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">APT ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAppointments.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-700">{apt.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{apt.patientName}</td>
                  <td className="py-3.5 px-4 text-slate-700">{apt.doctorName}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {apt.appointmentDate} at {apt.appointmentTime}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{apt.appointmentType}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={apt.status === 'CONFIRMED' ? 'info' : apt.status === 'COMPLETED' ? 'success' : 'danger'} size="sm">
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <AIRiskBadge risk={apt.risk} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
