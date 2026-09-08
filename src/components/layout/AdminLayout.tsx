import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative overflow-hidden">
      <Sidebar role="admin" />
      <MobileNavigation role="admin" />
      
      {/* 7-Color Soft Ambient Light Painting Watercolor Aura in Background Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 blur-3xl pointer-events-none z-0">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 via-pink-300 via-purple-300 via-blue-300 via-teal-300 to-emerald-300 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
