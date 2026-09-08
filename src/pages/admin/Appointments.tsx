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
import { Search, Eye, XCircle, Calendar, Filter, RefreshCw, ShieldCheck, UserCheck, UserX, LogOut, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
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
    callBackend({ action: 'GET_APPOINTMENTS' }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
        setFilteredAppointments(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let result = appointments;
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
  }, [searchQuery, statusFilter, riskFilter, appointments]);

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
