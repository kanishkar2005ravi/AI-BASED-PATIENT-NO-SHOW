import { User, Patient, Doctor, Appointment, DoctorAvailability, WaitlistItem, NotificationItem, AnalyticsData, ModelPerformance } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'ADMIN-001',
    name: 'Administrator',
    email: 'admin@example.com',
    role: 'admin',
    phone: '+1 (555) 019-2831'
  },
  {
    id: 'PAT-001',
    name: 'Kiran Raj',
    email: 'patient@example.com',
    role: 'patient',
    phone: '9876543210'
  },
  {
    id: 'PAT-002',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    role: 'patient',
    phone: '9876543211'
  },
  {
    id: 'PAT-003',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'patient',
    phone: '9876543212'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAT-001',
    name: 'Kiran Raj',
    email: 'patient@example.com',
    phone: '9876543210',
    dateOfBirth: '2006-09-06',
    gender: 'Male',
    address: 'Coimbatore, Tamil Nadu',
    status: 'Active',
    totalAppointments: 6,
    attendedAppointments: 4,
    noShowAppointments: 1,
    cancelledAppointments: 1,
    rescheduledAppointments: 1,
    noShowRate: 16.7,
    createdAt: '2025-01-15'
  },
  {
    id: 'PAT-002',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    phone: '9876543211',
    dateOfBirth: '1995-04-12',
    gender: 'Male',
    address: 'Chennai, Tamil Nadu',
    status: 'Active',
    totalAppointments: 4,
    attendedAppointments: 1,
    noShowAppointments: 2,
    cancelledAppointments: 1,
    rescheduledAppointments: 0,
    noShowRate: 50.0,
    createdAt: '2025-02-01'
  },
  {
    id: 'PAT-003',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543212',
    dateOfBirth: '1998-11-23',
    gender: 'Female',
    address: 'Bangalore, Karnataka',
    status: 'Active',
    totalAppointments: 8,
    attendedAppointments: 7,
    noShowAppointments: 0,
    cancelledAppointments: 1,
    rescheduledAppointments: 2,
    noShowRate: 0.0,
    createdAt: '2024-11-10'
  },
  {
    id: 'PAT-004',
    name: 'Ananya Roy',
    email: 'ananya@example.com',
    phone: '9876543213',
    dateOfBirth: '1992-07-30',
    gender: 'Female',
    address: 'Kochi, Kerala',
    status: 'Active',
    totalAppointments: 3,
    attendedAppointments: 3,
    noShowAppointments: 0,
    cancelledAppointments: 0,
    rescheduledAppointments: 0,
    noShowRate: 0.0,
    createdAt: '2025-03-01'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'DOC-001',
    name: 'Dr. Arun Kumar',
    specialization: 'Cardiology',
    department: 'Cardiology Department',
    email: 'arun.kumar@aicareschedule.com',
    phone: '+91 98401 22334',
    experience: 14,
    status: 'Active'
  },
  {
    id: 'DOC-002',
    name: 'Dr. Meena Sharma',
    specialization: 'Dermatology',
    department: 'Dermatology Department',
    email: 'meena.sharma@aicareschedule.com',
    phone: '+91 98401 22335',
    experience: 9,
    status: 'Active'
  },
  {
    id: 'DOC-003',
    name: 'Dr. Rajesh Kumar',
    specialization: 'General Medicine',
    department: 'Internal Medicine',
    email: 'rajesh.kumar@aicareschedule.com',
    phone: '+91 98401 22336',
    experience: 18,
    status: 'Active'
  },
  {
    id: 'DOC-004',
    name: 'Dr. Sneha Patel',
    specialization: 'Neurology',
    department: 'Neurology Department',
    email: 'sneha.patel@aicareschedule.com',
    phone: '+91 98401 22337',
    experience: 11,
    status: 'Active'
  }
];

