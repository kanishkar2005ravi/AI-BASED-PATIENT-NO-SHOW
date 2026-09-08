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
  ArrowDownRight
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

export const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      callBackend({ action: 'GET_ANALYTICS', data: { dateRange } }),
      callBackend({ action: 'GET_APPOINTMENTS', data: {} })
    ]).then(([analyticsRes, aptsRes]) => {
      if (isMounted) {
        if (analyticsRes.success && analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }
        if (aptsRes.success && Array.isArray(aptsRes.data)) {
          setRecentAppointments(aptsRes.data.slice(0, 5));
        }
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
      <Header title="Admin Hospital Dashboard" />

      {/* Date Range Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">Hospital Overview & AI Intelligence</h2>
          <p className="text-xs text-slate-500">Real-time attendance metrics, no-show predictions & waitlist stats</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {(['today', '7days', '30days'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                dateRange === range
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Top Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.totalPatients}</h3>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12% this month
              </span>
            </div>
            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Doctors</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.totalDoctors}</h3>
              <span className="inline-flex items-center text-xs font-semibold text-slate-500 mt-1">
                Across 6 Departments
              </span>
            </div>
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Appointments</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.totalAppointments}</h3>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +8.4% volume
              </span>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{analytics.todayAppointments}</h3>
              <span className="inline-flex items-center text-xs font-semibold text-teal-600 mt-1">
                Scheduled Today
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Performance KPIs with Trend Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate (Positive Trend) */}
        <Card className="bg-gradient-to-br from-white to-emerald-50/40 border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Attendance Rate</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Positive Trend
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-black text-slate-900">{analytics.attendanceRate}%</h3>
            <span className="text-xs font-bold text-emerald-600">+2.4% vs last week</span>
          </div>
        </Card>

        {/* No-Show Rate (Negative Trend Indicator when High) */}
        <Card className="bg-gradient-to-br from-white to-rose-50/40 border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-rose-800 tracking-wider">No-Show Rate</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> -1.2% Reduction
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-black text-slate-900">{analytics.noShowRate}%</h3>
            <span className="text-xs font-medium text-slate-500">Industry avg: 18%</span>
          </div>
        </Card>

        {/* Cancellation Rate */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">Cancellation Rate</span>
            <span className="text-xs text-slate-400">Normal range</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-black text-slate-900">{analytics.cancellationRate}%</h3>
            <span className="text-xs text-slate-500">6.3% overall</span>
          </div>
        </Card>

        {/* Waitlist Recovery Rate */}
        <Card className="bg-gradient-to-br from-white to-teal-50/40 border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-teal-800 tracking-wider">Waitlist Recovery</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Auto-Recovered
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-black text-slate-900">{analytics.waitlistRecoveryRate}%</h3>
            <span className="text-xs font-bold text-teal-700">Slots Refilled</span>
          </div>
        </Card>
      </div>

      {/* Row 3: AI Risk Distribution & Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Trend Chart */}
        <Card title="Appointment Attendance Trends" className="lg:col-span-2">
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.appointmentTrends}>
                <defs>
                  <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNoShow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="attended" name="Attended" stroke="#0d9488" fillOpacity={1} fill="url(#colorAttended)" />
                <Area type="monotone" dataKey="noShow" name="No-Show Risk" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNoShow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Level Distribution Pie */}
        <Card title="Current Risk Level Breakdown">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center text-xs text-slate-500">
            Total active predictions evaluated by AI model
          </div>
        </Card>
      </div>

      {/* Row 4: Recent Appointments Table */}
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
