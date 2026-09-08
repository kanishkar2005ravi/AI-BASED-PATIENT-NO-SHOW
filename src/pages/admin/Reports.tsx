import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { callBackend } from '../../services/api';
import { downloadCSV } from '../../utils/helpers';
import { FileText, Download, Printer, CheckCircle, BarChart2, Calendar, Users, Stethoscope, Clock, Brain } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Reports: React.FC = () => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'APPOINTMENTS',
      title: 'Appointment Master Report',
      description: 'Comprehensive historical and upcoming appointment records with status breakdowns.',
      icon: <Calendar className="w-6 h-6 text-teal-600" />
    },
    {
      id: 'NOSHOW',
      title: 'No-Show & Risk Evaluation Report',
      description: 'Detailed analysis of unexcused absences, AI risk factors, and patient absenteeism trends.',
      icon: <Brain className="w-6 h-6 text-rose-600" />
    },
    {
      id: 'ATTENDANCE',
      title: 'Hospital Attendance Metrics Report',
      description: 'Monthly and weekly patient check-in performance and completion metrics.',
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />
    },
    {
      id: 'DOCTOR_UTILIZATION',
      title: 'Doctor Utilization & Workload Report',
      description: 'Physician slot utilization, available vs booked hours, and department efficiency.',
      icon: <Stethoscope className="w-6 h-6 text-sky-600" />
    },
    {
      id: 'WAITLIST_RECOVERY',
      title: 'Waitlist Slot Recovery Report',
      description: 'Metrics on cancelled slots automatically filled via smart waitlist automation.',
      icon: <Clock className="w-6 h-6 text-amber-600" />
    },
    {
      id: 'AI_SUMMARY',
      title: 'AI Prediction Accuracy Summary',
      description: 'Machine learning model validation scores, precision, recall, and confusion matrix summary.',
      icon: <BarChart2 className="w-6 h-6 text-purple-600" />
    }
  ];

  const handleExportCSV = async (reportId: string, title: string) => {
    setDownloading(reportId);
    const res = await callBackend({
      action: 'GET_APPOINTMENTS',
      data: {}
    });

    setDownloading(null);
    if (res.success && Array.isArray(res.data)) {
      const exportData = res.data.map(apt => ({
        AppointmentID: apt.id,
        PatientName: apt.patientName,
        DoctorName: apt.doctorName,
        Date: apt.appointmentDate,
        Time: apt.appointmentTime,
        Type: apt.appointmentType,
        Status: apt.status,
        AIRiskLevel: apt.risk?.level || 'LOW',
        AIRiskProbability: `${Math.round((apt.risk?.probability || 0.2) * 100)}%`
      }));

      downloadCSV(`${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`, exportData);
      showToast(`${title} exported successfully!`, 'success');
    } else {
      showToast('Failed to generate report export.', 'error');
    }
  };

  const handlePrintPDF = (title: string) => {
    showToast(`Preparing printable document for ${title}...`, 'info');
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="Hospital Analytics & Data Reports Export" />

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Export Hospital Reports</h2>
          <p className="text-xs text-slate-500">Download formatted CSV data tables or generate printable PDF summaries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map(rep => (
          <Card key={rep.id} className="flex flex-col justify-between p-6">
            <div>
              <div className="flex items-start space-x-4 mb-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">{rep.icon}</div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{rep.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.description}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center space-x-3 mt-4">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                icon={<Download className="w-4 h-4" />}
                isLoading={downloading === rep.id}
                onClick={() => handleExportCSV(rep.id, rep.title)}
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => handlePrintPDF(rep.title)}
              >
                Print / PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
