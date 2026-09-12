import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Lock, Mail, ShieldCheck, UserCheck, AlertCircle, Activity } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { CarePilotLogo } from '../components/common/CarePilotLogo';

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
      {/* Dynamic Animated Circle Line Orbits (Patient Dashboard Aesthetic) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-40">
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 700 700" fill="none">
          <circle cx="350" cy="350" r="320" stroke="url(#circle-grad-1)" strokeWidth="2" strokeDasharray="12 16" />
          <circle cx="350" cy="350" r="260" stroke="url(#circle-grad-2)" strokeWidth="1.5" strokeDasharray="8 12" />
          <defs>
            <linearGradient id="circle-grad-1" x1="0" y1="0" x2="700" y2="700">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="circle-grad-2" x1="700" y1="0" x2="0" y2="700">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-30">
        <svg className="w-full h-full animate-spin-reverse" viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="220" stroke="#0d9488" strokeWidth="2" strokeDasharray="20 15" strokeLinecap="round" />
          <circle cx="250" cy="250" r="170" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6 10" />
        </svg>
      </div>

      {/* Background Multi-Color Glow (SNS Design Thinking Framework Palette) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-circle-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-circle-pulse" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-circle-pulse" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header with Patient Dashboard Animated Circular SVG Halo */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-500 via-teal-500 to-purple-500 opacity-30 blur-md animate-pulse" />
          <CarePilotLogo size="lg" textLight={true} />
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* White Format Card with Crisp Line Border & Patient Dashboard Styling */}
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-200 hover:border-teal-300 transition-all">
          
          {/* Hospital Header Badge with Animated Pulse Line */}
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-purple-500/10 border border-slate-200 text-center relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-500 via-teal-500 to-purple-500" />
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                SNS Medical College & Hospital
              </h3>
            </div>
            <p className="text-[11px] text-teal-700 font-bold mt-0.5">Smart Patient & Clinic Scheduling Portal</p>
          </div>

          {/* Patient Dashboard Style Role Selector with Animated Circular SVG Lines */}
          <div className="mb-6">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
              Select User Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* ADMIN ROLE BUTTON */}
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 min-h-[90px] relative overflow-hidden group ${
                  role === 'admin'
                    ? 'bg-amber-50/60 border-amber-400 shadow-md ring-2 ring-amber-400/20 text-amber-950'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {/* Circular SVG Progress Line (Dashboard Style) */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-amber-100" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={125.6}
                      strokeDashoffset={role === 'admin' ? 0 : 125.6}
                      strokeLinecap="round"
                      className="text-amber-500 transition-all duration-700"
                      fill="transparent"
                    />
                  </svg>
                  <div className={`p-1.5 rounded-full transition-transform group-hover:scale-110 ${
                    role === 'admin' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-xs font-black tracking-wider uppercase">ADMIN</span>
              </button>

              {/* PATIENT ROLE BUTTON */}
              <button
                type="button"
                onClick={() => handleRoleChange('patient')}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 min-h-[90px] relative overflow-hidden group ${
                  role === 'patient'
                    ? 'bg-teal-50/60 border-teal-500 shadow-md ring-2 ring-teal-400/20 text-teal-950'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {/* Circular SVG Progress Line (Dashboard Style) */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90 absolute inset-0" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" className="text-teal-100" fill="transparent" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={125.6}
                      strokeDashoffset={role === 'patient' ? 0 : 125.6}
                      strokeLinecap="round"
                      className="text-teal-500 transition-all duration-700"
                      fill="transparent"
                    />
                  </svg>
                  <div className={`p-1.5 rounded-full transition-transform group-hover:scale-110 ${
                    role === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-xs font-black tracking-wider uppercase">PATIENT</span>
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
        <p className="mt-4 text-center text-xs text-slate-400 font-medium">
          CarePilot &copy; 2026. SNS Medical College & Hospital.
        </p>
      </div>
    </div>
  );
};