export const INITIAL_AVAILABILITY: Record<string, DoctorAvailability> = {
  'DOC-001': {
    doctorId: 'DOC-001',
    weeklySchedule: [
      { id: 'S1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '13:00', status: 'Available' },
      { id: 'S2', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '13:00', status: 'Available' },
      { id: 'S3', dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '18:00', status: 'Available' },
      { id: 'S4', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '13:00', status: 'Available' },
      { id: 'S5', dayOfWeek: 'Friday', startTime: '09:00', endTime: '16:00', status: 'Available' }
    ]
  },
  'DOC-002': {
    doctorId: 'DOC-002',
    weeklySchedule: [
      { id: 'S6', dayOfWeek: 'Monday', startTime: '10:00', endTime: '14:00', status: 'Available' },
      { id: 'S7', dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '15:00', status: 'Available' },
      { id: 'S8', dayOfWeek: 'Friday', startTime: '11:00', endTime: '17:00', status: 'Available' }
    ]
  },
  'DOC-003': {
    doctorId: 'DOC-003',
    weeklySchedule: [
      { id: 'S9', dayOfWeek: 'Monday', startTime: '08:30', endTime: '12:30', status: 'Available' },
      { id: 'S10', dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '18:00', status: 'Available' },
      { id: 'S11', dayOfWeek: 'Wednesday', startTime: '08:30', endTime: '12:30', status: 'Available' },
      { id: 'S12', dayOfWeek: 'Thursday', startTime: '14:00', endTime: '18:00', status: 'Available' },
      { id: 'S13', dayOfWeek: 'Friday', startTime: '08:30', endTime: '12:30', status: 'Available' }
    ]
  },
  'DOC-004': {
    doctorId: 'DOC-004',
    weeklySchedule: [
      { id: 'S14', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '14:00', status: 'Available' },
      { id: 'S15', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '14:00', status: 'Available' }
    ]
  }
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-1001',
    patientId: 'PAT-001',
    patientName: 'Kiran Raj',
    patientEmail: 'patient@example.com',
    patientPhone: '9876543210',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Arun Kumar',
    doctorSpecialization: 'Cardiology',
    appointmentDate: '2026-09-08',
    appointmentTime: '11:00',
    appointmentType: 'Follow-up',
    status: 'CONFIRMED',
    risk: {
      level: 'HIGH',
      probability: 0.76,
      factors: [
        { factor: 'Prior No-Show History', impact: 'negative', description: 'Patient missed 1 prior appointment without notice.' },
        { factor: 'Long Lead Time (16 days)', impact: 'negative', description: 'Booked 16 days in advance.' },
        { factor: 'Pending Phone Confirmation', impact: 'negative', description: 'SMS reminder sent but unconfirmed.' }
      ],
      recapNotes: 'High risk due to past unexcused absence and 16-day lead time.'
    },
    confirmedByPatient: false,
    notes: 'Patient requested cardiac evaluation after routine stress check.',
    createdAt: '2026-08-23'
  },
  {
    id: 'APT-1002',
    patientId: 'PAT-002',
    patientName: 'Rahul Kumar',
    patientEmail: 'rahul@example.com',
    patientPhone: '9876543211',
    doctorId: 'DOC-003',
    doctorName: 'Dr. Rajesh Kumar',
    doctorSpecialization: 'General Medicine',
    appointmentDate: '2026-09-08',
    appointmentTime: '14:30',
    appointmentType: 'Routine Checkup',
    status: 'CONFIRMED',
    risk: {
      level: 'HIGH',
      probability: 0.82,
      factors: [
        { factor: 'High Prior No-Show Rate (50%)', impact: 'negative', description: 'Patient missed 2 out of 4 appointments.' },
        { factor: 'Off-Peak Time Slot', impact: 'negative', description: 'Late afternoon slot.' }
      ]
    },
    confirmedByPatient: false,
    notes: 'Annual health screening.',
    createdAt: '2026-08-29'
  },
  {
    id: 'APT-1003',
    patientId: 'PAT-003',
    patientName: 'Priya Sharma',
    patientEmail: 'priya@example.com',
    patientPhone: '9876543212',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Meena Sharma',
    doctorSpecialization: 'Dermatology',
    appointmentDate: '2026-09-09',
    appointmentTime: '10:30',
    appointmentType: 'Consultation',
    status: 'CONFIRMED',
    risk: {
      level: 'LOW',
      probability: 0.14,
      factors: [
        { factor: 'Flawless History', impact: 'positive', description: '100% attendance rate in past 7 visits.' },
        { factor: 'Confirmed by Patient', impact: 'positive', description: 'SMS confirmation received.' }
      ]
    },
    confirmedByPatient: true,
    notes: 'Skin rash follow-up.',
    createdAt: '2026-09-02'
  },
  {
    id: 'APT-1004',
    patientId: 'PAT-004',
    patientName: 'Ananya Roy',
    patientEmail: 'ananya@example.com',
    patientPhone: '9876543213',
    doctorId: 'DOC-004',
    doctorName: 'Dr. Sneha Patel',
    doctorSpecialization: 'Neurology',
    appointmentDate: '2026-09-10',
    appointmentTime: '09:30',
    appointmentType: 'Specialist Assessment',
    status: 'CONFIRMED',
    risk: {
      level: 'MEDIUM',
      probability: 0.42,
      factors: [
        { factor: 'First Time Specialist Visit', impact: 'neutral', description: 'New specialist referral.' },
        { factor: 'Short Lead Time', impact: 'positive', description: 'Booked within 3 days.' }
      ]
    },
    confirmedByPatient: true,
    createdAt: '2026-09-07'
  },
  {
    id: 'APT-1005',
    patientId: 'PAT-001',
    patientName: 'Kiran Raj',
    patientEmail: 'patient@example.com',
    patientPhone: '9876543210',
    doctorId: 'DOC-003',
    doctorName: 'Dr. Rajesh Kumar',
    doctorSpecialization: 'General Medicine',
    appointmentDate: '2026-08-20',
    appointmentTime: '10:00',
    appointmentType: 'Routine Checkup',
    status: 'COMPLETED',
    risk: {
      level: 'LOW',
      probability: 0.18,
      factors: []
    },
    confirmedByPatient: true,
    createdAt: '2026-08-15'
  },
  {
    id: 'APT-1006',
    patientId: 'PAT-001',
    patientName: 'Kiran Raj',
    patientEmail: 'patient@example.com',
    patientPhone: '9876543210',
    doctorId: 'DOC-002',
    doctorName: 'Dr. Meena Sharma',
    doctorSpecialization: 'Dermatology',
    appointmentDate: '2026-07-12',
    appointmentTime: '11:30',
    appointmentType: 'Consultation',
    status: 'NO_SHOW',
    risk: {
      level: 'HIGH',
      probability: 0.78,
      factors: [
        { factor: 'Unconfirmed Reminder', impact: 'negative', description: 'Did not respond to confirmation SMS.' }
      ]
    },
    confirmedByPatient: false,
    createdAt: '2026-07-01'
  }
];

