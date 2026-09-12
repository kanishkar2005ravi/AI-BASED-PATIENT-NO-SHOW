import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts

import { AdminLayout } from './components/layout/AdminLayout';
import { PatientLayout } from './components/layout/PatientLayout';

// Public Pages
import { Login } from './pages/Login';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Patients } from './pages/admin/Patients';
import { CreatePatient } from './pages/admin/CreatePatient';
import { PatientDetails } from './pages/admin/PatientDetails';
import { Doctors } from './pages/admin/Doctors';
import { CreateDoctor } from './pages/admin/CreateDoctor';
import { DoctorDetails } from './pages/admin/DoctorDetails';
import { DoctorAvailability } from './pages/admin/DoctorAvailability';
import { Appointments } from './pages/admin/Appointments';
import { AppointmentDetails } from './pages/admin/AppointmentDetails';
import { Waitlist as AdminWaitlist } from './pages/admin/Waitlist';
import { Analytics } from './pages/admin/Analytics';
import { Notifications as AdminNotifications } from './pages/admin/Notifications';
import { Reports } from './pages/admin/Reports';
import { AdminProfile } from './pages/admin/AdminProfile';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BookAppointment } from './pages/patient/BookAppointment';
import { MyAppointments } from './pages/patient/MyAppointments';
import { AppointmentDetails as PatientAppointmentDetails } from './pages/patient/AppointmentDetails';
import { RescheduleAppointment } from './pages/patient/RescheduleAppointment';
import { Waitlist as PatientWaitlist } from './pages/patient/Waitlist';
import { Notifications as PatientNotifications } from './pages/patient/Notifications';
import { PatientProfile } from './pages/patient/PatientProfile';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement; allowedRole: 'admin' | 'patient' }> = ({
  children,
  allowedRole
}) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'} replace />;
  }

  return children;
};

// Root Redirect Helper
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>

          <Routes>
            {/* Root & Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/create" element={<CreatePatient />} />
              <Route path="patients/:id" element={<PatientDetails />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="doctors/create" element={<CreateDoctor />} />
              <Route path="doctors/:id" element={<DoctorDetails />} />
              <Route path="doctors/:id/availability" element={<DoctorAvailability />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/:id" element={<AppointmentDetails />} />
              <Route path="waitlist" element={<AdminWaitlist />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* PATIENT ROUTES */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRole="patient">
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="book" element={<BookAppointment />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="appointments/:id" element={<PatientAppointmentDetails />} />
              <Route path="appointments/:id/reschedule" element={<RescheduleAppointment />} />
              <Route path="waitlist" element={<PatientWaitlist />} />
              <Route path="notifications" element={<PatientNotifications />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* 404 / Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  </LanguageProvider>
  );
};


export default App;
