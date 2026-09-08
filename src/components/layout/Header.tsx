import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Wifi, WifiOff, Sparkles, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isDemoMode, callBackend } from '../../services/api';

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
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(2);
  const demoActive = isDemoMode();

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

      {/* Center Title: SNS Medical College & Hospital (Circle / Pill Shape) + Page Name */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 via-purple-500/10 via-blue-500/10 to-teal-500/10 border border-slate-300/80 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-teal-500 animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">
            SNS Medical College & Hospital
          </span>
        </div>
        <p className="text-base font-black text-slate-900 leading-tight mt-1">
          {title === 'Admin Hospital Dashboard' || title === 'Hospital Overview & AI Intelligence' ? 'Admin Dashboard' : title}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center justify-end space-x-4 w-1/4">
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
    </header>
  );
};
