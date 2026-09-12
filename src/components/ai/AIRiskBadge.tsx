import React from 'react';
import { AIRiskAssessment, RiskLevel } from '../../types';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AIRiskBadgeProps {
  risk: AIRiskAssessment;
  showProbability?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AIRiskBadge: React.FC<AIRiskBadgeProps> = ({
  risk,
  showProbability = false,
  onClick,
  size = 'md'
}) => {
  const { t } = useLanguage();
  const percentage = Math.round((risk.probability || 0.2) * 100);

  const levelStyles: Record<RiskLevel, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    LOW: {
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
    },
    MEDIUM: {
      bg: 'bg-amber-50 hover:bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
    },
    HIGH: {
      bg: 'bg-rose-50 hover:bg-rose-100',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
    }
  };

  const current = levelStyles[risk.level || 'LOW'];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm'
  };

  const riskLabelKey = risk.level === 'HIGH' ? 'risk.high' : risk.level === 'MEDIUM' ? 'risk.medium' : 'risk.low';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border transition-all duration-150 ${
        current.bg
      } ${current.text} ${current.border} ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'
      }`}
    >
      {current.icon}
      <span>{t(riskLabelKey)}</span>
      {showProbability && <span className="opacity-75">({percentage}%)</span>}
    </button>
  );
};

