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
  FileDown,
  FileBarChart,
  User,
  LogOut,
  Activity
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
    { label: t('nav.dashboard'), path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 text-amber-400" /> },
    { label: t('nav.patients'), path: '/admin/patients', icon: <Users className="w-5 h-5 text-blue-400" /> },
    { label: t('nav.doctors'), path: '/admin/doctors', icon: <Stethoscope className="w-5 h-5 text-teal-400" /> },
    { label: t('nav.appointments'), path: '/admin/appointments', icon: <CalendarCheck className="w-5 h-5 text-purple-400" /> },
    { label: t('nav.waitlist'), path: '/admin/waitlist', icon: <Clock className="w-5 h-5 text-pink-400" /> },
    { label: t('nav.analytics'), path: '/admin/analytics', icon: <FileBarChart className="w-5 h-5 text-emerald-400" /> },
    { label: t('nav.notifications'), path: '/admin/notifications', icon: <Bell className="w-5 h-5 text-orange-400" /> },
    { label: t('nav.profile'), path: '/admin/profile', icon: <User className="w-5 h-5 text-emerald-400" /> }
  ];

  const patientNavItems = [
    { label: t('nav.dashboard'), path: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5 text-teal-400" /> },
    { label: t('nav.book_appointment'), path: '/patient/book', icon: <CalendarPlus className="w-5 h-5 text-amber-400" /> },
    { label: t('nav.my_appointments'), path: '/patient/appointments', icon: <CalendarCheck className="w-5 h-5 text-indigo-400" /> },
    { label: t('nav.waitlist'), path: '/patient/waitlist', icon: <Clock className="w-5 h-5 text-pink-400" /> },
    { label: t('nav.notifications'), path: '/patient/notifications', icon: <Bell className="w-5 h-5 text-cyan-400" /> },
    { label: t('nav.profile'), path: '/patient/profile', icon: <User className="w-5 h-5 text-emerald-400" /> }
  ];

  const navItems = role === 'admin' ? adminNavItems : patientNavItems;

  return (
    <div className="md:hidden select-none">
      {/* Top Mobile Bar */}
      <div className="bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800/80">
        <CarePilotLogo size="sm" textLight={true} />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-teal-400" />}
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsOpen(false)}>
          <div
            className="w-72 bg-slate-950 text-slate-300 min-h-screen p-5 flex flex-col justify-between border-r border-slate-800/80 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <p className="text-[10px] text-teal-400 font-black uppercase tracking-widest">{role} Command Center</p>
                  <p className="text-sm font-bold text-white truncate max-w-[180px]">{user?.name || user?.email}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900">
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
                        isActive ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 border-l-4 border-amber-400' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40"
              >
                <LogOut className="w-5 h-5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

