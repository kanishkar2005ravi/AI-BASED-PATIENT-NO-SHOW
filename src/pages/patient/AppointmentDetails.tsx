import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { Appointment } from '../../types';
import { ArrowLeft } from 'lucide-react';

export const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    callBackend({ action: 'GET_APPOINTMENTS', data: { patientId: user?.id } }).then(res => {
      if (isMounted && res.success && Array.isArray(res.data)) {
        const found = res.data.find((a: Appointment) => a.id === id);
        setAppointment(found || null);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id, user?.id]);

  if (loading || !appointment) {
    return (
      <div>
        <Header title="Appointment Details" />
        <div className="py-20">
          <Loading message="Fetching appointment info..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title={`Appointment: ${appointment.id}`} />

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/patient/appointments')}>
          Back to Appointments
        </Button>
      </div>

      <Card title="Appointment Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-xs text-slate-400 font-medium">Physician</span>
            <h4 className="text-lg font-bold text-slate-900">{appointment.doctorName}</h4>
            <p className="text-xs text-teal-600 font-semibold">{appointment.doctorSpecialization}</p>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium">Schedule</span>
            <p className="text-base font-bold text-slate-900">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
            <p className="text-xs text-slate-500 font-medium">Type: {appointment.appointmentType}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">Appointment Status</span>
          <Badge variant={appointment.status === 'CONFIRMED' ? 'info' : appointment.status === 'COMPLETED' ? 'success' : 'danger'} size="md">
            {appointment.status}
          </Badge>
        </div>
      </Card>
    </div>
  );
};
