import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

interface SidebarProps {
  role: 'admin' | 'patient';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Patients', path: '/admin/patients', icon: <Users className="w-5 h-5" /> },
    { label: 'Doctors', path: '/admin/doctors', icon: <Stethoscope className="w-5 h-5" /> },
    { label: 'Appointments', path: '/admin/appointments', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Waitlist', path: '/admin/waitlist', icon: <Clock className="w-5 h-5" /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Reports', path: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
    { label: 'Profile', path: '/admin/profile', icon: <User className="w-5 h-5" /> }
  ];

  const patientNavItems = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Book Appointment', path: '/patient/book', icon: <Calendar className="w-5 h-5" /> },
    { label: 'My Appointments', path: '/patient/appointments', icon: <HeartPulse className="w-5 h-5" /> },
    { label: 'Waitlist', path: '/patient/waitlist', icon: <Clock className="w-5 h-5" /> },
    { label: 'Notifications', path: '/patient/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', path: '/patient/profile', icon: <User className="w-5 h-5" /> }
  ];

  const navItems = role === 'admin' ? adminNavItems : patientNavItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between p-4 hidden md:flex border-r border-slate-800 flex-shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-3 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/50">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-none">AI CareSchedule</h1>
            <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Smart Healthcare
            </span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-3 mb-6">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">{role} Portal</p>
              <p className="text-slate-400 text-[10px] truncate max-w-[150px]">{user?.name || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
