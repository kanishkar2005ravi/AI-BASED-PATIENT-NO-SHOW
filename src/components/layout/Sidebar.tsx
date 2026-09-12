import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  Clock,
  Bell,
  FileText,
  User,
  LogOut
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

  const patientNavSections = [
    {
      title: 'PATIENT PORTAL',
      items: [
        {
          label: t('nav.dashboard'),
          path: '/patient/dashboard',
          icon: <LayoutDashboard className="w-5 h-5 text-teal-600" />,
          activeGradient: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20 border-l-4 border-amber-400',
          badge: null
        },
        {
          label: t('nav.profile'),
          path: '/patient/profile',
          icon: <User className="w-5 h-5 text-emerald-600" />,
          activeGradient: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 border-l-4 border-teal-300',
          badge: null
        },
        {
          label: t('nav.logout'),
          path: '#logout',
          isLogout: true,
          icon: <LogOut className="w-5 h-5 text-rose-600" />,
          activeGradient: 'bg-rose-600 text-white',
          badge: null
        }
      ]
    }
  ];

  const adminNavSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: t('nav.dashboard'),
          path: '/admin/dashboard',
          icon: <LayoutDashboard className="w-5 h-5 text-amber-500" />,
          activeGradient: 'bg-gradient-to-r from-amber-500 to-teal-600 text-white shadow-md shadow-amber-500/20 border-l-4 border-teal-300',
          badge: null
        }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          label: t('nav.patients'),
          path: '/admin/patients',
          icon: <Users className="w-5 h-5 text-blue-600" />,
          activeGradient: 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20 border-l-4 border-teal-300',
          badge: null
        },
        {
          label: t('nav.doctors'),
          path: '/admin/doctors',
          icon: <Stethoscope className="w-5 h-5 text-teal-600" />,
          activeGradient: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20 border-l-4 border-amber-400',
          badge: null
        },
        {
          label: t('nav.appointments'),
          path: '/admin/appointments',
          icon: <CalendarCheck className="w-5 h-5 text-purple-600" />,
          activeGradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border-l-4 border-amber-300',
          badge: null
        },
        {
          label: t('nav.waitlist'),
          path: '/admin/waitlist',
          icon: <Clock className="w-5 h-5 text-pink-600" />,
          activeGradient: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20 border-l-4 border-amber-300',
          badge: null
        }
      ]
    },
    {
      title: 'SYSTEM & ANALYTICS',
      items: [
        {
          label: t('nav.notifications'),
          path: '/admin/notifications',
          icon: <Bell className="w-5 h-5 text-orange-500" />,
          activeGradient: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 border-l-4 border-teal-300',
          badge: null
        },
        {
          label: t('nav.reports'),
          path: '/admin/reports',
          icon: <FileText className="w-5 h-5 text-indigo-600" />,
          activeGradient: 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20 border-l-4 border-teal-300',
          badge: null
        },
        {
          label: t('nav.profile'),
          path: '/admin/profile',
          icon: <User className="w-5 h-5 text-emerald-600" />,
          activeGradient: 'bg-gradient-to-r from-teal-600 to-purple-600 text-white shadow-md shadow-teal-600/20 border-l-4 border-amber-300',
          badge: null
        }
      ]
    }
  ];

  const navSections = role === 'admin' ? adminNavSections : patientNavSections;

  return (
    <aside className="w-56 bg-white border-r border-slate-200 text-slate-800 min-h-screen flex flex-col justify-between p-3.5 hidden md:flex flex-shrink-0 relative overflow-hidden select-none shadow-sm">
      {/* Top Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-teal-500 to-purple-600" />

      <div className="relative z-10 space-y-4">
        {/* Brand Header (Light Theme) */}
        <div className="px-1 py-1 flex items-center justify-between">
          <CarePilotLogo size="sm" textLight={false} />
        </div>

        {/* Role & User Badge Banner */}
        <div className="px-0.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="overflow-hidden flex-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-teal-700 block">
                  {role === 'patient' ? 'Patient Portal' : 'Hospital Admin'}
                </span>
                <p className="text-xs font-black text-slate-900 truncate leading-tight mt-0.5">{user?.name || user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-3">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <nav className="space-y-1">
                {section.items.map(item => {
                  if ((item as any).isLogout) {
                    return (
                      <button
                        key="logout-item"
                        onClick={handleLogout}
                        className="w-full group flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 text-left cursor-pointer mt-2"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                            {item.icon}
                          </span>
                          <span className="tracking-wide">{item.label}</span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `group flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                          isActive
                            ? `${item.activeGradient} scale-[1.01]`
                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                          {item.icon}
                        </span>
                        <span className="tracking-wide">{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Status Badge */}
      <div className="relative z-10 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
        <span>CarePilot v2.4</span>
        <span className="flex items-center gap-1 text-emerald-600 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          Online
        </span>
      </div>
    </aside>
  );
};
