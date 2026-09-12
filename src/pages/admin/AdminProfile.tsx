import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowLeft, Mail, Phone, Smartphone, PhoneCall, MessageSquare, ShieldAlert, MapPin, User as UserIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+919876543210');
  const [basicPhone, setBasicPhone] = useState(user?.basicPhone || '+919876543211');
  const [whatsappPhone, setWhatsappPhone] = useState(user?.whatsappPhone || '+918300096676');
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergencyContactName || 'SNS Emergency Desk');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyPhone || '+919876543299');
  const [address, setAddress] = useState(user?.address || 'SNS Medical College & Hospital Admin Block, Coimbatore, TN');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          name,
          email,
          phone,
          basicPhone,
          whatsappPhone,
          emergencyContactName,
          emergencyPhone,
          address
        });
      }
      setSaving(false);
      showToast(t('profile.update_success'), 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      <Header title={t('profile.admin_title')} />

      {/* 🔙 BACK TO DASHBOARD BUTTON 🔙 */}
      <div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-xs shadow-xs group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition-transform" />
          <span>{t('profile.back_dashboard')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 p-6 flex flex-col justify-between">
          <div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-slate-900 text-teal-400 font-black text-3xl flex items-center justify-center mx-auto mb-4 border-4 border-teal-500/30">
                {name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{name}</h3>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mt-0.5">
                {t('label.admin')}
              </p>
              <p className="text-xs font-mono font-bold text-slate-500 mt-1">ID: {user?.id || 'ADMIN-001'}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="font-semibold text-slate-900 truncate">{email}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
                <Smartphone className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Mobile (Smartphone)</p>
                  <p className="font-mono font-bold text-slate-900">{phone}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
                <PhoneCall className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact No. (Non-Smartphone Users)</p>
                  <p className="font-mono font-bold text-slate-900">{basicPhone || 'Not configured'}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start space-x-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">WhatsApp Number</p>
                  <p className="font-mono font-bold text-emerald-950">{whatsappPhone || 'Not configured'}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-rose-800 uppercase">Emergency Contact & Phone</p>
                  <p className="font-bold text-rose-950">{emergencyContactName}</p>
                  <p className="font-mono font-bold text-rose-700">{emergencyPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2" title="Admin Profile & Multi-Channel Contact Details" subtitle="Manage official contact numbers, non-smartphone fallback channel, WhatsApp alerts, and emergency contact details.">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('profile.full_name')}
                value={name}
                onChange={e => setName(e.target.value)}
                icon={<UserIcon className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label={t('profile.email_address')}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>

            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
              Multi-Channel Phone & Emergency Configuration
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Mobile Number (Smartphone)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                icon={<Smartphone className="w-4 h-4 text-slate-400" />}
                placeholder="Enter 10-digit mobile number..."
                required
              />

              <Input
                label="Contact No. (For Non-Smartphone / Feature Phone Users)"
                value={basicPhone}
                onChange={e => setBasicPhone(e.target.value)}
                icon={<PhoneCall className="w-4 h-4 text-amber-500" />}
                placeholder="Basic feature phone contact for SMS/Voice calls..."
                helperText="Used as fallback for non-tech / basic phone users"
              />

              <Input
                label="WhatsApp Number"
                value={whatsappPhone}
                onChange={e => setWhatsappPhone(e.target.value)}
                icon={<MessageSquare className="w-4 h-4 text-emerald-500" />}
                placeholder="Enter WhatsApp mobile number (+91...)"
                helperText="Receives automated appointment recovery & waitlist alerts"
              />

              <Input
                label="Emergency Contact Name"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                icon={<ShieldAlert className="w-4 h-4 text-rose-500" />}
                placeholder="Emergency desk or guardian relative name..."
              />
            </div>

            <Input
              label="Emergency Contact Phone"
              value={emergencyPhone}
              onChange={e => setEmergencyPhone(e.target.value)}
              icon={<Phone className="w-4 h-4 text-rose-500" />}
              placeholder="Enter 24/7 emergency helpline number..."
            />

            <Input
              label="Office / Residential Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              icon={<MapPin className="w-4 h-4 text-slate-400" />}
              placeholder="Enter official hospital office address..."
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
                {t('profile.save_profile')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
