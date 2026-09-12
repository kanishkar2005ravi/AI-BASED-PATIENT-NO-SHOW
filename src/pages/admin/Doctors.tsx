import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { callBackend } from '../../services/api';
import { Doctor } from '../../types';
import { Stethoscope, Plus, Calendar, Clock, Edit, UserX, UserCheck, Mail, Phone } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/common/BackButton';

export const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchDoctors = () => {
    setLoading(true);
    callBackend({ action: 'GET_DOCTORS' }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setDoctors(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleDoctorStatus = async (doc: Doctor) => {
    const newStatus = doc.status === 'Active' ? 'Inactive' : 'Active';
    const res = await callBackend({
      action: 'UPDATE_DOCTOR',
      data: { doctorId: doc.id, status: newStatus }
    });
    if (res.success) {
      showToast(`Doctor ${doc.name} status updated to ${newStatus}.`, 'success');
      fetchDoctors();
    } else {
      showToast('Failed to update doctor status.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="Hospital Doctor Management" />
      <BackButton variant="admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Doctor Directory & Schedules</h2>
          <p className="text-xs text-slate-500">Doctors are hospital entities managed by the Administrator</p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/doctors/create')}
        >
          Add New Doctor
        </Button>
      </div>

      {loading ? (
        <Loading message="Loading hospital medical staff..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No Doctors Registered"
          description="Add doctor records to manage hospital schedules and appointment availability."
          actionLabel="Add Doctor"
          onAction={() => navigate('/admin/doctors/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <Card key={doc.id} className="relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-200">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{doc.name}</h3>
                      <p className="text-xs font-semibold text-teal-600">{doc.specialization}</p>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'Active' ? 'success' : 'danger'} size="sm">
                    {doc.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 my-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Doctor ID:</span>
                    <span className="font-mono font-bold text-slate-800">{doc.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-800">{doc.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold text-slate-800">{doc.experience} Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{doc.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Clock className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/admin/doctors/${doc.id}/availability`)}
                  >
                    Availability
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Edit className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/admin/doctors/${doc.id}`)}
                  >
                    Manage Profile
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  icon={<Mail className="w-3.5 h-3.5" />}
                  onClick={async () => {
                    showToast(`Sending today's patient roster to ${doc.name}...`, 'info');
                    const res = await callBackend({
                      action: 'SEND_DOCTOR_SCHEDULE',
                      data: {
                        doctorId: doc.id,
                        doctorName: doc.name,
                        email: doc.email,
                        phone: doc.phone || '+919876543210',
                        date: new Date().toISOString().split('T')[0]
                      }
                    });
                    if (res.success) {
                      showToast(`Today's patient schedule sent to ${doc.name} via Email & WhatsApp!`, 'success');
                    } else {
                      showToast(`Failed to send daily schedule to ${doc.name}.`, 'error');
                    }
                  }}
                >
                  Send Today's Schedule (Email/WhatsApp)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
