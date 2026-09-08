import React from 'react';
import { Modal } from '../common/Modal';
import { AIRiskAssessment } from '../../types';
import { AIRiskBadge } from './AIRiskBadge';
import { Brain, CheckCircle2, XCircle, Info, BellRing } from 'lucide-react';
import { Button } from '../common/Button';

interface AIRiskExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: AIRiskAssessment;
  patientName?: string;
  isAdmin?: boolean;
}

export const AIRiskExplanationModal: React.FC<AIRiskExplanationModalProps> = ({
  isOpen,
  onClose,
  risk,
  patientName,
  isAdmin = false
}) => {
  const percentage = Math.round((risk.probability || 0.2) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Attendance Evaluation"
      subtitle={patientName ? `Appointment evaluation for ${patientName}` : 'Schedule Risk Factors'}
      maxWidth="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Header Summary Card */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-400/30 text-teal-300">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                {isAdmin ? 'Deep ML Assessment' : 'Appointment Risk Level'}
              </span>
            </div>
            <AIRiskBadge risk={risk} showProbability={isAdmin} size="sm" />
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              {isAdmin ? (
                <>
                  <p className="text-xs text-slate-300">Predicted Risk Probability</p>
                  <h3 className="text-3xl font-black tracking-tight text-white">{percentage}%</h3>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-300">Attendance Risk Rating</p>
                  <h3 className="text-2xl font-black tracking-tight text-white">{risk.level} RISK</h3>
                </>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-teal-200 bg-teal-900/60 px-2.5 py-1 rounded-full border border-teal-700/50">
                {isAdmin ? 'XGBoost Model v2.4' : 'CarePilot Smart Assessment'}
              </span>
            </div>
          </div>
        </div>

        {/* Explanation Header */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-teal-600" />
            <span>{isAdmin ? 'Key Influencing Risk Factors' : 'Why this risk rating?'}</span>
          </h4>

          {risk.factors && risk.factors.length > 0 ? (
            <div className="space-y-2.5">
              {risk.factors.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start space-x-3"
                >
                  {item.impact === 'negative' ? (
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  ) : item.impact === 'positive' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.factor}</h5>
                    <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              {risk.recapNotes || 'Standard baseline evaluation. No anomalous risk signals detected.'}
            </div>
          )}
        </div>

        {/* Patient Friendly Advice */}
        {!isAdmin && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200/70 text-xs text-teal-900 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-teal-950">
              <BellRing className="w-4 h-4 text-teal-700" />
              Tip to lower your risk rating:
            </p>
            <p className="text-teal-800">
              Click "Check In Now" or confirm your appointment reminder as soon as you receive it, or reschedule early if your schedule changes.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
