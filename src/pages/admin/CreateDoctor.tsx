import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { callBackend } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Stethoscope, Plus } from 'lucide-react';

export const CreateDoctor: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    specialization: 'Cardiology',
    department: 'Cardiology Department',
    email: '',
    phone: '',
    experience: 8
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Please enter the doctor name.', 'error');
      return;
    }

    setLoading(true);
    const res = await callBackend({
      action: 'CREATE_DOCTOR',
      data: formData
    });
    setLoading(false);

    if (res.success) {
      showToast(res.message || 'Doctor added successfully!', 'success');
      navigate('/admin/doctors');
    } else {
      showToast(res.message || 'Failed to add doctor.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="Add Doctor Record" />

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/doctors')}>
          Back to Doctors
        </Button>
      </div>

      <Card title="Doctor Information" subtitle="Create hospital medical staff entry (Admin Only)">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Doctor ID"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              helperText="Unique hospital identifier"
              required
            />

            <Input
              label="Doctor Name *"
              name="name"
              placeholder="e.g. Dr. Arun Kumar"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Select
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              options={[
                { value: 'Cardiology', label: 'Cardiology' },
                { value: 'Dermatology', label: 'Dermatology' },
                { value: 'General Medicine', label: 'General Medicine' },
                { value: 'Neurology', label: 'Neurology' },
                { value: 'Orthopedics', label: 'Orthopedics' },
                { value: 'Pediatrics', label: 'Pediatrics' }
              ]}
            />

            <Input
              label="Department Name"
              name="department"
              placeholder="Cardiology Department"
              value={formData.department}
              onChange={handleChange}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="arun.kumar@aicareschedule.com"
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              label="Phone Contact"
              name="phone"
              placeholder="+91 98401 22334"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Years of Experience"
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => navigate('/admin/doctors')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={<Plus className="w-4 h-4" />}>
              Save Doctor Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
