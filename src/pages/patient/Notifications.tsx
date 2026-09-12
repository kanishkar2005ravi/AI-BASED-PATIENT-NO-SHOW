import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from '../../types';
import { Bell, Check, AlertTriangle, Calendar, RefreshCw, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    callBackend({ action: 'GET_NOTIFICATIONS', data: { userId: user?.id } }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    const res = await callBackend({ action: 'MARK_NOTIFICATION_READ', data: { notificationId: id } });
    if (res.success) {
      setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
      showToast('Marked as read.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="My Reminders & Notifications" />

      {/* 🔙 BACK TO DASHBOARD BUTTON 🔙 */}
      <div>
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <Card
        title="Notifications & Advisory Alerts"
        action={
          <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchNotifications}>
            Refresh
          </Button>
        }
      >
        {loading ? (
          <Loading message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You have no unread reminders or appointment alerts."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between ${
                  n.read ? 'bg-slate-50/50 border-slate-200/80 opacity-80' : 'bg-white border-teal-200 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${
                    n.type === 'AI Risk'
                      ? 'bg-rose-50 text-rose-600'
                      : n.type === 'Waitlist'
                      ? 'bg-teal-50 text-teal-600'
                      : 'bg-sky-50 text-sky-600'
                  }`}>
                    {n.type === 'AI Risk' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                      {!n.read && <Badge variant="teal" size="sm">UNREAD</Badge>}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[11px] text-slate-400 font-medium mt-2 inline-block">
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Check className="w-4 h-4 text-emerald-600" />}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
