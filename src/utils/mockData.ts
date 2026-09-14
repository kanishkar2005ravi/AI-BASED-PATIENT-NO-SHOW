import { User, Patient, Doctor, Appointment, DoctorAvailability, WaitlistItem, NotificationItem, AnalyticsData, ModelPerformance } from '../types';

// ✅ CLEAN STATE — No demo data. Admin only.
// All patients, doctors, appointments will be created fresh via the app.

export const INITIAL_USERS: User[] = [
  {
    "id": "ADMIN-001",
    "name": "Administrator",
    "email": "admin@example.com",
    "role": "admin",
    "phone": "+919876543210"
  }
];

export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_DOCTORS: Doctor[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_AVAILABILITY: DoctorAvailability[] = [];


export const INITIAL_WAITLIST: WaitlistItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ANALYTICS: AnalyticsData = {
  totalPatients: 0,
  totalDoctors: 0,
  totalAppointments: 0,
  todayAppointments: 0,
  attendanceRate: 0,
  noShowRate: 0,
  cancellationRate: 0,
  waitlistRecoveryRate: 0,
  highRiskCount: 0,
  mediumRiskCount: 0,
  lowRiskCount: 0,
  doctorUtilization: 0,
  appointmentTrends: [],
  noShowTrends: [],
  doctorUtilizationData: [],
  waitlistRecoveryData: []
};


export const INITIAL_MODEL_PERFORMANCE: ModelPerformance = {
  accuracy: 0,
  precision: 0,
  recall: 0,
  f1Score: 0,
  rocAuc: 0,
  totalPredictions: 0,
  correctPredictions: 0,
  highRiskPredictions: 0,
  mediumRiskPredictions: 0,
  lowRiskPredictions: 0,
  confusionMatrix: {
    truePositive: 0,
    falsePositive: 0,
    falseNegative: 0,
    trueNegative: 0
  }
};
