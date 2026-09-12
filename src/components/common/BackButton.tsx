import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface BackButtonProps {
  to?: string;
  label?: string;
  variant?: 'admin' | 'patient';
}

export const BackButton: React.FC<BackButtonProps> = ({ to, label, variant = 'patient' }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (variant === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/patient/dashboard');
    }
  };

  const accentColor = variant === 'admin' ? 'text-amber-600' : 'text-teal-600';

  return (
    <div className="mb-4">
      <button
        onClick={handleClick}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
      >
        <ArrowLeft className={`w-4 h-4 ${accentColor} group-hover:-translate-x-1 transition-transform`} />
        <span>{label || t('profile.back_dashboard')}</span>
      </button>
    </div>
  );
};
