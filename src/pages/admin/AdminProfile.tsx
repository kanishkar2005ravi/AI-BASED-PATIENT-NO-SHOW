import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail, Phone, Lock, Save, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { clearAllAppData } from '../../services/api';

export const AdminProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || 'Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@example.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-2831');
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({ ...user, name, email, phone });
      }
      setSaving(false);
      showToast('Admin profile updated successfully.', 'success');
    }, 400);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all entered patient details, appointments, waitlists, and start fresh?')) {
      setClearing(true);
      clearAllAppData();
      showToast('All local application data cleared! Reloading...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title="Administrator Profile Settings" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 text-center p-6">
          <div className="w-24 h-24 rounded-full bg-slate-900 text-teal-400 font-black text-3xl flex items-center justify-center mx-auto mb-4 border-4 border-teal-500/30">
            A
          </div>
          <h3 className="text-lg font-bold text-slate-900">{name}</h3>
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mt-0.5">System Administrator</p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p>ID: {user?.id || 'ADMIN-001'}</p>
            <p>Role: Hospital Administrator</p>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card title="Account Details" subtitle="Update administrative credentials">
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Phone Contact" value={phone} onChange={e => setPhone(e.target.value)} />

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="primary" type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>

          <Card title="System Data Reset" subtitle="Clear all stored patient, appointment, and waitlist data to start completely fresh">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/50 border border-red-100 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-red-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-600" /> Clear All Local App Data
                </h4>
                <p className="text-xs text-red-700 mt-1">
                  This will wipe all cached patient records, appointment bookings, and waitlist items from your browser.
                </p>
              </div>
              <Button variant="danger" onClick={handleClearAll} isLoading={clearing} icon={<RefreshCw className="w-4 h-4" />}>
                Clear All Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

