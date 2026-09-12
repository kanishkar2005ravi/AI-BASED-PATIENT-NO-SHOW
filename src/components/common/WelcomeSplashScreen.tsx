import React, { useState, useEffect } from 'react';
import { HeartPulse, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WelcomeSplashScreenProps {
  userName?: string;
  role?: 'admin' | 'patient';
  onComplete: () => void;
}

export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({ userName, role = 'patient', onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(3);
  const { t } = useLanguage();

  useEffect(() => {
    // 3-Second (3000ms) full-screen video progress bar
    const intervalTime = 30; // update every 30ms (100 steps total)
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

    // Countdown seconds
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
    <div className="fixed inset-0 w-screen h-screen z-50 bg-slate-950 flex flex-col justify-between overflow-hidden select-none animate-fade-in">
      
      {/* 🎬 FULL-SCREEN HIGH-TECH ANIMATED VIDEO / GIF BACKGROUND 🎬 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Cyber Medical GIF & Holographic Waveform Image Overlay */}
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
          alt="Medical Holographic Background"
          className="w-full h-full object-cover opacity-20 scale-105 animate-pulse"
        />

        {/* 7-Color Rainbow Neon Laser Sweep Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-950/90 via-slate-950/95 via-purple-950/90 to-rose-950/90 mix-blend-multiply" />
        
        {/* Animated Floating 7-Color Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/25 rounded-full blur-[120px] animate-ping duration-1000" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/25 rounded-full blur-[120px] animate-ping duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/15 rounded-full blur-[160px] animate-pulse" />

        {/* Full-Screen Animated ECG Heartbeat Grid Waves (SVG Video Simulation) */}
        <svg className="absolute inset-0 w-full h-full opacity-30 stroke-teal-400" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top Spacer for Clean Layout */}
      <div className="pt-6" />

      {/* 🌟 CENTER FULL-SCREEN CINEMATIC TITLE & ANIMATION 🌟 */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6 animate-slide-up">
        <div className="inline-flex p-6 rounded-full bg-gradient-to-tr from-teal-500/20 via-purple-500/20 to-pink-500/20 border-2 border-teal-400/40 shadow-[0_0_50px_rgba(45,212,191,0.4)] backdrop-blur-md animate-bounce">
          <HeartPulse className="w-16 h-16 md:w-20 md:h-20 text-teal-300 drop-shadow-[0_0_20px_#2dd4bf]" />
        </div>

        <div className="space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg">
            {t('welcome.portal')}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 via-amber-200 to-white tracking-tight leading-tight drop-shadow-2xl">
            {t('welcome.title')}
          </h1>

          <p className="text-xl md:text-3xl font-black text-amber-300 tracking-wide drop-shadow-md">
            {t('welcome.institution')}
          </p>

          {userName && (
            <p className="text-base md:text-lg text-slate-300 font-semibold pt-2">
              {t('welcome.hello')}, <span className="text-white font-bold">{userName}</span> ({role === 'admin' ? 'System Administrator' : 'Patient Portal'})
            </p>
          )}
        </div>
      </div>

      {/* 🎬 BOTTOM FULL-SCREEN CONTROLS 🎬 */}
      <div className="relative z-10 p-6 md:p-8 w-full max-w-5xl mx-auto flex items-center justify-end">
        <button
          onClick={onComplete}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 transition-all hover:scale-105"
        >
          <span>Skip</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

