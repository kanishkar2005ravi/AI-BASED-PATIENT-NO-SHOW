import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface AppFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppFeaturesModal: React.FC<AppFeaturesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">CarePilot Platform Features</h3>
              <p className="text-xs text-slate-500 font-semibold">AI-Powered Healthcare System & Notification Capabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🏥 SNS 24/7 HEALTHCARE SUPPORT BANNER 🏥 */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white border border-teal-500/40 space-y-2.5 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black flex-shrink-0 text-base shadow-sm">
              🏥
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">SNS Medical College 24/7 Healthcare Support</h4>
              <p className="text-teal-300 text-[11px] font-bold mt-0.5">📞 Helpline: +91 422 2661100 • Emergency & Casualty Outpatient</p>
            </div>
          </div>
          <div className="pt-2 border-t border-teal-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
            <span>📧 Official Email: <a href="mailto:kanis.r.ad.2024@snsce.ac.in" className="text-amber-300 font-extrabold hover:underline">kanis.r.ad.2024@snsce.ac.in</a></span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              24/7 Emergency ICU & Ambulance
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-3.5">
          {/* Feature 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center flex-shrink-0 text-base shadow-sm mt-0.5">
              📩
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Instant Gmail & WhatsApp Alerts</h4>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950">Live Sync</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Automated instant multi-channel notifications sent to your registered Email & WhatsApp upon Account Creation, Slot Booking, Cancellations, Rescheduling, and Waitlist Slot Allocations.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center flex-shrink-0 text-base shadow-sm mt-0.5">
              📞
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Phone Call-In Booking Helpline</h4>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-950">1st Come 1st Serve</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                For elderly or non-smartphone patients without digital access, our dedicated call-in helpline (<strong className="text-blue-900">+91 422 2661100</strong>) allocates reserved daily slots on a strict First-Come, First-Served priority basis.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center flex-shrink-0 text-base shadow-sm mt-0.5">
              🤖
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">AI XGBoost Attendance Analytics</h4>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950">AI Prediction</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Machine learning model predicts attendance probability to prevent schedule downtime, optimize doctor daily slotting, and trigger automated pre-visit advisory reminders.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center flex-shrink-0 text-base shadow-sm mt-0.5">
              ⚡
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Same-Day Priority Faculty Booking</h4>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-950">Admin Verified</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Request urgent faculty specialist consultations when regular slots are full with instant hospital admin verification and priority SMS/Email confirmation.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center flex-shrink-0 text-base shadow-sm mt-0.5">
              🔄
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Real-Time Waitlist Auto-Reallocation</h4>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-950">Auto Queue</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                When an appointment is cancelled, the system automatically identifies the highest-priority waitlisted patient and offers the slot instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
