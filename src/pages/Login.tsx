import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Lock, Mail, Sparkles, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { CarePilotLogo } from '../components/common/CarePilotLogo';
import { isDemoMode } from '../services/api';

export const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = email.trim();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setError('Please enter both Email / Patient ID and password.');
      return;
    }

    // Direct Failsafe Guard for Admin Login
    if (role === 'admin') {
      const allowedAdminEmails = ['admin@example.com', 'admin@careschedule.com', 'admin', 'admin-001'];
      const allowedAdminPasses = ['admin123', 'admin', 'password', 'admin2026', 'Admin123!'];

      if (!allowedAdminEmails.includes(cleanInput.toLowerCase()) || !allowedAdminPasses.includes(cleanPass)) {
        setError('Invalid Admin email or password. Access denied.');
        return;
      }
    }

    const res = await login(role, cleanInput, cleanPass);
    if (res.success) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } else {
      setError(res.message || 'Invalid credentials. Please check your Patient ID/Email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background Multi-Color Glow (SNS Design Thinking Framework Palette) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header with SNS Design Thinking CFC Logo */}
        <div className="mb-2">
          <CarePilotLogo size="lg" textLight={true} />
        </div>
        <p className="mt-2 text-center text-xs font-semibold text-teal-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Design Thinking Framework Patient No-Show Prediction
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-200/80">
          {/* Hospital Header Badge */}
          <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-purple-500/10 border border-slate-200/80 text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              SNS Medical College & Hospital
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Smart Patient & Clinic Scheduling Portal</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Select User Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 to-teal-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('patient')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                  role === 'patient'
                    ? 'bg-gradient-to-r from-teal-600 to-purple-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>PATIENT</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label={role === 'admin' ? 'Enter Admin Email Address' : 'Patient ID or Email Address'}
              type="text"
              placeholder={role === 'admin' ? 'Enter Email' : 'Enter Patient ID or Email'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-lg shadow-teal-600/30"
                isLoading={loading}
              >
                Login as {role === 'admin' ? 'Admin' : 'Patient'}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="mt-4 text-center text-xs text-slate-400">
          AI CareSchedule &copy; 2026. Hospital-Grade Appointment Optimization.
        </p>
      </div>
    </div>
  );
};
