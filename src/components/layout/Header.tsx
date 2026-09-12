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

      {/* Center Title: Login CarePilot Logo Icon + SNS Medical College & Hospital (One Line - Clickable Address Modal) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        <button
          onClick={() => setShowAddressModal(true)}
          className="inline-flex items-center space-x-2.5 px-4 py-1 rounded-2xl bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 border-2 border-teal-400/40 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/30 transition-all hover:scale-105 cursor-pointer whitespace-nowrap group"
          title="Click to view full Hospital Address & Location"
        >
          <CarePilotLogo size="sm" showText={false} />
          <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-teal-200 group-hover:from-amber-200 group-hover:to-teal-100">
            {t('welcome.institution')}
          </span>
          <MapPin className="w-3.5 h-3.5 text-amber-400 group-hover:animate-bounce" />
        </button>
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


        {/* User Profile Quick Link */}
        <div
          onClick={() => navigate(role === 'admin' ? '/admin/profile' : '/patient/profile')}
          className="flex items-center space-x-3 cursor-pointer pl-2 border-l border-slate-200"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500 capitalize">{role === 'admin' ? 'Administrator' : 'Patient'}</p>
          </div>
        </div>
      </div>

      {/* 📍 SNS MEDICAL COLLEGE & HOSPITAL ADDRESS MODAL 📍 */}
      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-5 relative overflow-hidden select-none"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <CarePilotLogo size="sm" showText={false} />
                <div>
                  <h3 className="text-base font-black text-white leading-tight">
                    {t('welcome.institution')}
                  </h3>
                  <p className="text-xs font-bold text-amber-400">SNS Group of Institutions</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddressModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Card */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-500/30 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex-shrink-0 mt-0.5">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-teal-400 tracking-wider">Official Campus Address</p>
                  <p className="text-sm font-extrabold text-white leading-relaxed">
                    SNS Kalvi Nagar, Sathy Main Road, NH-209, Vazhiyampalayam, Saravanampatti, Coimbatore - 641048
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Phone className="w-4 h-4 text-emerald-400" /> Helpline: 0422-2666222
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-500/30">
                  24/7 Emergency Open
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                onClick={handleCopyAddress}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <Copy className="w-4 h-4 text-amber-400" />
                <span>{copied ? 'Copied!' : 'Copy Address'}</span>
              </button>

              <a
                href="https://www.google.com/maps/search/?api=1&query=SNS+Kalvi+Nagar+Saravanampatti+Coimbatore"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

