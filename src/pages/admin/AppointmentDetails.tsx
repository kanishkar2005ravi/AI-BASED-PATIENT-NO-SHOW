import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { AIRiskBadge } from '../../components/ai/AIRiskBadge';
import { AIRiskExplanationModal } from '../../components/ai/AIRiskExplanationModal';
import { callBackend } from '../../services/api';
import { Appointment } from '../../types';
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRiskModal, setShowRiskModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    callBackend({ action: 'GET_APPOINTMENTS', data: {} }).then(res => {
      if (isMounted && res.success && Array.isArray(res.data)) {
        const found = res.data.find((a: Appointment) => a.id === id);
        setAppointment(found || null);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCancel = async () => {
    if (!appointment) return;
    const res = await callBackend({ action: 'CANCEL_APPOINTMENT', data: { appointmentId: appointment.id } });
    if (res.success) {
      showToast(res.message, 'success');
      setAppointment({ ...appointment, status: 'CANCELLED' });
    } else {
      showToast(res.message || 'Failed to cancel appointment.', 'error');
    }
  };

  if (loading || !appointment) {
    return (
      <div>
        <Header title="Appointment Details" />
        <div className="py-20">
          <Loading message="Fetching appointment information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title={`Appointment: ${appointment.id}`} />

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/appointments')}>
          Back to Appointments
        </Button>

        {appointment.status === 'CONFIRMED' && (
          <Button variant="danger" size="sm" icon={<XCircle className="w-4 h-4" />} onClick={handleCancel}>
            Cancel Appointment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6" title="Appointment Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium">Patient Name</span>
              <p className="text-base font-bold text-slate-900">{appointment.patientName}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {appointment.patientId}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Assigned Physician</span>
              <p className="text-base font-bold text-slate-900">{appointment.doctorName}</p>
              <p className="text-xs text-teal-600 font-semibold mt-0.5">{appointment.doctorSpecialization}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Date:</span>
              <p className="font-bold text-slate-900 mt-1">{appointment.appointmentDate}</p>
            </div>
            <div>
              <span className="text-slate-400">Time:</span>
              <p className="font-bold text-slate-900 mt-1">{appointment.appointmentTime}</p>
            </div>
            <div>
              <span className="text-slate-400">Type:</span>
              <p className="font-bold text-slate-900 mt-1">{appointment.appointmentType}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">Current Appointment Status</span>
            <Badge variant={appointment.status === 'CONFIRMED' ? 'info' : appointment.status === 'COMPLETED' ? 'success' : 'danger'} size="md">
              {appointment.status}
            </Badge>
          </div>
        </Card>

        <Card title="AI Predictive Evaluation">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-400 font-bold uppercase">No-Show Risk</p>
                <h4 className="text-2xl font-black">{Math.round((appointment.risk.probability || 0.2) * 100)}%</h4>
              </div>
              <AIRiskBadge risk={appointment.risk} onClick={() => setShowRiskModal(true)} size="md" />
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {appointment.risk.recapNotes || 'Evaluated based on patient attendance history, booking lead time, and SMS response.'}
            </p>

            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowRiskModal(true)}>
              Inspect Full Factor Breakdown
            </Button>
          </div>
        </Card>
      </div>

      {showRiskModal && (
        <AIRiskExplanationModal
          isOpen={showRiskModal}
          onClose={() => setShowRiskModal(false)}
          risk={appointment.risk}
          patientName={appointment.patientName}
          isAdmin
        />
      )}
    </div>
  );
};
