import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, Search, Wifi, WifiOff, Sparkles, User as UserIcon, Globe, MapPin, X, Copy, ExternalLink, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isDemoMode, callBackend } from '../../services/api';
import { CarePilotLogo } from '../common/CarePilotLogo';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch
}) => {
  const { user, role } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(2);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const demoActive = isDemoMode();

  const hospitalAddress = "SNS Kalvi Nagar, Sathy Main Road, NH-209, Vazhiyampalayam, Saravanampatti, Coimbatore - 641048";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(hospitalAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    let isMounted = true;
    callBackend({ action: 'GET_NOTIFICATIONS', data: { userId: user?.id } }).then(res => {
      if (isMounted && res.success && Array.isArray(res.data)) {
        const unread = res.data.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleNotificationClick = () => {
    if (role === 'admin') {
      navigate('/admin/notifications');
    } else {
      navigate('/patient/notifications');
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 sticky top-0 z-20 flex items-center justify-between shadow-sm">
      {/* Search Input (Left) */}
      <div className="flex items-center space-x-4 w-1/4">
        {showSearch && (
          <div className="relative flex-1 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={e => onSearch && onSearch(e.target.value)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* Center Title: SNS Medical College & Hospital Badge ON TOP + Page Title BELOW IT */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        <div className="p-0.5 rounded-[22px] bg-gradient-to-r from-amber-400 via-rose-500 via-purple-500 via-teal-400 to-emerald-400 shadow-lg shadow-teal-500/15 hover:shadow-teal-500/30 transition-all hover:scale-105">
          <button
            onClick={() => setShowAddressModal(true)}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-[20px] bg-slate-950 text-white cursor-pointer whitespace-nowrap group border border-slate-800"
            title="Click to view full Hospital Address & Location"
          >
            <CarePilotLogo size="sm" showText={false} />
            <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-teal-200 group-hover:from-amber-200 group-hover:to-teal-100">
              {t('welcome.institution')}
            </span>
            <MapPin className="w-3.5 h-3.5 text-amber-400 group-hover:animate-bounce" />
          </button>
        </div>
        <p className="text-base font-black text-slate-900 leading-tight mt-1">
          {title === 'Patient Dashboard' ? t('nav.dashboard') :
           title === 'Admin Dashboard' || title === 'Admin Hospital Dashboard' || title === 'Hospital Overview & AI Intelligence' ? t('nav.dashboard') :
           title === 'Book Consultation' || title === 'Book Appointment' ? t('nav.book_appointment') :
           title === 'Patient Directory' || title === 'Patients' ? t('nav.patients') :
           title === 'Physician Directory' || title === 'Doctors' ? t('nav.doctors') :
           title === 'Appointments Schedule' || title === 'Appointments' || title === 'My Appointments' ? t('nav.appointments') :
           title === 'Waitlist Queue' || title === 'Waitlist' ? t('nav.waitlist') :
           title === 'Notifications' ? t('nav.notifications') :
           title}
        </p>
      </div>


      {/* Right Controls */}
      <div className="flex items-center justify-end space-x-3 w-1/4">
        {/* Language Switcher Button (English / Tamil) */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-300/80 text-teal-900 text-xs font-black transition-all shadow-xs"
          title="Switch Language / மொழியை மாற்றுக"
        >
          <Globe className="w-4 h-4 text-teal-700 animate-spin-slow" />
          <span>{language === 'en' ? '🇬🇧 EN' : '🇮🇳 தமிழ்'}</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={handleNotificationClick}
          className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>


        {/* User Profile Quick Link - Unique Color & Neon Pill Design */}
        <div
          onClick={() => navigate(role === 'admin' ? '/admin/profile' : '/patient/profile')}
          className="group relative cursor-pointer p-[2px] rounded-2xl bg-gradient-to-r from-teal-400 via-amber-400 via-rose-400 to-indigo-500 shadow-md hover:shadow-lg transition-all hover:scale-[1.03]"
          title="View My Patient Profile"
        >
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-[14px] bg-slate-950 text-white">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 via-emerald-400 to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-white leading-tight group-hover:text-amber-300 transition-colors">
                {user?.name || 'User'}
              </p>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-950/80 px-1.5 py-0.2 rounded border border-teal-500/30">
                {role === 'admin' ? 'Administrator' : 'Patient Profile'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📍 EXACT 50% VERTICAL MIDPOINT (5 OUT OF 10) SCREEN CENTER HOSPITAL ADDRESS MODAL 📍 */}
      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="p-[3px] rounded-[34px] bg-gradient-to-r from-amber-400 via-rose-500 via-purple-500 via-teal-400 to-emerald-400 shadow-2xl shadow-teal-500/40 w-full max-w-md select-none my-auto transform transition-all scale-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full bg-slate-950 rounded-[31px] p-6 text-white space-y-5 relative overflow-hidden text-center">
              {/* Background Ambient Glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3 text-left">
                  <CarePilotLogo size="sm" showText={false} />
                  <div>
                    <h3 className="text-sm font-black text-white leading-tight">
                      {t('welcome.institution')}
                    </h3>
                    <p className="text-[11px] font-bold text-amber-400">SNS Group of Institutions</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Centered Address Box */}
              <div className="p-5 rounded-[24px] bg-slate-900/90 border border-teal-500/40 space-y-4 text-center">
                <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-inner">
                  <MapPin className="w-9 h-9 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-black uppercase text-teal-300 tracking-widest">Hospital Campus Address</p>
                  <p className="text-sm md:text-base font-black text-white leading-relaxed max-w-sm mx-auto">
                    SNS Kalvi Nagar, Sathy Main Road, NH-209, Vazhiyampalayam, Saravanampatti, Coimbatore - 641048
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Phone className="w-4 h-4 text-emerald-400" /> Emergency Helpline: 0422-2666222
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-black border border-emerald-500/30">
                    24 Hours Emergency & Ambulance Service
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={handleCopyAddress}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                </button>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=SNS+Kalvi+Nagar+Saravanampatti+Coimbatore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

