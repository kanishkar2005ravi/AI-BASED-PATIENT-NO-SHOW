import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarPlus,
  CalendarCheck,
  Clock,
  Bell,
  FileText,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Activity
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
      title: 'MAIN COMMAND',
      items: [
        {
          label: t('nav.dashboard'),
          path: '/patient/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 border-l-4 border-amber-400',
          badge: null
        }
      ]
    },
    {
      title: 'PATIENT CARE HUB',
      items: [
        {
          label: t('nav.book_appointment'),
          path: '/patient/book',
          icon: <CalendarPlus className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />,
          activeGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 border-l-4 border-white',
          badge: { text: '+ BOOK NOW', color: 'bg-amber-400/20 text-amber-300 border-amber-400/40' }
        },
        {
          label: t('nav.my_appointments'),
          path: '/patient/appointments',
          icon: <CalendarCheck className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />,
          activeGradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 border-l-4 border-teal-300',
          badge: { text: 'Active', color: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/40' }
        },
        {
          label: t('nav.waitlist'),
          path: '/patient/waitlist',
          icon: <Clock className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />,
          activeGradient: 'bg-gradient-to-r from-pink-600 via-rose-600 to-rose-700 text-white shadow-lg shadow-pink-500/30 border-l-4 border-amber-300',
          badge: { text: 'Priority', color: 'bg-pink-400/20 text-pink-300 border-pink-400/40' }
        }
      ]
    },
    {
      title: 'SETTINGS & NOTICES',
      items: [
        {
          label: t('nav.notifications'),
          path: '/patient/notifications',
          icon: <Bell className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />,
          activeGradient: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-l-4 border-amber-400',
          badge: null
        },
        {
          label: t('nav.profile'),
          path: '/patient/profile',
          icon: <User className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />,
          activeGradient: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-l-4 border-white',
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
          icon: <LayoutDashboard className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 border-l-4 border-white',
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
          icon: <Users className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 border-l-4 border-teal-300',
          badge: null
        },
        {
          label: t('nav.doctors'),
          path: '/admin/doctors',
          icon: <Stethoscope className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 border-l-4 border-amber-300',
          badge: null
        },
        {
          label: t('nav.appointments'),
          path: '/admin/appointments',
          icon: <CalendarCheck className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border-l-4 border-pink-300',
          badge: null
        },
        {
          label: t('nav.waitlist'),
          path: '/admin/waitlist',
          icon: <Clock className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30 border-l-4 border-white',
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
          icon: <Bell className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 border-l-4 border-white',
          badge: null
        },
        {
          label: t('nav.reports'),
          path: '/admin/reports',
          icon: <FileText className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/30 border-l-4 border-cyan-300',
          badge: null
        },
        {
          label: t('nav.profile'),
          path: '/admin/profile',
          icon: <User className="w-5 h-5" />,
          activeGradient: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 border-l-4 border-amber-300',
          badge: null
        }
      ]
    }
  ];

  const navSections = role === 'admin' ? adminNavSections : patientNavSections;

  return (
    <aside className="w-68 bg-slate-950 text-slate-300 min-h-screen flex flex-col justify-between p-4 hidden md:flex border-r border-slate-800/80 flex-shrink-0 relative overflow-hidden select-none">
      {/* Top 7-Color Rainbow Neon Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-teal-400 via-cyan-400 via-indigo-500 to-purple-600 animate-pulse" />

      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-20 -left-12 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-32 -right-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="px-2 py-2 flex items-center justify-between">
          <CarePilotLogo size="sm" textLight={true} />
        </div>

        {/* Role & User Badge Banner */}
        <div className="px-1">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 shadow-inner flex items-center space-x-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-teal-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                  {role === 'patient' ? 'Patient Command Center' : 'Hospital Admin'}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate leading-tight mt-0.5">{user?.name || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <span>{section.title}</span>
              </p>
              <nav className="space-y-1">
                {section.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                        isActive
                          ? `${item.activeGradient} scale-[1.02]`
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/90 hover:translate-x-1 border border-transparent'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                        {item.icon}
                      </span>
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${item.badge.color}`}>
                        {item.badge.text}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Direct Fast Booking Callout for Patients */}
        {role === 'patient' && (
          <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 text-xs space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-teal-300 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> Fast Appointment
              </span>
              <span className="text-[9px] font-black bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">SNS Care</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">Need an urgent doctor consultation at SNS Hospital?</p>
            <button
              onClick={() => navigate('/patient/book')}
              className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-1 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Book Appointment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer / Logout Section */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 space-y-2">
        <div className="px-2 py-1 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CarePilot v2.5
          </span>
          <span className="text-teal-400">SNS Medical</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

