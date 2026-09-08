import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { callBackend } from '../../services/api';
import { NotificationItem } from '../../types';
import { Bell, Check, AlertTriangle, Calendar, RefreshCw, Sparkles, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchNotifications = () => {
    setLoading(true);
    callBackend({ action: 'GET_NOTIFICATIONS', data: { userId: 'ADMIN' } }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    const res = await callBackend({ action: 'MARK_NOTIFICATION_READ', data: { notificationId: id } });
    if (res.success) {
      setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
      showToast('Notification marked as read.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="Admin Hospital System Alerts & Notifications" />

      <Card
        title="Recent System Alerts"
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
            title="No Admin Alerts"
            description="All hospital alerts, high-risk notifications, and waitlist recoveries have been reviewed."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between ${
                  notif.read ? 'bg-slate-50/50 border-slate-200/80 opacity-80' : 'bg-white border-teal-200 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${
                    notif.type === 'AI Risk'
                      ? 'bg-rose-50 text-rose-600'
                      : notif.type === 'Waitlist'
                      ? 'bg-teal-50 text-teal-600'
                      : 'bg-sky-50 text-sky-600'
                  }`}>
                    {notif.type === 'AI Risk' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      {!notif.read && <Badge variant="teal" size="sm">NEW</Badge>}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[11px] text-slate-400 font-medium mt-2 inline-block">
                      {new Date(notif.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Check className="w-4 h-4 text-emerald-600" />}
                    onClick={() => handleMarkRead(notif.id)}
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
