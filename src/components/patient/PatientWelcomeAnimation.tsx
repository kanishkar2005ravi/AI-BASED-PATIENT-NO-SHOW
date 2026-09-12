import React, { useState, useEffect } from 'react';
import { Sparkles, HeartPulse, Hospital, ShieldCheck, Stethoscope, Award, Play, Pause, RotateCcw, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PatientWelcomeAnimationProps {
  patientName: string;
  onClose: () => void;
}

export const PatientWelcomeAnimation: React.FC<PatientWelcomeAnimationProps> = ({ patientName, onClose }) => {
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const FRAMES = [
    {
      id: 1,
      title: "Welcome to CarePilot SNS",
      subtitle: "Run by SNS Medical College and Hospital",
      description: "Next-Generation AI Healthcare & Smart Schedule System",
      icon: <Hospital className="w-16 h-16 text-teal-300 animate-bounce" />,
      bgGradient: "from-teal-900 via-teal-800 to-cyan-900",
      borderColor: "border-teal-400",
      accentColor: "bg-teal-400",
      textColor: "text-teal-300",
      badge: "FRAME 1 of 7 • INSTITUTIONAL WELCOME",
      highlight: "SNS Medical College and Hospital"
    },
    {
      id: 2,
      title: "Advanced Medical Care",
      subtitle: "SNS Medical Center of Excellence",
      description: "State-of-the-art diagnostic facilities and multi-specialty care departments",
      icon: <HeartPulse className="w-16 h-16 text-emerald-300 animate-pulse" />,
      bgGradient: "from-emerald-900 via-teal-900 to-lime-950",
      borderColor: "border-emerald-400",
      accentColor: "bg-emerald-400",
      textColor: "text-emerald-300",
      badge: "FRAME 2 of 7 • WORLD-CLASS CARE",
      highlight: "Excellence in Healthcare"
    },
    {
      id: 3,
      title: "AI-Powered No-Show Predictor",
      subtitle: "CarePilot Machine Learning Engine",
      description: "Smart scheduling algorithms ensuring zero wait times and seamless consultations",
      icon: <Sparkles className="w-16 h-16 text-blue-300 animate-spin-slow" />,
      bgGradient: "from-indigo-950 via-blue-900 to-cyan-900",
      borderColor: "border-blue-400",
      accentColor: "bg-blue-400",
      textColor: "text-blue-300",
      badge: "FRAME 3 of 7 • AI INNOVATION",
      highlight: "Predictive Health Intelligence"
    },
    {
      id: 4,
      title: "Expert Specialist Doctors",
      subtitle: "Cardiology • Dermatology • Medicine • Orthopedics",
      description: "Dedicated medical professionals committed to your wellness round the clock",
      icon: <Stethoscope className="w-16 h-16 text-purple-300 animate-bounce" />,
      bgGradient: "from-purple-950 via-violet-900 to-indigo-900",
      borderColor: "border-purple-400",
      accentColor: "bg-purple-400",
      textColor: "text-purple-300",
      badge: "FRAME 4 of 7 • SPECIALIST FACULTY",
      highlight: "Top Medical Specialists"
    },
    {
      id: 5,
      title: "Personalized Patient Portal",
      subtitle: "Instant Access to Health Records",
      description: "Track appointment slots, AI risk evaluations, and waitlist updates in real time",
      icon: <ShieldCheck className="w-16 h-16 text-rose-300 animate-pulse" />,
      bgGradient: "from-rose-950 via-pink-900 to-purple-900",
      borderColor: "border-pink-400",
      accentColor: "bg-pink-400",
      textColor: "text-pink-300",
      badge: "FRAME 5 of 7 • PATIENT FIRST",
      highlight: "24/7 Digital Portal"
    },
    {
      id: 6,
      title: "WhatsApp & Schedule Alerts",
      subtitle: "Direct Doctor Timetable Dispatch",
      description: "Automated daily schedules sent via PDF, Email, and SMS for maximum convenience",
      icon: <Award className="w-16 h-16 text-amber-300 animate-pulse" />,
      bgGradient: "from-amber-950 via-orange-900 to-red-950",
      borderColor: "border-amber-400",
      accentColor: "bg-amber-400",
      textColor: "text-amber-300",
      badge: "FRAME 6 of 7 • SMART NOTIFICATIONS",
      highlight: "Instant Patient Reminders"
    },
    {
      id: 7,
      title: `Welcome Aboard, ${patientName}!`,
      subtitle: "CarePilot SNS • SNS Medical College and Hospital",
      description: "Your health journey begins here. Access your dashboard now!",
      icon: <CheckCircle2 className="w-16 h-16 text-emerald-300 animate-bounce" />,
      bgGradient: "from-teal-900 via-purple-900 to-rose-900",
      borderColor: "border-gradient-to-r from-teal-400 via-indigo-400 to-rose-400",
      accentColor: "bg-gradient-to-r from-teal-400 via-indigo-400 to-rose-400",
      textColor: "text-amber-300",
      badge: "FRAME 7 of 7 • READY TO BEGIN",
      highlight: "Complete Institutional Accreditation"
    }
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % FRAMES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, FRAMES.length]);

  const frame = FRAMES[currentFrame];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-900">
        
        {/* Animated 7-Color Rainbow Top Frame Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-400 via-blue-400 via-purple-400 via-pink-400 via-amber-400 to-teal-400 bg-[length:200%_auto] animate-gradient-x" />

        {/* Video Canvas Container */}
        <div className={`relative p-8 md:p-12 bg-gradient-to-br ${frame.bgGradient} transition-all duration-700 ease-in-out min-h-[460px] flex flex-col justify-between overflow-hidden`}>
          
          {/* Animated Background Motion Particles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

          {/* Header Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-2 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black text-white tracking-widest uppercase">{frame.badge}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-all backdrop-blur-sm border border-white/10"
              title="Close Welcome Screen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Animated Video Content */}
          <div className="my-8 z-10 text-center flex flex-col items-center space-y-5 animate-slide-up">
            
            {/* Pulsating Frame Emblem */}
            <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transform transition-transform hover:scale-105">
              {frame.icon}
            </div>

            {/* Title & Subtitle */}
            <div className="max-w-2xl space-y-2">
              <span className={`text-xs md:text-sm font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-black/30 border border-white/10 ${frame.textColor}`}>
                {frame.highlight}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {frame.title}
              </h1>
              <p className="text-lg md:text-xl font-bold text-teal-100/90">
                {frame.subtitle}
              </p>
              <p className="text-sm md:text-base text-slate-200/80 max-w-xl mx-auto font-medium">
                {frame.description}
              </p>
            </div>
          </div>

          {/* Bottom Video Playbar & Controls */}
          <div className="z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            
            {/* 7 Frame Indicators */}
            <div className="flex items-center space-x-2">
              {FRAMES.map((f, idx) => (
                <button
                  key={f.id}
                  onClick={() => setCurrentFrame(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentFrame === idx
                      ? 'w-8 bg-white shadow-lg'
                      : 'w-2.5 bg-white/30 hover:bg-white/50'
                  }`}
                  title={`Go to Frame ${f.id}`}
                />
              ))}
            </div>

            {/* Playback Controls & Skip to Dashboard */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => setCurrentFrame(0)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/20"
                title="Replay Video Animation"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-xs md:text-sm shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Footer Banner */}
        <div className="bg-slate-950 px-6 py-3 flex items-center justify-between text-xs text-slate-400 font-semibold border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>CarePilot SNS • SNS Medical College and Hospital</span>
          </div>
          <span>7-Frame Motion Canvas</span>
        </div>

      </div>
    </div>
  );
};
