import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { Doctor, WaitlistItem } from '../../types';
import { Clock, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Waitlist: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State to join waitlist
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [requestedDate, setRequestedDate] = useState('2026-09-10');
  const [joining, setJoining] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      callBackend({ action: 'GET_WAITLIST', data: { patientId: user?.id } }),
      callBackend({ action: 'GET_DOCTORS' })
    ]).then(([wtlRes, docRes]) => {
      if (wtlRes.success && Array.isArray(wtlRes.data)) {
        setWaitlist(wtlRes.data.filter((w: WaitlistItem) => w.patientId === user?.id));
      }
      if (docRes.success && Array.isArray(docRes.data)) {
        setDoctors(docRes.data.filter((d: Doctor) => d.status === 'Active'));
        if (docRes.data.length > 0) setSelectedDoctorId(docRes.data[0].id);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
    const urlParams = new URLSearchParams(window.location.search);
    const autoConfirmId = urlParams.get('confirm');
    if (autoConfirmId) {
      handleAccept(autoConfirmId);
    }
  }, [user?.id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === selectedDoctorId);
    if (!doc) return;

    setJoining(true);
    const res = await callBackend({
      action: 'JOIN_WAITLIST',
      data: {
        patientId: user?.id || 'PAT-001',
        patientName: user?.name || 'Kiran Raj',
        doctorId: doc.id,
        doctorName: doc.name,
        requestedDate,
        requestedTimeSlot: 'Morning'
      }
    });

    setJoining(false);
    if (res.success) {
      showToast('Joined waitlist successfully!', 'success');
      fetchData();
    } else {
      showToast(res.message || 'Failed to join waitlist.', 'error');
    }
  };

  const handleAccept = async (waitlistId: string) => {
    const res = await callBackend({ action: 'ACCEPT_WAITLIST_SLOT', data: { waitlistId } });
    if (res.success) {
      showToast('Slot confirmed! Your appointment has been booked.', 'success');
      fetchData();
    } else {
      showToast(res.message || 'Unable to confirm slot.', 'error');
    }
  };

  const handleLeave = async (waitlistId: string) => {
    const res = await callBackend({ action: 'LEAVE_WAITLIST', data: { waitlistId } });
    if (res.success) {
      showToast('Removed from waitlist.', 'info');
      fetchData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="Patient Waitlist Management" />

      {/* Info Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-md">
        <div className="flex items-start space-x-3.5">
          <Sparkles className="w-6 h-6 text-teal-300 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-white">How Waitlist Auto-Recovery Works</h3>
            <p className="text-xs text-teal-200 mt-1 leading-relaxed">
              If your preferred physician is fully booked, join the waitlist. When another patient cancels an appointment, the AI scheduler immediately alerts you in real time to claim the recovered slot!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Join Waitlist */}
        <Card title="Join Doctor Waitlist" className="lg:col-span-1">
          <form onSubmit={handleJoin} className="space-y-4">
            <Select
              label="Select Doctor"
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
              options={doctors.map(d => ({ value: d.id, label: `${d.name} (${d.specialization})` }))}
            />

            <Input
              label="Requested Date"
              type="date"
              value={requestedDate}
              onChange={e => setRequestedDate(e.target.value)}
              required
            />

            <Button variant="primary" type="submit" className="w-full" isLoading={joining} icon={<Plus className="w-4 h-4" />}>
              Join Waitlist Queue
            </Button>
          </form>
        </Card>

        {/* My Active Waitlist Positions */}
        <Card title="My Active Waitlist Queue" className="lg:col-span-2">
          {loading ? (
            <Loading message="Loading waitlist positions..." />
          ) : waitlist.length === 0 ? (
            <EmptyState
              title="No Active Waitlist Requests"
              description="You have not requested any waitlist slots currently."
            />
          ) : (
            <div className="space-y-3">
              {waitlist.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-sm border border-teal-200">
                      #{item.position}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.doctorName}</h4>
                      <p className="text-xs text-slate-500">Requested Date: {item.requestedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={item.status === 'NOTIFIED' ? 'info' : item.status === 'ACCEPTED' ? 'success' : 'warning'} size="sm">
                      {item.status}
                    </Badge>

                    {item.status === 'NOTIFIED' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleAccept(item.id)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Claim & Confirm Slot
                      </Button>
                    )}

                    <button
                      onClick={() => handleLeave(item.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                      title="Leave Waitlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
