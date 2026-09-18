import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { callBackend } from '../../services/api';
import { Doctor, WaitlistItem } from '../../types';
import { Clock, Plus, Trash2, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getLocalDateString } from '../../utils/helpers';

export const Waitlist: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State to join waitlist
  const today = getLocalDateString();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [requestedDate, setRequestedDate] = useState(today);
  const [requestedTimeSlot, setRequestedTimeSlot] = useState('Morning');
  const [joining, setJoining] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      callBackend({ action: 'GET_WAITLIST', data: { patientId: user?.id } }),
      callBackend({ action: 'GET_DOCTORS' })
    ]).then(([wtlRes, docRes]) => {
      if (wtlRes.success && Array.isArray(wtlRes.data)) {
        const uId = (user?.id || '').trim().toLowerCase();
        setWaitlist(wtlRes.data.filter((w: WaitlistItem) => {
          const pId = (w.patientId || (w as any).patient_id || '').trim().toLowerCase();
          return pId === uId;
        }));
      }
      if (docRes.success && Array.isArray(docRes.data)) {
        const activeDoctors = docRes.data.filter((d: Doctor) => d.status === 'Active');
        setDoctors(activeDoctors);

        setSelectedDoctorId(current => {
          if (current && activeDoctors.some(d => d.id === current)) {
            return current;
          }
          return activeDoctors[0]?.id || '';
        });
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
        patient_id: user?.id || 'PAT-001',
        patientName: user?.name || 'Patient',
        patient_name: user?.name || 'Patient',
        doctorId: doc.id,
        doctor_id: doc.id,
        doctorName: doc.name,
        doctor_name: doc.name,
        doctorSpecialization: doc.specialization,
        doctor_specialization: doc.specialization,
        requestedDate,
        requested_date: requestedDate,
        requestedTimeSlot,
        requested_time_slot: requestedTimeSlot,
        email: user?.email,
        phone: user?.phone
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
    const res = await callBackend({ 
      action: 'ACCEPT_WAITLIST_SLOT', 
      data: { 
        waitlistId,
        email: user?.email,
        phone: user?.phone 
      } 
    });
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
      <Header title={t('waitlist.title')} />

      {/* ⬅️ BACK TO DASHBOARD BUTTON ⬅️ */}
      <div>
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600 group-hover:-translate-x-1 transition-transform" />
          <span>{t('dashboard.back_to_dashboard')}</span>
        </button>
      </div>

      {/* 📋 CLEAN WHITE WAITLIST NOTE 📋 */}
      <div className="p-4 md:p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-start space-x-3.5">
        <div className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-extrabold text-xs uppercase tracking-wider flex-shrink-0 shadow-xs mt-0.5">
          {t('note.label')}
        </div>
        <div className="text-xs text-slate-700 font-medium leading-relaxed">
          <p className="font-extrabold text-slate-900 text-sm mb-0.5">{t('note.waitlist_title')}</p>
          <p className="text-slate-600 text-xs">
            {t('note.waitlist_desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Join Waitlist */}
        <Card title={t('waitlist.join_card')} className="lg:col-span-1">
          <form onSubmit={handleJoin} className="space-y-4">
            <Select
              label={t('waitlist.select_doctor')}
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
              options={doctors.map(d => ({ value: d.id, label: `${d.name} (${d.specialization})` }))}
            />

            <Input
              label={t('waitlist.req_date')}
              type="date"
              value={requestedDate}
              min={today}
              onChange={e => setRequestedDate(e.target.value)}
              required
            />

            <Select
              label="Preferred Slot"
              value={requestedTimeSlot}
              onChange={e => setRequestedTimeSlot(e.target.value)}
              options={[
                { value: 'Morning', label: 'Morning' },
                { value: 'Afternoon', label: 'Afternoon' },
                { value: 'Evening', label: 'Evening' },
                { value: 'Any Time', label: 'Any Time' }
              ]}
            />

            <Button variant="primary" type="submit" className="w-full" isLoading={joining} icon={<Plus className="w-4 h-4" />}>
              {t('waitlist.join_button')}
            </Button>
          </form>
        </Card>

        {/* My Active Waitlist Positions */}
        <Card title={t('waitlist.queue_title')} className="lg:col-span-2">
          {loading ? (
            <Loading message={t('appointments.fetching')} />
          ) : waitlist.length === 0 ? (
            <EmptyState
              title={t('waitlist.empty_title')}
              description={t('waitlist.empty_desc')}
            />
          ) : (
            <div className="space-y-3">
              {waitlist.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 font-extrabold flex items-center justify-center text-xs border border-teal-200 shadow-2xs">
                      Position #{item.position}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.doctorName}</h4>
                      <p className="text-xs text-slate-500">{t('waitlist.req_date')}: {item.requestedDate} &bull; {item.requestedTimeSlot}</p>
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
                        Accept Slot
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
