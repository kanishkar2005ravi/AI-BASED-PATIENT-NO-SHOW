import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail, Phone, Lock, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || 'Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@example.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-2831');
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-6 pb-12">
      <Header title="Administrator Profile Settings" />

      {/* 🔙 BACK TO DASHBOARD BUTTON 🔙 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-600 text-white text-xs font-black transition-all shadow-sm group cursor-pointer border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>&larr; Back to Dashboard</span>
        </button>
      </div>

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

        <Card className="md:col-span-2" title="Account Details" subtitle="Update administrative credentials">
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
      </div>
    </div>
  );
};


