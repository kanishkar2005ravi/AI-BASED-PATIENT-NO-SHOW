import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  HeartPulse,
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Clock,
  BarChart3,
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
    <div className="md:hidden">
      {/* Top Mobile Bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <CarePilotLogo size="sm" textLight={true} />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="w-72 bg-slate-900 text-slate-300 min-h-screen p-5 flex flex-col justify-between"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">{role} Menu</p>
                  <p className="text-sm font-semibold text-white truncate max-w-[180px]">{user?.name}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors ${
                        isActive ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
