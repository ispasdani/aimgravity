'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Settings2, 
  User, 
  Zap,
  ChevronRight,
  Crosshair
} from 'lucide-react';

const rubik = { variable: '--font-rubik' }; // Simplified for component logic

const clipPathStyle = {
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Target, label: 'Training Hub', href: '/dashboard/training' },
  { icon: Trophy, label: 'Benchmarks', href: '/dashboard/benchmarks' },
  { icon: Crosshair, label: 'Weapon Settings', href: '/dashboard/settings' },
  { icon: Zap, label: 'Quickplay', href: '/quickplay' },
];

const bottomItems = [
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#0A0A0A] border-r border-white/10 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-8 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L2 16L16 30L30 16L16 2Z" className="stroke-[#EE3F2C]" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 10L10 16L16 22L22 16L16 10Z" className="fill-[#EE3F2C]" />
        </svg>
        <span className="text-xl font-bold uppercase tracking-tight text-white">aimgravity</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 py-8 flex flex-col gap-2">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-4 mb-4">Navigation</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group flex items-center justify-between p-4 transition-all duration-300 ${
                isActive 
                  ? 'bg-[#EE3F2C] text-white' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
              style={clipPathStyle}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? 'text-white' : 'text-[#EE3F2C] group-hover:scale-110 transition-transform'} />
                <span className="font-bold uppercase tracking-wide text-sm">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 mt-auto flex flex-col gap-2">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-4 mb-4">Account</div>
        {bottomItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="group flex items-center gap-3 p-4 text-white/50 hover:bg-white/5 hover:text-white transition-all duration-300"
            style={clipPathStyle}
          >
            <item.icon size={20} className="text-white/30 group-hover:text-white transition-colors" />
            <span className="font-bold uppercase tracking-wide text-sm">{item.label}</span>
          </Link>
        ))}
        
        {/* User Card (Simplified) */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#EE3F2C] to-red-900 rounded-sm flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <div className="text-xs font-bold text-white">John Doe</div>
            <div className="text-[10px] text-white/40">Recruit Pilot</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
