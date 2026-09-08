import { AIRiskAssessment, RiskLevel, AIRiskFactor } from '../types';

export function calculateAIRisk(
  patientHistory: { noShowCount: number; totalCount: number; cancellationCount: number },
  appointmentDate: string,
  appointmentTime: string,
  appointmentType: string,
  confirmedByPatient: boolean
): AIRiskAssessment {
  let score = 0.20; // base probability 20%
  const factors: AIRiskFactor[] = [];

  // 1. Patient History Factor
  const pastNoShowRate = patientHistory.totalCount > 0 
    ? patientHistory.noShowCount / patientHistory.totalCount 
    : 0;

  if (patientHistory.noShowCount >= 2 || pastNoShowRate > 0.3) {
    score += 0.35;
    factors.push({
      factor: 'Prior No-Show History',
      impact: 'negative',
      description: `Patient has ${patientHistory.noShowCount} previous unexcused no-shows.`
    });
  } else if (patientHistory.noShowCount === 1) {
    score += 0.15;
    factors.push({
      factor: 'Occasional Missed Appointment',
      impact: 'negative',
      description: 'Patient missed 1 prior appointment in the system.'
    });
  } else if (patientHistory.totalCount > 2) {
    score -= 0.10;
    factors.push({
      factor: 'Consistent Attendance',
      impact: 'positive',
      description: 'Excellent record of attending scheduled visits.'
    });
  }

  // 2. Booking Lead Time Factor
  const today = new Date();
  const aptDate = new Date(appointmentDate);
  const diffTime = aptDate.getTime() - today.getTime();
  const leadDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (leadDays > 14) {
    score += 0.20;
    factors.push({
      factor: 'Long Lead Time (> 14 days)',
      impact: 'negative',
      description: `Booked ${leadDays} days in advance, higher chance of scheduling conflicts.`
    });
  } else if (leadDays <= 2) {
    score -= 0.08;
    factors.push({
      factor: 'Immediate Schedule (Short Lead Time)',
      impact: 'positive',
      description: 'Booked within 48 hours, high immediate urgency.'
    });
  }

  // 3. Time of Day Factor
  const hour = parseInt(appointmentTime.split(':')[0], 10);
  if (hour < 9 || hour >= 16) {
    score += 0.10;
    factors.push({
      factor: 'Off-Peak Time Slot',
      impact: 'negative',
      description: 'Early morning or late afternoon slots experience higher absenteeism.'
    });
  } else {
    score -= 0.05;
    factors.push({
      factor: 'Optimal Mid-day Slot',
      impact: 'positive',
      description: 'Mid-morning or early afternoon timing.'
    });
  }

  // 4. Confirmation Status Factor
  if (!confirmedByPatient) {
    score += 0.18;
    factors.push({
      factor: 'Pending Patient Confirmation',
      impact: 'negative',
      description: 'Patient has not yet acknowledged the automated SMS reminder.'
    });
  } else {
    score -= 0.15;
    factors.push({
      factor: 'Confirmed by Patient',
      impact: 'positive',
      description: 'Patient explicitly confirmed attendance.'
    });
  }

  // Clamp probability between 0.05 and 0.95
  const probability = Math.max(0.05, Math.min(0.95, parseFloat(score.toFixed(2))));

  let level: RiskLevel = 'LOW';
  if (probability >= 0.65) {
    level = 'HIGH';
  } else if (probability >= 0.35) {
    level = 'MEDIUM';
  }

  return {
    level,
    probability,
    factors,
    recapNotes: `AI calculated a ${Math.round(probability * 100)}% risk of no-show based on historical patterns, lead time, and confirmation status.`
  };
}
