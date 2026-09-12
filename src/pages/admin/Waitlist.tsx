import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { callBackend } from '../../services/api';
import { WaitlistItem } from '../../types';
import { Clock, CheckCircle2, AlertCircle, Sparkles, RefreshCw, UserCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/common/BackButton';
import { useLanguage } from '../../context/LanguageContext';

export const Waitlist: React.FC = () => {
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const fetchWaitlist = () => {
    setLoading(true);
    callBackend({ action: 'GET_WAITLIST' }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setWaitlist(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleAssignSlot = async (waitlistId: string) => {
    const res = await callBackend({ action: 'ACCEPT_WAITLIST_SLOT', data: { waitlistId } });
    if (res.success) {
      showToast('Slot assigned! Appointment successfully booked for patient.', 'success');
      fetchWaitlist();
    } else {
      showToast(res.message || 'Unable to assign slot.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title={t('waitlist.admin_title')} />
      <BackButton variant="admin" />

      <Card
        title={t('waitlist.active_queue')}
        action={
          <button onClick={fetchWaitlist} className="text-xs font-bold text-teal-600 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> {t('waitlist.refresh')}
          </button>
        }
      >
        {loading ? (
          <Loading message="Loading waitlist queue..." />
        ) : waitlist.length === 0 ? (
          <EmptyState
            title="Waitlist Empty"
            description="There are currently no patients waiting for open appointment slots."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">{t('waitlist.pos')}</th>
                  <th className="py-3 px-4">{t('label.patient')}</th>
                  <th className="py-3 px-4">{t('label.doctor')}</th>
                  <th className="py-3 px-4">{t('waitlist.target_date')}</th>
                  <th className="py-3 px-4">{t('waitlist.preferred_slot')}</th>
                  <th className="py-3 px-4">{t('waitlist.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waitlist.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-center text-teal-700 font-mono">
                      <span className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center inline-flex">
                        #{item.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.doctorName}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{item.requestedDate}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{item.requestedTimeSlot || 'Any Time'}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={item.status === 'WAITING' ? 'warning' : item.status === 'NOTIFIED' ? 'info' : 'success'} size="sm">
                        {item.status === 'WAITING' ? 'Waiting in Queue' : item.status === 'NOTIFIED' ? 'Email Sent (Pending Confirmation)' : 'Confirmed by Patient'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
