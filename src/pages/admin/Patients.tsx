import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { callBackend } from '../../services/api';
import { Patient } from '../../types';
import { UserPlus, Search, Eye, Edit, UserX, UserCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/common/BackButton';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchPatients = () => {
    setLoading(true);
    callBackend({ action: 'GET_PATIENTS' }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setPatients(res.data);
        setFilteredPatients(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    let result = patients;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }
    setFilteredPatients(result);
  }, [searchQuery, statusFilter, patients]);

  const handleToggleStatus = async (patient: Patient) => {
    const actionName = patient.status === 'Active' ? 'DEACTIVATE_PATIENT' : 'ACTIVATE_PATIENT';
    const res = await callBackend({ action: actionName, data: { patientId: patient.id } });
    if (res.success) {
      showToast(res.message, 'success');
      fetchPatients();
    } else {
      showToast(res.message || 'Failed to update patient status', 'error');
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm(`Are you sure you want to remove patient ${patient.name}?`)) {
      const res = await callBackend({ action: 'DELETE_PATIENT', data: { patientId: patient.id } });
      if (res.success) {
        showToast('Patient account removed successfully.', 'success');
        fetchPatients();
      } else {
        showToast(res.message || 'Failed to remove patient.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Patient Directory"
        showSearch
        searchPlaceholder="Search patients by name, ID, or phone..."
        onSearch={setSearchQuery}
      />
      <BackButton variant="admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'ALL'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-teal-500 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'Active'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Active ({patients.filter(p => p.status === 'Active').length})
          </button>
          <button
            onClick={() => setStatusFilter('Inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'Inactive'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Inactive ({patients.filter(p => p.status === 'Inactive').length})
          </button>
        </div>

        <Button
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => navigate('/admin/patients/create')}
        >
          Create Patient Account
        </Button>
      </div>

      <Card>
        {loading ? (
          <Loading message="Loading patient database..." />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            title="No Patients Found"
            description="No patient accounts match your current search query or filter."
            actionLabel="Create Patient"
            onAction={() => navigate('/admin/patients/create')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-center">Attended Visits</th>
                  <th className="py-3 px-4 text-center">Not Attended (No-Show)</th>
                  <th className="py-3 px-4 text-center">AI Risk Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map(pat => {
                  const riskLevel = pat.noShowRate > 30 ? 'HIGH' : pat.noShowRate > 0 ? 'MEDIUM' : 'LOW';
                  return (
                    <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-700">{pat.id}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 leading-tight">{pat.name}</p>
                        <p className="text-xs text-slate-500">{pat.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">{pat.phone}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={pat.status === 'Active' ? 'success' : 'danger'} size="sm">
                          {pat.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          🟢 {pat.attendedAppointments || 0} Attended
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black border ${
                          (pat.noShowAppointments || 0) > 0
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          🔴 {pat.noShowAppointments || 0} Not Attended
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${
                            riskLevel === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : riskLevel === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}
                        >
                          {riskLevel} RISK ({pat.noShowRate}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/admin/patients/${pat.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(pat)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              pat.status === 'Active'
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={pat.status === 'Active' ? 'Deactivate Patient' : 'Activate Patient'}
                          >
                            {pat.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeletePatient(pat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Patient Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
