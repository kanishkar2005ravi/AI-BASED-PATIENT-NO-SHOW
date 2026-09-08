import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { callBackend, isDemoMode } from '../../services/api';
import { ModelPerformance } from '../../types';
import { Brain, Sparkles, Target, Activity, Award, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Analytics: React.FC = () => {
  const [modelPerf, setModelPerf] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const demoActive = isDemoMode();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    callBackend({ action: 'GET_MODEL_PERFORMANCE' }).then(res => {
      if (isMounted) {
        if (res.success && res.data) {
          setModelPerf(res.data);
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
        <Header title="AI Predictive Analytics & ML Metrics" />
        <div className="py-20">
          <Loading message="Loading model metrics & evaluation parameters..." />
        </div>
      </div>
    );
  }

  const riskDistributionData = [
    { category: 'Low Risk', count: modelPerf.lowRiskPredictions, color: '#10b981' },
    { category: 'Medium Risk', count: modelPerf.mediumRiskPredictions, color: '#f59e0b' },
    { category: 'High Risk', count: modelPerf.highRiskPredictions, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Header title="AI No-Show Model Performance Analytics" />

      {/* Demo Data Notice Banner */}
      {demoActive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Evaluation Mode Notice</p>
              <p className="mt-0.5">
                The machine learning metrics below are calculated from benchmark validation sets and marked as <strong>Demo Data</strong>. Production validation syncs continuously with SNS Workbench backend.
              </p>
            </div>
          </div>
          <Badge variant="warning" size="md">
            Demo Data
          </Badge>
        </div>
      )}

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

      {/* Middle Row: Predictions Distribution & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Prediction Volume Chart */}
        <Card title="Predicted Risk Distribution Volume">
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
          <div className="mt-3 flex justify-between text-xs font-bold text-slate-600 px-2">
            <span>Total Evaluated: {modelPerf.totalPredictions}</span>
            <span>Correct Predictions: {modelPerf.correctPredictions}</span>
          </div>
        </Card>

        {/* Confusion Matrix Card */}
        <Card title="Model Confusion Matrix" subtitle="Validation against empirical hospital attendance logs">
          <div className="grid grid-cols-2 gap-4 mt-2">
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
    </div>
  );
};
