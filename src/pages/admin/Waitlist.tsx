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

export const Waitlist: React.FC = () => {
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
      <Header title="Automated Waitlist Recovery System" />

      {/* Recovery Information Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-md">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-400/30 text-teal-300">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">Smart Waitlist Auto-Recovery Workflow</h3>
            <p className="text-xs text-teal-200 mt-1 max-w-2xl leading-relaxed">
              When an appointment is cancelled, the system automatically scans active waitlisted patients, identifies the highest-priority match based on request date and position, dispatches an instant notification, and re-fills the slot upon patient confirmation.
            </p>
          </div>
        </div>
      </div>

      <Card
        title="Active Waitlist Queue"
        action={
          <button onClick={fetchWaitlist} className="text-xs font-bold text-teal-600 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
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
                  <th className="py-3 px-4">Queue Pos</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Doctor Requested</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Preferred Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
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
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status !== 'ACCEPTED' ? (
                        <button
                          onClick={() => handleAssignSlot(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Assign Slot
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Booked
                        </span>
                      )}
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
