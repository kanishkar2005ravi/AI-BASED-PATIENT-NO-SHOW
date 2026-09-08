import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { callBackend } from '../../services/api';
import { Doctor } from '../../types';
import { ArrowLeft, Stethoscope, Clock, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DoctorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    callBackend({ action: 'GET_DOCTOR', data: { doctorId: id } }).then(res => {
      if (isMounted) {
        if (res.success && res.data) {
          setDoctor(res.data);
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (doctor) {
      setDoctor({ ...doctor, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setSaving(true);
    const res = await callBackend({
      action: 'UPDATE_DOCTOR',
      data: { doctorId: doctor.id, ...doctor }
    });
    setSaving(false);
    if (res.success) {
      showToast('Doctor details updated successfully.', 'success');
      navigate('/admin/doctors');
    } else {
      showToast('Failed to update doctor.', 'error');
    }
  };

  if (loading || !doctor) {
    return (
      <div>
        <Header title="Doctor Profile Management" />
        <div className="py-20">
          <Loading message="Fetching doctor details..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title={`Manage Doctor: ${doctor.name}`} />

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/doctors')}>
          Back to Doctors
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<Clock className="w-4 h-4" />}
          onClick={() => navigate(`/admin/doctors/${doctor.id}/availability`)}
        >
          Manage Weekly Schedule
        </Button>
      </div>

      <Card title="Edit Doctor Profile" subtitle={`Doctor ID: ${doctor.id}`}>
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Doctor Name"
              name="name"
              value={doctor.name}
              onChange={handleChange}
              required
            />

            <Select
              label="Specialization"
              name="specialization"
              value={doctor.specialization}
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
              label="Department"
              name="department"
              value={doctor.department}
              onChange={handleChange}
            />

            <Select
              label="Status"
              name="status"
              value={doctor.status}
              onChange={handleChange}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={doctor.email}
              onChange={handleChange}
            />

            <Input
              label="Phone Contact"
              name="phone"
              value={doctor.phone}
              onChange={handleChange}
            />

            <Input
              label="Years of Experience"
              type="number"
              name="experience"
              value={doctor.experience}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => navigate('/admin/doctors')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