export const INITIAL_WAITLIST: WaitlistItem[] = [
  {
    id: 'WTL-501',
    patientId: 'PAT-003',
    patientName: 'Priya Sharma',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Arun Kumar',
    requestedDate: '2026-09-08',
    requestedTimeSlot: '11:00 AM',
    position: 1,
    status: 'WAITING',
    createdAt: '2026-09-05'
  },
  {
    id: 'WTL-502',
    patientId: 'PAT-004',
    patientName: 'Ananya Roy',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Arun Kumar',
    requestedDate: '2026-09-08',
    requestedTimeSlot: '11:00 AM',
    position: 2,
    status: 'WAITING',
    createdAt: '2026-09-06'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // PATIENT NOTIFICATIONS (PAT-001)
  {
    id: 'NOT-P1',
    userId: 'PAT-001',
    type: 'Appointment',
    title: 'Booking Confirmed',
    message: 'Your appointment with Dr. Arun Kumar is confirmed for 2026-09-10 at 11:00 AM.',
    timestamp: '2026-09-08T08:00:00Z',
    read: false
  },
  {
    id: 'NOT-P2',
    userId: 'PAT-001',
    type: 'Reminder',
    title: 'Upcoming Appointment Reminder',
    message: 'Reminder: You have an upcoming appointment with Dr. Arun Kumar tomorrow at 11:00 AM. Please arrive 10 mins early.',
    timestamp: '2026-09-07T09:00:00Z',
    read: false
  },
  {
    id: 'NOT-P3',
    userId: 'PAT-001',
    type: 'Waitlist',
    title: 'Waitlist Booking Added',
    message: 'You have joined the waitlist for Dr. Arun Kumar (Position #1). We will notify you if a slot opens up.',
    timestamp: '2026-09-06T10:15:00Z',
    read: true
  },
  {
    id: 'NOT-P4',
    userId: 'PAT-001',
    type: 'Waitlist',
    title: 'Waitlist Slot Available to Confirm',
    message: 'A slot freed up with Dr. Arun Kumar on 2026-09-11 at 02:00 PM! Click to confirm your booking.',
    timestamp: '2026-09-08T07:30:00Z',
    read: false
  },

  // ADMIN SYSTEM ALERTS (ADMIN)
  {
    id: 'NOT-A1',
    userId: 'ADMIN',
    type: 'AI Risk',
    title: 'High No-Show Risk Patient Flagged',
    message: 'High Risk Alert: Patient Rahul Kumar (APT-1002) has a predicted 78% no-show risk. Priority automated reminder dispatched.',
    timestamp: '2026-09-08T08:30:00Z',
    read: false
  },
  {
    id: 'NOT-A2',
    userId: 'ADMIN',
    type: 'Appointment',
    title: 'Patient Appointment Cancelled',
    message: 'Cancellation Alert: Patient Kiran Raj cancelled appointment APT-1001 with Dr. Arun Kumar. Waitlist auto-recovery triggered.',
    timestamp: '2026-09-08T07:45:00Z',
    read: false
  },
  {
    id: 'NOT-A3',
    userId: 'ADMIN',
    type: 'Appointment',
    title: 'New Patient Booking Registered',
    message: 'New Appointment: Patient Priya Sharma booked a Cardiology consultation with Dr. Arun Kumar for 2026-09-12 at 10:00 AM.',
    timestamp: '2026-09-08T06:15:00Z',
    read: true
  },
  {
    id: 'NOT-A4',
    userId: 'ADMIN',
    type: 'Waitlist',
    title: 'Waitlist Slot Claimed',
    message: 'Waitlist Recovery Success: Patient Ananya Roy confirmed a recovered slot with Dr. Sneha Patel.',
    timestamp: '2026-09-07T14:20:00Z',
    read: true
  }
];

export const INITIAL_ANALYTICS: AnalyticsData = {
  totalPatients: 428,
  totalDoctors: 16,
  totalAppointments: 1240,
  todayAppointments: 18,
  attendanceRate: 84.5,
  noShowRate: 9.2, // low is good
  cancellationRate: 6.3,
  waitlistRecoveryRate: 78.4,
  highRiskCount: 14,
  mediumRiskCount: 32,
  lowRiskCount: 94,
  doctorUtilization: 86.2,
  appointmentTrends: [
    { date: 'Sep 01', attended: 32, noShow: 3, cancelled: 2 },
    { date: 'Sep 02', attended: 28, noShow: 4, cancelled: 1 },
    { date: 'Sep 03', attended: 35, noShow: 2, cancelled: 3 },
    { date: 'Sep 04', attended: 40, noShow: 3, cancelled: 2 },
    { date: 'Sep 05', attended: 38, noShow: 5, cancelled: 1 },
    { date: 'Sep 06', attended: 22, noShow: 1, cancelled: 2 },
    { date: 'Sep 07', attended: 15, noShow: 2, cancelled: 1 }
  ],
  noShowTrends: [
    { month: 'Apr', rate: 14.2 },
    { month: 'May', rate: 12.8 },
    { month: 'Jun', rate: 11.5 },
    { month: 'Jul', rate: 10.1 },
    { month: 'Aug', rate: 9.6 },
    { month: 'Sep', rate: 9.2 }
  ],
  doctorUtilizationData: [
    { doctorName: 'Dr. Arun Kumar', utilization: 92, totalSlots: 25, bookedSlots: 23 },
    { doctorName: 'Dr. Meena Sharma', utilization: 84, totalSlots: 20, bookedSlots: 17 },
    { doctorName: 'Dr. Rajesh Kumar', utilization: 88, totalSlots: 30, bookedSlots: 26 },
    { doctorName: 'Dr. Sneha Patel', utilization: 75, totalSlots: 16, bookedSlots: 12 }
  ],
  waitlistRecoveryData: [
    { month: 'May', cancelledSlots: 24, recoveredSlots: 18 },
    { month: 'Jun', cancelledSlots: 30, recoveredSlots: 24 },
    { month: 'Jul', cancelledSlots: 28, recoveredSlots: 22 },
    { month: 'Aug', cancelledSlots: 35, recoveredSlots: 29 },
    { month: 'Sep', cancelledSlots: 19, recoveredSlots: 16 }
  ]
};

export const INITIAL_MODEL_PERFORMANCE: ModelPerformance = {
  accuracy: 0.924,
  precision: 0.891,
  recall: 0.885,
  f1Score: 0.888,
  rocAuc: 0.942,
  totalPredictions: 1420,
  highRiskPredictions: 182,
  mediumRiskPredictions: 388,
  lowRiskPredictions: 850,
  correctPredictions: 1312,
  confusionMatrix: {
    truePositive: 161,
    falsePositive: 21,
    trueNegative: 1151,
    falseNegative: 87
  }
};
