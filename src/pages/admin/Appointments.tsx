import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { AIRiskBadge } from '../../components/ai/AIRiskBadge';
import { AIRiskExplanationModal } from '../../components/ai/AIRiskExplanationModal';
import { callBackend } from '../../services/api';
import { Appointment, AIRiskAssessment, AppointmentStatus } from '../../types';
import { Search, Eye, XCircle, Calendar, Filter, RefreshCw, ShieldCheck, UserCheck, UserX, LogOut, CheckCircle, Stethoscope, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<{ risk: AIRiskAssessment; patientName: string } | null>(null);

  const fetchAppointments = () => {
    setLoading(true);
    Promise.all([
      callBackend({ action: 'GET_APPOINTMENTS' }),
      callBackend({ action: 'GET_DOCTORS' })
    ]).then(([aptsRes, docsRes]) => {
      if (aptsRes.success && Array.isArray(aptsRes.data)) {
        setAppointments(aptsRes.data);
        setFilteredAppointments(aptsRes.data);
      }
      if (docsRes.success && Array.isArray(docsRes.data)) {
        setDoctors(docsRes.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let result = appointments;
    if (selectedDoctorId !== 'ALL') {
      result = result.filter(a => a.doctorId === selectedDoctorId || a.doctorName.toLowerCase().includes(doctors.find(d => d.id === selectedDoctorId)?.name?.toLowerCase() || ''));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.patientName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(a => a.status === statusFilter);
    }
    if (riskFilter !== 'ALL') {
      result = result.filter(a => a.risk?.level === riskFilter);
    }
    setFilteredAppointments(result);
  }, [searchQuery, statusFilter, riskFilter, selectedDoctorId, appointments, doctors]);

  // Doctor Specific / Filtered Appointments Risk Breakdown
  const doctorAppointments = selectedDoctorId === 'ALL'
    ? appointments
    : appointments.filter(a => a.doctorId === selectedDoctorId || a.doctorName.toLowerCase().includes(doctors.find(d => d.id === selectedDoctorId)?.name?.toLowerCase() || ''));

  const lowRiskAppointments = doctorAppointments.filter(a => !a.risk || a.risk.level === 'LOW');
  const medRiskAppointments = doctorAppointments.filter(a => a.risk?.level === 'MEDIUM');
  const highRiskAppointments = doctorAppointments.filter(a => a.risk?.level === 'HIGH');

  const handleUpdateStatus = async (aptId: string, newStatus: AppointmentStatus) => {
    const res = await callBackend({
      action: 'UPDATE_APPOINTMENT_STATUS',
      data: { appointmentId: aptId, status: newStatus }
    });
    if (res.success) {
      showToast(`Appointment ${aptId} status updated to ${newStatus}.`, 'success');
      fetchAppointments();
    } else {
      showToast(res.message || 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Admin - Hospital Appointments & Attendance Management"
        showSearch
        searchPlaceholder="Search by Patient, Doctor, or Appointment ID..."
        onSearch={setSearchQuery}
      />

      {/* Admin Topic Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-400/30 text-teal-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300">ADMIN CONTROL CENTER</h3>
            <p className="text-xs text-slate-300">Manage patient attendance: Check In, Check Out, Not Attended (No-Show), or Completed</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchAppointments}>
          Sync Data
        </Button>
      </div>

      {/* Doctor Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Select Physician to View Risk-Separated Schedule:</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {doctors.length} Doctors Registered
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedDoctorId('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDoctorId === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Doctors ({appointments.length})
          </button>

          {doctors.map(doc => {
            const docAptCount = appointments.filter(a => a.doctorId === doc.id || a.doctorName === doc.name).length;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedDoctorId === doc.id
                    ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{doc.name}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                  selectedDoctorId === doc.id ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-800'
                }`}>
                  {docAptCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🟢 🟡 🔴 3-Column Risk Breakdown Cards (Low, Medium, High Risk) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LOW RISK CARD */}
        <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-extrabold text-sm text-emerald-900 uppercase tracking-wide">Low Risk Patients</h4>
            </div>
            <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-black">
              {lowRiskAppointments.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {lowRiskAppointments.length === 0 ? (
              <p className="text-xs text-emerald-700 italic py-4 text-center">No low risk patients scheduled.</p>
            ) : (
              lowRiskAppointments.map(apt => (
                <div key={apt.id} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">{apt.id}</span>
                    <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {apt.appointmentTime}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{apt.patientName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">Dr: {apt.doctorName}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MEDIUM RISK CARD */}
        <div className="bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h4 className="font-extrabold text-sm text-amber-900 uppercase tracking-wide">Medium Risk Patients</h4>
            </div>
            <span className="bg-amber-600 text-white px-2.5 py-1 rounded-xl text-xs font-black">
              {medRiskAppointments.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {medRiskAppointments.length === 0 ? (
              <p className="text-xs text-amber-700 italic py-4 text-center">No medium risk patients scheduled.</p>
            ) : (
              medRiskAppointments.map(apt => (
                <div key={apt.id} className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">{apt.id}</span>
                    <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {apt.appointmentTime}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{apt.patientName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">Dr: {apt.doctorName}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HIGH RISK CARD */}
        <div className="bg-rose-50/50 border-2 border-rose-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
              <h4 className="font-extrabold text-sm text-rose-900 uppercase tracking-wide">High Risk Patients</h4>
            </div>
            <span className="bg-rose-600 text-white px-2.5 py-1 rounded-xl text-xs font-black">
              {highRiskAppointments.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {highRiskAppointments.length === 0 ? (
              <p className="text-xs text-rose-700 italic py-4 text-center">No high risk patients scheduled.</p>
            ) : (
              highRiskAppointments.map(apt => (
                <div key={apt.id} className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">{apt.id}</span>
                    <span className="text-xs font-extrabold text-rose-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {apt.appointmentTime}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{apt.patientName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">Dr: {apt.doctorName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase">
            <Filter className="w-4 h-4 text-teal-600" />
            <span>Filter Status:</span>
          </div>

          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'CONFIRMED', label: 'Confirmed' },
              { value: 'CHECKED_IN', label: 'Checked In' },
              { value: 'CHECKED_OUT', label: 'Checked Out' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'NO_SHOW', label: 'Not Attended (No-Show)' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'RESCHEDULED', label: 'Rescheduled' }
            ]}
            className="text-xs py-1.5"
          />

          <Select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All AI Risk Levels' },
              { value: 'HIGH', label: 'High Risk Only' },
              { value: 'MEDIUM', label: 'Medium Risk' },
              { value: 'LOW', label: 'Low Risk' }
            ]}
            className="text-xs py-1.5"
          />
        </div>
      </div>

      <Card>
        {loading ? (
          <Loading message="Loading hospital appointments..." />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No Appointments Found"
            description="No appointments match your active filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">APT ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">AI Risk (Admin View)</th>
                  <th className="py-3 px-4 text-right">Admin Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-700">{apt.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{apt.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{apt.doctorName}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      {apt.appointmentDate} at {apt.appointmentTime}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{apt.appointmentType}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={apt.status === 'CONFIRMED' ? 'info' : apt.status === 'CHECKED_IN' ? 'purple' : apt.status === 'CHECKED_OUT' || apt.status === 'COMPLETED' ? 'success' : 'danger'} size="sm">
                        {apt.status === 'NO_SHOW' ? 'NOT ATTENDED' : apt.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <AIRiskBadge
                        risk={apt.risk}
                        showProbability={true}
                        onClick={() => setSelectedRisk({ risk: apt.risk, patientName: apt.patientName })}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Status Updater Select for Admin */}
                        <select
                          value={apt.status}
                          onChange={e => handleUpdateStatus(apt.id, e.target.value as AppointmentStatus)}
                          className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="CHECKED_IN">Checked In</option>
                          <option value="CHECKED_OUT">Checked Out</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="NO_SHOW">Not Attended (No-Show)</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                        <button
                          onClick={() => navigate(`/admin/appointments/${apt.id}`)}
                          className="p-1 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI Explanation Modal for Admin */}
      {selectedRisk && (
        <AIRiskExplanationModal
          isOpen={!!selectedRisk}
          onClose={() => setSelectedRisk(null)}
          risk={selectedRisk.risk}
          patientName={selectedRisk.patientName}
          isAdmin
        />
      )}
    </div>
  );
};
