import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarPlus,
  CalendarCheck,
  Clock,
  Bell,
  FileText,
  User,
  LogOut
} from 'lucide-react';

import { CarePilotLogo } from '../common/CarePilotLogo';

interface MobileNavigationProps {
  role: 'admin' | 'patient';
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { label: t('nav.dashboard'), path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 text-amber-500" /> },
    { label: t('nav.patients'), path: '/admin/patients', icon: <Users className="w-5 h-5 text-blue-600" /> },
    { label: t('nav.doctors'), path: '/admin/doctors', icon: <Stethoscope className="w-5 h-5 text-teal-600" /> },
    { label: t('nav.appointments'), path: '/admin/appointments', icon: <CalendarCheck className="w-5 h-5 text-purple-600" /> },
    { label: t('nav.waitlist'), path: '/admin/waitlist', icon: <Clock className="w-5 h-5 text-pink-600" /> },
    { label: t('nav.notifications'), path: '/admin/notifications', icon: <Bell className="w-5 h-5 text-orange-500" /> },
    { label: t('nav.reports'), path: '/admin/reports', icon: <FileText className="w-5 h-5 text-indigo-600" /> },
    { label: t('nav.profile'), path: '/admin/profile', icon: <User className="w-5 h-5 text-emerald-600" /> }
  ];

  const patientNavItems = [
    { label: t('nav.dashboard'), path: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5 text-teal-600" /> },
    { label: t('nav.book_appointment'), path: '/patient/book', icon: <CalendarPlus className="w-5 h-5 text-amber-500" /> },
    { label: t('nav.my_appointments'), path: '/patient/appointments', icon: <CalendarCheck className="w-5 h-5 text-indigo-600" /> },
    { label: t('nav.waitlist'), path: '/patient/waitlist', icon: <Clock className="w-5 h-5 text-pink-600" /> },
    { label: t('nav.notifications'), path: '/patient/notifications', icon: <Bell className="w-5 h-5 text-cyan-600" /> },
    { label: t('nav.profile'), path: '/patient/profile', icon: <User className="w-5 h-5 text-emerald-600" /> }
  ];

  const navItems = role === 'admin' ? adminNavItems : patientNavItems;

  return (
    <div className="md:hidden select-none">
      {/* Top Mobile Bar */}
      <div className="bg-white text-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-200 shadow-xs">
        <CarePilotLogo size="sm" textLight={false} />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-700 hover:text-slate-900 rounded-xl bg-slate-100 border border-slate-200"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-teal-600" />}
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="w-72 bg-white text-slate-800 min-h-screen p-5 flex flex-col justify-between border-r border-slate-200 shadow-xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <p className="text-[10px] text-teal-700 font-extrabold uppercase tracking-wider">{role} Portal</p>
                  <p className="text-sm font-black text-slate-900 truncate max-w-[180px]">{user?.name || user?.email}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                        isActive ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20 border-l-4 border-amber-400' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100"
              >
                <LogOut className="w-5 h-5 text-rose-600" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
