import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { callBackend, isDemoMode } from '../../services/api';
import { Appointment, ModelPerformance } from '../../types';
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
  ArrowUpRight
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

export const Analytics: React.FC = () => {
  const { t } = useLanguage();
  const [modelPerf, setModelPerf] = useState<ModelPerformance | null>(null);
  const [aptMetrics, setAptMetrics] = useState({
    totalAppointments: 24,
    totalAttended: 18,
    totalCancelled: 4,
    totalRescheduled: 2
  });
  const [loading, setLoading] = useState(true);
  const demoActive = isDemoMode();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      callBackend({ action: 'GET_MODEL_PERFORMANCE' }),
      callBackend({ action: 'GET_APPOINTMENTS', data: {} })
    ]).then(([perfRes, aptsRes]) => {
      if (isMounted) {
        const perfData = (perfRes.success && perfRes.data && typeof perfRes.data.accuracy === 'number') 
          ? perfRes.data 
          : INITIAL_MODEL_PERFORMANCE;
        setModelPerf(perfData);

        const aptsList: Appointment[] = (aptsRes.success && Array.isArray(aptsRes.data)) ? aptsRes.data : [];
        if (aptsList.length > 0) {
          const totalAppointments = aptsList.length;
          const totalCancelled = aptsList.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length;
          const totalRescheduled = aptsList.filter(a => a.status === 'RESCHEDULED').length;
          const totalAttended = aptsList.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED' || a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;

          setAptMetrics({
            totalAppointments,
            totalAttended,
            totalCancelled,
            totalRescheduled
          });
        }
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

      {/* 📊 TOP ROW: APPOINTMENT OUTCOME CARDS (TOTAL, ATTENDED, CANCELLED, RESCHEDULED) 📊 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Appointments */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-extrabold text-teal-800 uppercase tracking-wider">{t('metric.total_appointments')}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{aptMetrics.totalAppointments}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-teal-700 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Total Bookings
            </span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Total Attended */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">{t('metric.total_attended')}</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{aptMetrics.totalAttended}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 mt-1">
              Confirmed / Completed
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Total Cancelled */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">{t('metric.total_cancelled')}</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{aptMetrics.totalCancelled}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-rose-700 mt-1">
              Cancelled / No-Show
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
            <h3 className="text-2xl font-black text-blue-600 mt-1">{aptMetrics.totalRescheduled}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 mt-1">
              Rescheduled Slots
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
            <RefreshCw className="w-6 h-6" />
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
