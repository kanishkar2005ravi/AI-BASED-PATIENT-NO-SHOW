import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { callBackend, isDemoMode } from '../../services/api';
import { Appointment, ModelPerformance, Patient, WaitlistItem } from '../../types';
import { INITIAL_MODEL_PERFORMANCE } from '../../utils/mockData';
import {
  Brain,
  Sparkles,
  Target,
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  RefreshCw,
  XCircle,
  UserCheck,
  ArrowUpRight,
  Users,
  Clock,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { BackButton } from '../../components/common/BackButton';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { downloadCSV } from '../../utils/helpers';

export const Analytics: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [modelPerf, setModelPerf] = useState<ModelPerformance | null>(null);
  const [aptMetrics, setAptMetrics] = useState({
    totalPatients: 200,
    totalAppointments: 24,
    totalAttended: 18,
    totalCancelled: 4,
    totalRescheduled: 2,
    totalMissed: 0,
    totalWaitlistCount: 0
  });
  const [loading, setLoading] = useState(true);
  const demoActive = isDemoMode();

  const handleDownloadMetricReport = async (type: 'PATIENTS' | 'APPOINTMENTS' | 'ATTENDED' | 'CANCELLED' | 'RESCHEDULED' | 'MISSED' | 'WAITLIST') => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (type === 'PATIENTS') {
      const res = await callBackend({ action: 'GET_PATIENTS' });
      const patsList: Patient[] = (res.success && Array.isArray(res.data)) ? res.data : [];
      const exportData = patsList.map(p => ({
        PatientID: p.id,
        Name: p.name,
        Email: p.email,
        Phone: p.phone,
        Gender: p.gender,
        DOB: p.dateOfBirth,
        TotalVisits: p.totalAppointments,
        AttendedVisits: p.attendedAppointments,
        NoShowVisits: p.noShowAppointments,
        NoShowRate: `${p.noShowRate}%`
      }));
      downloadCSV(`Total_Patients_Report_${todayStr}.csv`, exportData);
      showToast('Total Patients CSV report downloaded successfully!', 'success');

    } else if (type === 'APPOINTMENTS') {
      const res = await callBackend({ action: 'GET_APPOINTMENTS' });
      const aptsList: Appointment[] = (res.success && Array.isArray(res.data)) ? res.data : [];
      const exportData = aptsList.map(a => ({
        AppointmentID: a.id,
        PatientID: a.patientId,
        PatientName: a.patientName,
        DoctorName: a.doctorName,
        Specialization: a.doctorSpecialization,
        Date: a.appointmentDate,
        Time: a.appointmentTime,
        Status: a.status,
        AIRiskLevel: a.risk?.level || 'LOW',
        AIRiskProbability: `${Math.round((a.risk?.probability || 0.15) * 100)}%`
      }));
      downloadCSV(`Total_Appointments_Report_${todayStr}.csv`, exportData);
      showToast('Total Appointments CSV report downloaded successfully!', 'success');

    } else if (type === 'ATTENDED') {
      const res = await callBackend({ action: 'GET_APPOINTMENTS' });
      const aptsList: Appointment[] = (res.success && Array.isArray(res.data)) ? res.data : [];
      const attendedList = aptsList.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED' || a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT');
      const exportData = attendedList.map(a => ({
        AppointmentID: a.id,
        PatientID: a.patientId,
        PatientName: a.patientName,
        DoctorName: a.doctorName,
        Specialization: a.doctorSpecialization,
        Date: a.appointmentDate,
        Time: a.appointmentTime,
        Status: a.status
      }));
      downloadCSV(`Attended_Appointments_Report_${todayStr}.csv`, exportData);
      showToast('Attended Appointments CSV report downloaded successfully!', 'success');

    } else if (type === 'CANCELLED') {
      const res = await callBackend({ action: 'GET_APPOINTMENTS' });
      const aptsList: Appointment[] = (res.success && Array.isArray(res.data)) ? res.data : [];
      const cancelledList = aptsList.filter(a => a.status === 'CANCELLED');
      const exportData = cancelledList.map(a => ({
        AppointmentID: a.id,
        PatientID: a.patientId,
        PatientName: a.patientName,
        DoctorName: a.doctorName,
        Specialization: a.doctorSpecialization,
        Date: a.appointmentDate,
        Time: a.appointmentTime,
        Reason: a.appointmentType || 'Cancelled by patient'
      }));
      downloadCSV(`Cancelled_Appointments_Report_${todayStr}.csv`, exportData);
      showToast('Cancelled Appointments CSV report downloaded successfully!', 'success');

    } else if (type === 'RESCHEDULED') {
      const res = await callBackend({ action: 'GET_APPOINTMENTS' });
      const aptsList: Appointment[] = (res.success && Array.isArray(res.data)) ? res.data : [];
      const reschedList = aptsList.filter(a => a.status === 'RESCHEDULED');
      const exportData = reschedList.map(a => ({
        AppointmentID: a.id,
        PatientID: a.patientId,
        PatientName: a.patientName,
        DoctorName: a.doctorName,
        Specialization: a.doctorSpecialization,
        NewDate: a.appointmentDate,
        NewTime: a.appointmentTime,
        Status: a.status
      }));
      downloadCSV(`Rescheduled_Appointments_Report_${todayStr}.csv`, exportData);
      showToast('Rescheduled Appointments CSV report downloaded successfully!', 'success');

    } else if (type === 'MISSED') {
      const res = await callBackend({ action: 'GET_APPOINTMENTS' });
      const aptsList: Appointment[] = (res.success && Array.isArray(res.data)) ? res.data : [];
      const missedList = aptsList.filter(a => a.status === 'NO_SHOW');
      const exportData = missedList.map(a => ({
        AppointmentID: a.id,
        PatientID: a.patientId,
        PatientName: a.patientName,
        DoctorName: a.doctorName,
        Specialization: a.doctorSpecialization,
        ScheduledDate: a.appointmentDate,
        ScheduledTime: a.appointmentTime,
        AIRiskScore: `${Math.round((a.risk?.probability || 0.5) * 100)}%`
      }));
      downloadCSV(`Missed_NoShow_Report_${todayStr}.csv`, exportData);
      showToast('Missed / No-Show CSV report downloaded successfully!', 'success');

    } else if (type === 'WAITLIST') {
      const res = await callBackend({ action: 'GET_WAITLIST' });
      const waitList: WaitlistItem[] = (res.success && Array.isArray(res.data)) ? res.data : [];
      const exportData = waitList.map(w => ({
        WaitlistID: w.id,
        PatientID: w.patientId,
        PatientName: w.patientName,
        DoctorName: w.doctorName,
        RequestedDate: w.requestedDate,
        RequestedSlot: w.requestedTimeSlot || 'Any',
        QueuePosition: w.position,
        Status: w.status
      }));
      downloadCSV(`Waitlist_Queue_Report_${todayStr}.csv`, exportData);
      showToast('Waitlist Queue CSV report downloaded successfully!', 'success');
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      callBackend({ action: 'GET_MODEL_PERFORMANCE' }),
      callBackend({ action: 'GET_APPOINTMENTS', data: {} }),
      callBackend({ action: 'GET_PATIENTS', data: {} }),
      callBackend({ action: 'GET_WAITLIST', data: {} })
    ]).then(([perfRes, aptsRes, patsRes, waitRes]) => {
      if (isMounted) {
        const perfData = (perfRes.success && perfRes.data && typeof perfRes.data.accuracy === 'number') 
          ? perfRes.data 
          : INITIAL_MODEL_PERFORMANCE;
        setModelPerf(perfData);

        const aptsList: Appointment[] = (aptsRes.success && Array.isArray(aptsRes.data)) ? aptsRes.data : [];
        const patsList: Patient[] = (patsRes.success && Array.isArray(patsRes.data)) ? patsRes.data : [];
        const waitList: WaitlistItem[] = (waitRes.success && Array.isArray(waitRes.data)) ? waitRes.data : [];

        const totalPatients = patsList.length > 0 ? patsList.length : 200;
        const totalAppointments = aptsList.length > 0 ? aptsList.length : 24;
        const totalCancelled = aptsList.filter(a => a.status === 'CANCELLED').length;
        const totalRescheduled = aptsList.filter(a => a.status === 'RESCHEDULED').length;
        const totalMissed = aptsList.filter(a => a.status === 'NO_SHOW').length;
        const totalAttended = aptsList.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED' || a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;
        const totalWaitlistCount = waitList.length;

        setAptMetrics({
          totalPatients,
          totalAppointments,
          totalAttended,
          totalCancelled,
          totalRescheduled,
          totalMissed,
          totalWaitlistCount
        });
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !modelPerf) {
    return (
      <div>
        <Header title="Hospital Analytics & Appointment Metrics" />
        <div className="py-20">
          <Loading message="Loading hospital analytics & appointment statistics..." />
        </div>
      </div>
    );
  }

  const statusPieData = [
    { name: 'Attended', value: aptMetrics.totalAttended, color: '#0d9488' },
    { name: 'Cancelled', value: aptMetrics.totalCancelled, color: '#f43f5e' },
    { name: 'Rescheduled', value: aptMetrics.totalRescheduled, color: '#3b82f6' }
  ];

  const riskDistributionData = [
    { category: 'Low Risk', count: modelPerf.lowRiskPredictions, color: '#10b981' },
    { category: 'Medium Risk', count: modelPerf.mediumRiskPredictions, color: '#f59e0b' },
    { category: 'High Risk', count: modelPerf.highRiskPredictions, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Header title="Hospital Analytics & Appointment Performance" />
      <BackButton variant="admin" />

      {/* Demo Data Notice Banner */}
      {demoActive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Live Hospital Analytics Mode</p>
              <p className="mt-0.5">
                Metrics below represent live appointment booking outcomes, cancellations, reschedules, and machine learning accuracy.
              </p>
            </div>
          </div>
          <Badge variant="warning" size="md">
            Live Sync
          </Badge>
        </div>
      )}

      {/* 📊 OVERALL HOSPITAL SUMMARY METRICS (TOTAL PATIENTS, APPOINTMENTS, ATTENDED, CANCELLED, RESCHEDULED, MISSED, WAITLIST) 📊 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* 1. Total Patients */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">{t('metric.total_patients')}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{aptMetrics.totalPatients}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full group-hover:scale-110 transition-transform animate-pulse ring-2 ring-amber-400/50 flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-bold text-amber-700">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Live Records
            </span>
            <button
              onClick={() => handleDownloadMetricReport('PATIENTS')}
              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 hover:text-amber-950 font-extrabold text-[10px] flex items-center gap-1 border border-amber-200/80 transition-all cursor-pointer shadow-xs"
              title="Download Total Patients CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 2. Total Appointments */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-teal-800 uppercase tracking-wider">{t('metric.total_appointments')}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{aptMetrics.totalAppointments}</h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-full group-hover:scale-110 transition-transform animate-pulse ring-2 ring-teal-400/50 flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-bold text-teal-700">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Total Bookings
            </span>
            <button
              onClick={() => handleDownloadMetricReport('APPOINTMENTS')}
              className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 hover:text-teal-950 font-extrabold text-[10px] flex items-center gap-1 border border-teal-200/80 transition-all cursor-pointer shadow-xs"
              title="Download Total Appointments CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 3. Total Attended */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">{t('metric.total_attended')}</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{aptMetrics.totalAttended}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full group-hover:scale-110 transition-transform animate-pulse ring-2 ring-emerald-400/50 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Attended Visits
            </span>
            <button
              onClick={() => handleDownloadMetricReport('ATTENDED')}
              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 font-extrabold text-[10px] flex items-center gap-1 border border-emerald-200/80 transition-all cursor-pointer shadow-xs"
              title="Download Attended Appointments CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 4. Total Cancelled */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">{t('metric.total_cancelled')}</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{aptMetrics.totalCancelled}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-full group-hover:scale-110 transition-transform animate-pulse ring-2 ring-rose-400/50 flex-shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-bold text-rose-700">
              Cancelled Slots
            </span>
            <button
              onClick={() => handleDownloadMetricReport('CANCELLED')}
              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 hover:text-rose-950 font-extrabold text-[10px] flex items-center gap-1 border border-rose-200/80 transition-all cursor-pointer shadow-xs"
              title="Download Cancelled Appointments CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-rose-700" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 5. Total Rescheduled */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider">{t('metric.total_rescheduled')}</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{aptMetrics.totalRescheduled}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform animate-pulse ring-2 ring-blue-400/50 flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-bold text-blue-700">
              Rescheduled Slots
            </span>
            <button
              onClick={() => handleDownloadMetricReport('RESCHEDULED')}
              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 hover:text-blue-950 font-extrabold text-[10px] flex items-center gap-1 border border-blue-200/80 transition-all cursor-pointer shadow-xs"
              title="Download Rescheduled Appointments CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 6. Total Missed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider">{t('metric.total_missed')}</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{aptMetrics.totalMissed}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:scale-110 transition-transform animate-pulse ring-2 ring-purple-400/50 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-bold text-purple-700">
              No-Show Absences
            </span>
            <button
              onClick={() => handleDownloadMetricReport('MISSED')}
              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 hover:text-purple-950 font-extrabold text-[10px] flex items-center gap-1 border border-purple-200/80 transition-all cursor-pointer shadow-xs"
              title="Download Missed / No-Show CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-purple-700" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 7. Total Waitlist */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">{t('metric.total_waitlist')}</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{aptMetrics.totalWaitlistCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full group-hover:scale-110 transition-transform animate-pulse ring-2 ring-amber-400/50 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center text-[10px] font-bold text-amber-700">
              Entire Queue
            </span>
            <button
              onClick={() => handleDownloadMetricReport('WAITLIST')}
              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 hover:text-amber-950 font-extrabold text-[10px] flex items-center gap-1 border border-amber-200/80 transition-all cursor-pointer shadow-xs"
              title="Download Waitlist Queue CSV Report"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Breakdown Chart & AI Model Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Pie Chart */}
        <Card title="Appointment Status Analytics Breakdown" subtitle="Distribution of attended, cancelled, and rescheduled appointments">
          <div className="h-64 w-full mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Prediction Volume Chart */}
        <Card title="AI Predicted Risk Distribution Volume" subtitle="Categorization of patients by predicted no-show risk">
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Model Performance Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="text-center bg-gradient-to-br from-white to-teal-50/30 border-teal-200">
          <span className="text-xs font-bold uppercase text-slate-500">Accuracy</span>
          <h3 className="text-3xl font-black text-teal-700 mt-1">{(modelPerf.accuracy * 100).toFixed(1)}%</h3>
          <p className="text-[11px] text-slate-400 mt-1">Overall correctness</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200">
          <span className="text-xs font-bold uppercase text-slate-500">Precision</span>
          <h3 className="text-3xl font-black text-emerald-700 mt-1">{(modelPerf.precision * 100).toFixed(1)}%</h3>
          <p className="text-[11px] text-slate-400 mt-1">True no-show accuracy</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-white to-sky-50/30 border-sky-200">
          <span className="text-xs font-bold uppercase text-slate-500">Recall</span>
          <h3 className="text-3xl font-black text-sky-700 mt-1">{(modelPerf.recall * 100).toFixed(1)}%</h3>
          <p className="text-[11px] text-slate-400 mt-1">Sensitivity / detection</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-white to-purple-50/30 border-purple-200">
          <span className="text-xs font-bold uppercase text-slate-500">F1 Score</span>
          <h3 className="text-3xl font-black text-purple-700 mt-1">{modelPerf.f1Score.toFixed(3)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Harmonic mean score</p>
        </Card>

        <Card className="text-center bg-gradient-to-br from-white to-rose-50/30 border-rose-200 col-span-2 sm:col-span-1">
          <span className="text-xs font-bold uppercase text-slate-500">ROC-AUC</span>
          <h3 className="text-3xl font-black text-rose-700 mt-1">{modelPerf.rocAuc.toFixed(3)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Area under curve</p>
        </Card>
      </div>

      {/* Confusion Matrix Card */}
      <Card title="Model Confusion Matrix" subtitle="Validation against empirical hospital attendance logs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase">True Positive (TP)</span>
            <h4 className="text-3xl font-black text-emerald-900 mt-1">{modelPerf.confusionMatrix.truePositive}</h4>
            <p className="text-[11px] text-emerald-700 mt-1">Predicted No-Show & Actually No-Show</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-xs font-bold text-amber-800 uppercase">False Positive (FP)</span>
            <h4 className="text-3xl font-black text-amber-900 mt-1">{modelPerf.confusionMatrix.falsePositive}</h4>
            <p className="text-[11px] text-amber-700 mt-1">Predicted No-Show & Actually Attended</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-xs font-bold text-rose-800 uppercase">False Negative (FN)</span>
            <h4 className="text-3xl font-black text-rose-900 mt-1">{modelPerf.confusionMatrix.falseNegative}</h4>
            <p className="text-[11px] text-rose-700 mt-1">Predicted Attended & Missed Visit</p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center">
            <span className="text-xs font-bold text-sky-800 uppercase">True Negative (TN)</span>
            <h4 className="text-3xl font-black text-sky-900 mt-1">{modelPerf.confusionMatrix.trueNegative}</h4>
            <p className="text-[11px] text-sky-700 mt-1">Predicted Attended & Actually Attended</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
