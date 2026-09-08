import React, { useState } from 'react';
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

  const [formData, setFormData] = useState({
    patientId: `PAT-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '1995-05-15',
    gender: 'Male',
    address: '',
    password: 'temporary-password',
    role: 'patient'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Please fill in all required patient fields.', 'error');
      return;
    }

    setLoading(true);
    const res = await callBackend({
      action: 'CREATE_PATIENT',
      data: formData
    });

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
              value={formData.patientId}
              onChange={handleChange}
              helperText="Auto-generated unique patient record ID"
              required
            />

            <Input
              label="Full Name *"
              name="name"
              placeholder="e.g. Kiran Raj"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address *"
              type="email"
              name="email"
              placeholder="patient@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              placeholder="9876543210"
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
            placeholder="Coimbatore, Tamil Nadu"
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
