import React from 'react';

interface CarePilotLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textLight?: boolean;
}

export const CarePilotLogo: React.FC<CarePilotLogoProps> = ({
  size = 'md',
  showText = true,
  textLight = false
}) => {
  const iconSize = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-16 h-16' : 'w-11 h-11';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <div className="flex items-center space-x-3 select-none">
      {/* SNS Design Thinking CFC Colorful Polygon Brain Logo */}
      <div className={`${iconSize} rounded-2xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xl border border-slate-700/60 relative overflow-hidden group`}>
        {/* Background Colorful Aura */}
        <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-amber-500 via-rose-500 via-purple-500 via-blue-500 to-teal-400 blur-sm" />
        
        {/* SNS CFC Design Thinking Polygon Brain SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-md">
          {/* Polygons matching SNS Design Thinking Brain (Yellow, Red, Pink, Purple, Blue, Teal, Green) */}
          <polygon points="50,12 76,28 64,54 50,42" fill="#F59E0B" />
          <polygon points="50,12 24,28 36,54 50,42" fill="#EF4444" />
          <polygon points="76,28 88,54 66,78 64,54" fill="#EC4899" />
          <polygon points="24,28 12,54 34,78 36,54" fill="#8B5CF6" />
          <polygon points="66,78 50,88 34,78 50,42" fill="#3B82F6" />
          <polygon points="50,42 64,54 66,78 50,88" fill="#0D9488" />
          <polygon points="50,42 36,54 34,78 50,88" fill="#10B981" />

          {/* Heartbeat pulse overlay */}
          <path d="M30 50 H42 L48 35 L54 62 L60 50 H70" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`${textSize} font-black tracking-tight ${textLight ? 'text-white' : 'text-slate-900'}`}>
              Care<span className="text-teal-600">Pilot</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-gradient-to-r from-amber-500 via-rose-500 to-teal-500 text-white tracking-widest shadow-sm">
              SNS
            </span>
          </div>
          <span className={`text-[10px] font-extrabold tracking-wider uppercase ${textLight ? 'text-amber-400' : 'text-teal-700'} block font-sans mt-0.5`}>
            SNS Medical College & Hospital
          </span>
        </div>
      )}
    </div>
  );
};
