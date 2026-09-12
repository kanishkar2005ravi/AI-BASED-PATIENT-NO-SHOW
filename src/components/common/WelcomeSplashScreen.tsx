import React, { useState, useEffect } from 'react';
import { Sparkles, Hospital, HeartPulse, ArrowRight } from 'lucide-react';

interface WelcomeSplashScreenProps {
  userName?: string;
  role?: 'admin' | 'patient';
  onComplete: () => void;
}

export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({ userName, role = 'patient', onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(5);

  useEffect(() => {
    // Progress bar over 5 seconds (5000ms)
    const intervalTime = 50; // update every 50ms (100 steps total)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onComplete();
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    // Seconds countdown indicator
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(countdown);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      
      {/* Outer 7-Color Rainbow Animated Border Container */}
      <div className="relative w-full max-w-3xl rounded-3xl p-1 bg-gradient-to-r from-teal-400 via-emerald-400 via-cyan-400 via-blue-500 via-purple-500 via-pink-500 to-amber-400 bg-[length:200%_auto] animate-gradient-x shadow-2xl overflow-hidden">
        
        {/* Inner Dark Glass Card */}
        <div className="relative bg-slate-900/95 rounded-[22px] p-8 md:p-12 text-center flex flex-col items-center justify-between min-h-[420px] overflow-hidden">
          
          {/* Glowing Background Orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

          {/* Top Institutional Badge */}
          <div className="flex items-center space-x-2 bg-slate-950/80 px-4 py-1.5 rounded-full border border-teal-500/40 shadow-inner z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-teal-300 tracking-widest uppercase flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5 text-teal-300" /> SNS MEDICAL COLLEGE AND HOSPITAL
            </span>
          </div>

          {/* Center Animated Welcome Content */}
          <div className="my-6 space-y-4 z-10 animate-slide-up max-w-2xl">
            <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-teal-500/20 to-purple-500/20 border border-white/10 shadow-lg mb-2">
              <HeartPulse className="w-12 h-12 text-teal-300 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs md:text-sm font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full bg-teal-950/80 border border-teal-400/30 text-teal-300">
                Official Healthcare Portal
              </span>
              
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                Welcome to <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">CarePilot SNS</span>
              </h1>
              
              <p className="text-base md:text-xl font-extrabold text-amber-300 tracking-wide">
                Run by SNS Medical College and Hospital
              </p>

              {userName && (
                <p className="text-sm md:text-base text-slate-300 font-semibold pt-2">
                  Hello, <span className="text-white font-bold">{userName}</span> ({role === 'admin' ? 'System Administrator' : 'Patient Portal'})
                </p>
              )}
            </div>
          </div>

          {/* Bottom 5-Second Animated Progress Bar */}
          <div className="w-full z-10 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span className="flex items-center gap-1 text-teal-300">
                <Sparkles className="w-3.5 h-3.5" /> Loading Dashboard in {secondsLeft}s...
              </span>
              <button
                onClick={onComplete}
                className="text-white/70 hover:text-white flex items-center gap-1 hover:underline transition-all"
              >
                <span>Skip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 7-Color Gradient Progress Bar */}
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 via-cyan-400 via-indigo-400 via-purple-400 via-pink-400 to-amber-400 transition-all duration-75 ease-linear shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
