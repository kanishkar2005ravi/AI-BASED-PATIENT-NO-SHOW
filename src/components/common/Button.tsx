import React from 'react';
import { Loading } from './Loading';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 via-rose-500 via-purple-500 via-blue-500 to-teal-500 text-white font-extrabold shadow-md shadow-amber-500/20 hover:opacity-95 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all border border-white/20 focus:ring-amber-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold focus:ring-slate-400 border border-slate-200',
    outline: 'border-2 border-transparent bg-gradient-to-r from-amber-500 via-rose-500 via-purple-500 via-blue-500 to-teal-500 bg-clip-border bg-white text-slate-900 font-extrabold hover:bg-slate-50 transition-all',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold shadow-md shadow-rose-200 focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 font-semibold focus:ring-slate-400',
    success: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-extrabold shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loading />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
