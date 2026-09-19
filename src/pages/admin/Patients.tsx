import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { callBackend, normalizeAppointment } from '../../services/api';
import { Patient, Appointment } from '../../types';
import { sortPatientsByNumericId } from '../../utils/helpers';
import { UserPlus, Search, Eye, Edit, UserX, UserCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/common/BackButton';
import { useLanguage } from '../../context/LanguageContext';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const isAttendedStatus = (status: string | undefined): boolean => {
    if (!status) return false;
    const s = status.toString().trim().toUpperCase();
    return s === 'COMPLETED' || s === 'ATTENDED' || s === 'CHECKED_IN' || s === 'CHECKED_OUT';
  };

  const isNoShowStatus = (status: string | undefined): boolean => {
    if (!status) return false;
    const s = status.toString().trim().toUpperCase();
    return (
      s === 'NO_SHOW' ||
      s === 'NO-SHOW' ||
      s === 'NOSHOW' ||
      s === 'NOT_ATTENDED' ||
      s === 'NOT ATTENDED' ||
      s === 'ABSENT' ||
      s === 'MISSED'
    );
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const [patsRes, aptsRes] = await Promise.all([
        callBackend({ action: 'GET_PATIENTS' }),
        callBackend({ action: 'GET_APPOINTMENTS', data: {} })
      ]);

      const patsList: Patient[] = (patsRes.success && Array.isArray(patsRes.data)) ? patsRes.data : [];

      // Safely unwrap appointment data from any nested SNS / n8n structure
      let aptsList: Appointment[] = [];
      const rawAptsRes: any = aptsRes;
      if (aptsRes.success && Array.isArray(aptsRes.data)) {
        aptsList = aptsRes.data;
      } else if (Array.isArray(rawAptsRes?.data?.items)) {
        aptsList = rawAptsRes.data.items.map((i: any) => normalizeAppointment(i.json || i));
      } else if (Array.isArray(rawAptsRes?.items)) {
        aptsList = rawAptsRes.items.map((i: any) => normalizeAppointment(i.json || i));
      } else if (Array.isArray(rawAptsRes)) {
        aptsList = rawAptsRes.map(normalizeAppointment);
      }

      const enrichedPatients = patsList.map(pat => {
        // Find lifetime appointments matching this patient
        const patientApts = aptsList.filter(a => {
          if (!a) return false;
          // Exclude waitlist items
          if ((a as any).position !== undefined || (a as any).requestedTimeSlot !== undefined || (a.status as any) === 'WAITING' || (a.status as any) === 'NOTIFIED') {
            return false;
          }
          const aPid = (a.patientId || (a as any).patient_id || '').toString().trim().toLowerCase();
          const pId = (pat.id || '').toString().trim().toLowerCase();
          if (aPid && pId && aPid === pId) return true;
          const aEmail = (a.patientEmail || (a as any).patient_email || (a as any).email || '').toString().trim().toLowerCase();
          const pEmail = (pat.email || '').toString().trim().toLowerCase();
          return Boolean(aEmail && pEmail && aEmail === pEmail);
        });

        const aptAttendedCount = patientApts.filter(a => isAttendedStatus(a.status)).length;
        const aptNoShowCount = patientApts.filter(a => isNoShowStatus(a.status)).length;

        // Preserve existing attended counts if backend patient record already had them
        const finalAttended = aptAttendedCount > 0 ? aptAttendedCount : (pat.attendedAppointments || 0);
        // Calculate real no-show count from actual appointments or backend record
        const finalNoShow = aptNoShowCount > 0 ? aptNoShowCount : (pat.noShowAppointments || 0);

        const totalVisits = (pat.totalAppointments && pat.totalAppointments >= (finalAttended + finalNoShow))
          ? pat.totalAppointments
          : (patientApts.length > 0 ? patientApts.length : (finalAttended + finalNoShow));

        const calculatedRate = totalVisits > 0 ? Math.round((finalNoShow / totalVisits) * 100) : 0;
        const finalNoShowRate = (finalNoShow > 0 && calculatedRate > 0)
          ? calculatedRate
          : (pat.noShowRate || 0);

        return {
          ...pat,
          attendedAppointments: finalAttended,
          noShowAppointments: finalNoShow,
          totalAppointments: totalVisits,
          noShowRate: finalNoShowRate
        };
      });

      const sortedPatients = sortPatientsByNumericId(enrichedPatients);
      setPatients(sortedPatients);
      setFilteredPatients(sortedPatients);
    } catch (e) {
      console.error('[Patients] Error loading patients and appointments:', e);
    } finally {
      setLoading(false);
    }
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
    setFilteredPatients(result);
  }, [searchQuery, patients]);

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
        title={t('patients.title')}
        showSearch
        searchPlaceholder={t('patients.search_placeholder')}
        onSearch={setSearchQuery}
      />
      <BackButton variant="admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-rose-500 to-teal-500 text-white shadow-sm">
            {t('patients.total')} ({patients.length})
          </span>
        </div>

        <Button
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => navigate('/admin/patients/create')}
        >
          {t('patients.create')}
        </Button>
      </div>

      <Card>
        {loading ? (
          <Loading message="Loading patient database..." />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            title={t('patients.no_found')}
            description="No patient accounts match your current search query."
            actionLabel={t('patients.create')}
            onAction={() => navigate('/admin/patients/create')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">{t('patients.col_id')}</th>
                  <th className="py-3 px-4">{t('patients.col_name')}</th>
                  <th className="py-3 px-4">{t('patients.col_phone')}</th>
                  <th className="py-3 px-4 text-center">{t('patients.col_attended')}</th>
                  <th className="py-3 px-4 text-center">{t('patients.col_missed')}</th>
                  <th className="py-3 px-4 text-center">{t('patients.col_risk')}</th>
                  <th className="py-3 px-4 text-right">{t('patients.col_actions')}</th>
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
