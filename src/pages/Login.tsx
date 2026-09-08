import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { HeartPulse, Lock, Mail, Sparkles, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { isDemoMode } from '../services/api';

export const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'admin') {
      setEmail('admin@example.com');
      setPassword('password');
    } else {
      setEmail('');
      setPassword('');
    }
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background Glow Deco */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-950 border border-teal-400/30">
            <HeartPulse className="w-8 h-8 animate-pulse text-white" />
          </div>
        </div>
        <h1 className="text-center text-3xl font-black tracking-tight text-white">AI CareSchedule</h1>
        <p className="mt-1 text-center text-sm font-medium text-teal-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-400" />
          Smart Appointment Management & No-Show Prediction
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-200/80">
          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select User Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  role === 'admin'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-700/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('patient')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  role === 'patient'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-700/30'
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
              label={role === 'admin' ? 'Admin Email Address' : 'Patient ID or Email Address'}
              type="text"
              placeholder={role === 'admin' ? 'admin@example.com' : 'e.g. PAT-001 or patient@example.com'}
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
