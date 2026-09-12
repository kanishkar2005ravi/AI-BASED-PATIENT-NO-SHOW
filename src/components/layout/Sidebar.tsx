import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Stethoscope,
  Calendar,
  Clock,
  BarChart3,
  Bell,
  FileText,
  User,
  LogOut,
  Sparkles,
  HeartPulse
} from 'lucide-react';

import { CarePilotLogo } from '../common/CarePilotLogo';

interface SidebarProps {
  role: 'admin' | 'patient';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { label: t('nav.dashboard'), path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30' },
    { label: t('nav.patients'), path: '/admin/patients', icon: <Users className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30' },
    { label: t('nav.doctors'), path: '/admin/doctors', icon: <Stethoscope className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30' },
    { label: t('nav.appointments'), path: '/admin/appointments', icon: <Calendar className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30' },
    { label: t('nav.waitlist'), path: '/admin/waitlist', icon: <Clock className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30' },
    { label: t('nav.notifications'), path: '/admin/notifications', icon: <Bell className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30' },
    { label: t('nav.reports'), path: '/admin/reports', icon: <FileText className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30' },
    { label: t('nav.profile'), path: '/admin/profile', icon: <User className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30' }
  ];

  const patientNavItems = [
    { label: t('nav.dashboard'), path: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30' },
    { label: t('nav.book_appointment'), path: '/patient/book', icon: <Calendar className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30' },
    { label: t('nav.my_appointments'), path: '/patient/appointments', icon: <HeartPulse className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30' },
    { label: t('nav.waitlist'), path: '/patient/waitlist', icon: <Clock className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30' },
    { label: t('nav.notifications'), path: '/patient/notifications', icon: <Bell className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30' },
    { label: t('nav.profile'), path: '/patient/profile', icon: <User className="w-5 h-5" />, activeBg: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30' }
  ];


  const navItems = role === 'admin' ? adminNavItems : patientNavItems;

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-screen flex flex-col justify-between p-4 hidden md:flex border-r border-slate-800/80 flex-shrink-0 relative overflow-hidden">
      {/* Top Rainbow Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 via-purple-500 via-blue-500 to-teal-400" />

      <div>
        {/* Brand Header */}
        <div className="px-2 py-3 mb-4">
          <CarePilotLogo size="sm" textLight={true} />
        </div>

        {/* Role Badge */}
        <div className="px-3 mb-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div className="text-xs">
              <p className="font-extrabold text-white uppercase tracking-wider text-[11px]">{role} Portal</p>
              <p className="text-slate-400 text-[10px] truncate max-w-[150px]">{user?.name || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? item.activeBg
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>{t('nav.logout')}</span>
        </button>

      </div>
    </aside>
  );
};
