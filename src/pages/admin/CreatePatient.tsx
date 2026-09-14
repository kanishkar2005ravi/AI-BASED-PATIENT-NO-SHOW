import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { callBackend } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, UserPlus, ShieldAlert, KeyRound } from 'lucide-react';

export const CreatePatient: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(true);
  const [idError, setIdError] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '1995-05-15',
    gender: 'Male',
    address: '',
    password: 'temporary-password',
    role: 'patient'
  });

  const fetchNextId = async () => {
    setLoadingId(true);
    setIdError('');
    try {
      const res = await callBackend({ action: 'GET_PATIENTS' });
      if (res.success && Array.isArray(res.data)) {
        let max = 0;
        res.data.forEach((p: any) => {
          if (p.id && typeof p.id === 'string' && p.id.startsWith('PAT-')) {
            const numPart = p.id.split('-')[1];
            if (numPart && /^\d+$/.test(numPart)) {
              const num = parseInt(numPart, 10);
              if (num > max) max = num;
            }
          }
        });
        const nextId = `PAT-${max + 1}`;
        setFormData(prev => ({ ...prev, patientId: nextId }));
      } else {
        setIdError('Failed to retrieve current database state.');
      }
    } catch (e) {
      setIdError('Network error while calculating patient ID.');
    } finally {
      setLoadingId(false);
    }
  };

  useEffect(() => {
    fetchNextId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idError || !formData.patientId) {
      showToast('Cannot create patient without a valid auto-generated ID. Please refresh.', 'error');
      return;
    }
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Please fill in all required patient fields.', 'error');
      return;
    }

    setLoading(true);
    let res = await callBackend({
      action: 'CREATE_PATIENT',
      data: formData
    });

    // Handle race condition conflict by recalculating and retrying once
    if (!res.success && (res.message?.toLowerCase().includes('conflict') || res.message?.toLowerCase().includes('duplicate') || res.error?.toLowerCase().includes('duplicate') || res.error?.toLowerCase().includes('conflict'))) {
      showToast('ID conflict detected. Recalculating next ID and retrying...', 'warning');
      
      const freshRes = await callBackend({ action: 'GET_PATIENTS' });
      if (freshRes.success && Array.isArray(freshRes.data)) {
        let max = 0;
        freshRes.data.forEach((p: any) => {
          if (p.id && typeof p.id === 'string' && p.id.startsWith('PAT-')) {
            const numPart = p.id.split('-')[1];
            if (numPart && /^\d+$/.test(numPart)) {
              const num = parseInt(numPart, 10);
              if (num > max) max = num;
            }
          }
        });
        const nextId = `PAT-${max + 1}`;
        
        res = await callBackend({
          action: 'CREATE_PATIENT',
          data: { ...formData, patientId: nextId }
        });
      }
    }

    setLoading(false);
    if (res.success) {
      showToast(res.message || 'Patient created successfully!', 'success');
      navigate('/admin/patients');
    } else {
      showToast(res.message || 'Failed to create patient.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="Create New Patient Account" />

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/patients')}>
          Back to Patients
        </Button>
      </div>

      <Card title="Patient Account Information" subtitle="Admin-only patient registration portal">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Admin Privileged Action</p>
              <p className="mt-0.5">
                Patients cannot self-register. The temporary password specified below will allow the patient to log in. Passwords are encrypted upon account provisioning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Patient ID"
              name="patientId"
              value={loadingId ? 'Generating...' : formData.patientId}
              onChange={handleChange}
              helperText={idError || "Auto-calculated based on current database state"}
              required
              disabled={loadingId}
            />

            <Input
              label="Full Name *"
              name="name"
              placeholder="Enter patient full name..."
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address *"
              type="email"
              name="email"
              placeholder="Enter email address..."
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              placeholder="Enter 10-digit mobile number..."
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </div>

          <Input
            label="Full Home Address"
            name="address"
            placeholder="Enter complete residential home address..."
            value={formData.address}
            onChange={handleChange}
          />

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Temporary Password *"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={<KeyRound className="w-4 h-4 text-slate-400" />}
              helperText="Initial password assigned by administrator"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => navigate('/admin/patients')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={<UserPlus className="w-4 h-4" />}>
              Provision Patient Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
