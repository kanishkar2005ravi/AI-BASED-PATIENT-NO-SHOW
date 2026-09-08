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
import { Patient, Appointment, AIRiskAssessment } from '../../types';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Brain, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<AIRiskAssessment | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      callBackend({ action: 'GET_PATIENT', data: { patientId: id } }),
      callBackend({ action: 'GET_PATIENTS' }),
      callBackend({ action: 'GET_APPOINTMENTS', data: { patientId: id } })
    ]).then(([patRes, patsRes, aptsRes]) => {
      if (isMounted) {
        const foundPat = patRes.patient || (patRes.data && patRes.data.name ? patRes.data : null) || (Array.isArray(patsRes.data) ? patsRes.data.find((p: Patient) => p.id === id) : null);
        if (foundPat) {
          setPatient(foundPat);
        }
        if (aptsRes.success && Array.isArray(aptsRes.data)) {
          setAppointments(aptsRes.data);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !patient) {
    return (
      <div>
        <Header title="Patient Medical Profile" />
        <div className="py-20">
          <Loading message="Fetching patient profile & history..." />
        </div>
      </div>
    );
  }

  const latestRisk: AIRiskAssessment = appointments.length > 0 && appointments[0].risk
    ? appointments[0].risk
    : {
        level: patient.noShowRate > 30 ? 'HIGH' : patient.noShowRate > 10 ? 'MEDIUM' : 'LOW',
        probability: patient.noShowRate / 100 || 0.15,
        factors: [
          { factor: 'Historical Attendance Rate', impact: patient.noShowRate > 20 ? 'negative' : 'positive', description: `${100 - patient.noShowRate}% historical attendance record.` }
        ]
      };

  return (
    <div className="space-y-6 pb-12">
      <Header title={`Patient Profile: ${patient.name}`} />

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/patients')}>
          Back to Patients List
        </Button>
      </div>

      {/* Patient Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center p-4 border-b border-slate-100 mb-4">
            <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-black mb-3 border-2 border-teal-300">
              {patient.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{patient.name}</h3>
            <p className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mt-1">
              ID: {patient.id}
            </p>
            <div className="mt-3">
              <Badge variant={patient.status === 'Active' ? 'success' : 'danger'}>
                {patient.status} Patient Account
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{patient.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>DOB: {patient.dateOfBirth} ({patient.gender})</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{patient.address || 'Address not listed'}</span>
            </div>
          </div>
        </Card>

        {/* AI & Attendance Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Visits</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{patient.totalAppointments}</h4>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-center">
              <p className="text-xs font-bold text-emerald-800 uppercase">Attended</p>
              <h4 className="text-2xl font-black text-emerald-900 mt-1">{patient.attendedAppointments}</h4>
            </div>
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 text-center">
              <p className="text-xs font-bold text-rose-800 uppercase">No-Shows</p>
              <h4 className="text-2xl font-black text-rose-900 mt-1">{patient.noShowAppointments}</h4>
            </div>
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-center">
              <p className="text-xs font-bold text-amber-800 uppercase">No-Show Rate</p>
              <h4 className="text-2xl font-black text-amber-900 mt-1">{patient.noShowRate}%</h4>
            </div>
          </div>

          {/* AI Risk Assessment Card */}
          <Card title="Current AI No-Show Evaluation" subtitle="Real-time predictive analysis for upcoming visits">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white mb-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Predictive Score</span>
                <h4 className="text-3xl font-black text-white mt-0.5">
                  {Math.round((latestRisk.probability || 0.15) * 100)}% Risk
                </h4>
              </div>
              <AIRiskBadge
                risk={latestRisk}
                onClick={() => setSelectedRisk(latestRisk)}
                size="lg"
              />
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Risk Factors</h5>
              {latestRisk.factors.map((f, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{f.factor}</span>
                  <span className={`text-[11px] font-bold ${f.impact === 'negative' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {f.description}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Appointment History Table */}
      <Card title="Patient Appointment History">
        {appointments.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No appointment records found for this patient.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 text-xs">
                      {apt.appointmentDate} at {apt.appointmentTime}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{apt.doctorName}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{apt.doctorSpecialization}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{apt.appointmentType}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={apt.status === 'CONFIRMED' ? 'info' : apt.status === 'COMPLETED' ? 'success' : 'danger'} size="sm">
                        {apt.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <AIRiskBadge risk={apt.risk} onClick={() => setSelectedRisk(apt.risk)} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI Explanation Modal */}
      {selectedRisk && (
        <AIRiskExplanationModal
          isOpen={!!selectedRisk}
          onClose={() => setSelectedRisk(null)}
          risk={selectedRisk}
          patientName={patient.name}
          isAdmin
        />
      )}
    </div>
  );
};
