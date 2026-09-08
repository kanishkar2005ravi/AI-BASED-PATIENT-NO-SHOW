export type UserRole = 'admin' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Patient {
  id: string; // e.g. PAT-001
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  status: 'Active' | 'Inactive';
  totalAppointments: number;
  attendedAppointments: number;
  noShowAppointments: number;
  cancelledAppointments: number;
  rescheduledAppointments: number;
  noShowRate: number; // percentage (0-100)
  createdAt: string;
}

export interface Doctor {
  id: string; // e.g. DOC-001
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  experience: number; // years
  status: 'Active' | 'Inactive';
  avatar?: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'Available' | 'Booked' | 'Blocked' | 'Unavailable';
}

export interface DoctorAvailability {
  doctorId: string;
  weeklySchedule: TimeSlot[];
}

export type AppointmentStatus =
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIRiskFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface AIRiskAssessment {
  level: RiskLevel;
  probability: number; // 0.0 to 1.0
  factors: AIRiskFactor[];
  recapNotes?: string;
}

export interface Appointment {
  id: string; // e.g. APT-1001
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  appointmentType: 'Routine Checkup' | 'Follow-up' | 'Consultation' | 'Emergency' | 'Specialist Assessment';
  status: AppointmentStatus;
  risk: AIRiskAssessment;
  confirmedByPatient: boolean;
  notes?: string;
  createdAt: string;
}

export interface WaitlistItem {
  id: string; // e.g. WTL-501
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  requestedDate: string;
  requestedTimeSlot?: string;
  position: number;
  status: 'WAITING' | 'NOTIFIED' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  notifiedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // patientId or ADMIN
  type: 'Appointment' | 'Reminder' | 'Reschedule' | 'Cancellation' | 'Waitlist' | 'AI Risk' | 'System';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AnalyticsData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  attendanceRate: number; // %
  noShowRate: number; // %
  cancellationRate: number; // %
  waitlistRecoveryRate: number; // %
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  doctorUtilization: number; // %
  appointmentTrends: { date: string; attended: number; noShow: number; cancelled: number }[];
  noShowTrends: { month: string; rate: number }[];
  doctorUtilizationData: { doctorName: string; utilization: number; totalSlots: number; bookedSlots: number }[];
  waitlistRecoveryData: { month: string; cancelledSlots: number; recoveredSlots: number }[];
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  totalPredictions: number;
  highRiskPredictions: number;
  mediumRiskPredictions: number;
  lowRiskPredictions: number;
  correctPredictions: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
  patient?: Patient;
  doctor?: Doctor;
  appointment?: Appointment;
  risk?: AIRiskAssessment;
  error?: string;
}
