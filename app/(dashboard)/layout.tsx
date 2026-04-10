import React from 'react';
import Sidebar from './components/sidebar';
import { Rubik } from 'next/font/google';

const rubik = Rubik({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-rubik',
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${rubik.variable} flex min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden`} style={{ fontFamily: 'var(--font-rubik), sans-serif' }}>
      <Sidebar />
      <main className="flex-grow flex flex-col relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EE3F2C]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/5 blur-[120px] pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
