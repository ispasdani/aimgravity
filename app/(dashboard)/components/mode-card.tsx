'use client'

import React from 'react';
import { LucideIcon, Play } from 'lucide-react';

export interface ModeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  color?: string;
}

const clipPathStyle = {
  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
};

export default function ModeCard({ 
  title, 
  description, 
  icon: Icon, 
  stats, 
  difficulty = 'Beginner',
  color = '#EE3F2C' 
}: ModeCardProps) {
  const difficultyColors = {
    Beginner: 'text-green-400',
    Intermediate: 'text-yellow-400',
    Advanced: 'text-red-400',
  };

  return (
    <div 
      className="group relative bg-white/[0.03] border border-white/5 p-8 transition-all duration-500 hover:bg-white/[0.07] hover:border-white/20 overflow-hidden"
      style={clipPathStyle}
    >
      {/* Background Accent Gradient */}
      <div 
        className="absolute -right-12 -top-12 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div 
            className="w-14 h-14 flex items-center justify-center bg-black border border-white/10 text-white group-hover:scale-110 transition-transform duration-500"
            style={{ ...clipPathStyle, color }}
          >
            <Icon size={28} />
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
            {stats && (
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                {stats}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-bold uppercase tracking-tight text-white mb-3 group-hover:text-[#EE3F2C] transition-colors">
          {title}
        </h3>
        
        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-[240px]">
          {description}
        </p>

        <button 
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase text-xs tracking-widest hover:bg-[#EE3F2C] hover:border-[#EE3F2C] transition-all duration-300"
          style={clipPathStyle}
        >
          <Play size={14} fill="currentColor" />
          <span>Launch Drill</span>
        </button>
      </div>

      {/* Decorative corner element */}
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white/5 group-hover:border-[#EE3F2C]/50 transition-colors" />
    </div>
  );
}
