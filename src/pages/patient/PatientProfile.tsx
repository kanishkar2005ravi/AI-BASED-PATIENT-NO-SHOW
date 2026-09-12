import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { User, Mail, Phone, Calendar, MapPin, Save, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields permitted for patient self-update
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    callBackend({ action: 'GET_PATIENT', data: { patientId: user?.id } }).then(res => {
      if (isMounted) {
        if (res.success && res.data) {
          setPatient(res.data);
          setPhone(res.data.phone || '');
          setAddress(res.data.address || '');
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);

    const res = await callBackend({
      action: 'UPDATE_PATIENT',
      data: {
        patientId: patient.id,
        phone,
        address
      }
    });

    setSaving(false);
    if (res.success) {
      showToast('Contact details updated successfully.', 'success');
      setPatient({ ...patient, phone, address });
    } else {
      showToast('Failed to update profile.', 'error');
    }
  };

  if (loading || !patient) {
    return (
      <div>
        <Header title="My Profile" />
        <div className="py-20">
          <Loading message="Loading profile information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title="Patient Medical Account Profile" />

      {/* 🔙 BACK TO DASHBOARD BUTTON 🔙 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-black transition-all shadow-sm group cursor-pointer border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400 group-hover:-translate-x-1 transition-transform" />
          <span>&larr; Back to Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 text-center p-6">
          <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-black mx-auto mb-3 border-2 border-teal-300">
            {patient.name.charAt(0)}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
          <p className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mt-1 inline-block">
            ID: {patient.id}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Visits:</span>
              <span className="font-bold text-slate-900">{patient.totalAppointments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Attended:</span>
              <span className="font-bold text-emerald-600">{patient.attendedAppointments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">No-Show Rate:</span>
              <span className="font-bold text-slate-900">{patient.noShowRate}%</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2" title="Personal Details & Contact Settings">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Read-Only Admin Managed Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Email Address (Managed by Admin)</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{patient.email}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date of Birth & Gender</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{patient.dateOfBirth} ({patient.gender})</p>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
              Editable Contact Details
            </p>

            <Input
              label="Phone Contact Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Residential Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              icon={<MapPin className="w-4 h-4 text-slate-400" />}
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
                Save Contact Updates
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
