'use client'

import React from 'react';
import { 
  Target, 
  Move, 
  Zap, 
  Repeat, 
  Trophy, 
  ArrowRight,
  TrendingUp,
  Clock,
  Crosshair
} from 'lucide-react';
import ModeCard, { ModeCardProps } from '../components/mode-card';

const clipPathStyle = {
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

const modes: ModeCardProps[] = [
  {
    title: "Flicking",
    description: "Master rapid target acquisition and precision reflex shots.",
    icon: Target,
    stats: "Top 5% Score",
    difficulty: "Intermediate",
    color: "#EE3F2C"
  },
  {
    title: "Tracking",
    description: "Develop smooth, consistent aim on moving targets.",
    icon: Move,
    stats: "48ms Avg Error",
    difficulty: "Intermediate",
    color: "#3B82F6"
  },
  {
    title: "Switching",
    description: "Chain targets together with explosive target transitions.",
    icon: Repeat,
    stats: "1.2 targets/s",
    difficulty: "Advanced",
    color: "#F59E0B"
  },
  {
    title: "Speed",
    description: "Push your raw reaction time and click velocity limits.",
    icon: Zap,
    stats: "165ms Reaction",
    difficulty: "Beginner",
    color: "#10B981"
  },
  {
    title: "Benchmarks",
    description: "Standardized playlists to measure your true skill floor.",
    icon: Trophy,
    stats: "Rank: Diamond",
    difficulty: "Advanced",
    color: "#8B5CF6"
  }
];

export default function DashboardHome() {
  return (
    <div className="space-y-12">
      {/* Header / Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2">
            Operations Hub
          </h1>
          <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-xs">
            Welcome back, Pilot. Your systems are nominal.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 p-4 min-w-[160px]" style={clipPathStyle}>
            <div className="text-[10px] text-white/30 font-bold uppercase mb-1">Weekly Growth</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#EE3F2C]">+12.4%</span>
              <TrendingUp size={16} className="text-[#EE3F2C]" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 min-w-[160px]" style={clipPathStyle}>
            <div className="text-[10px] text-white/30 font-bold uppercase mb-1">Global Rank</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">#2,481</span>
              <Trophy size={16} className="text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero / Quick Resume */}
      <div 
        className="relative p-12 overflow-hidden border border-[#EE3F2C]/20 bg-gradient-to-br from-red-950/20 via-black to-black group"
        style={clipPathStyle}
      >
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          {/* Decorative Grid Pattern */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(238, 63, 44, 0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EE3F2C]/10 border border-[#EE3F2C]/30 text-[#EE3F2C] text-[10px] font-bold uppercase tracking-widest mb-6">
              <Clock size={12} />
              Recent Activity
            </div>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4 group-hover:text-[#EE3F2C] transition-colors">
              Continue Voltaic Mastery
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              You left off on "Static 1w4ts". Resume your routine to maintain your muscle memory and rank progression.
            </p>
            <button className="px-8 py-4 bg-[#EE3F2C] text-white font-bold uppercase text-sm tracking-widest hover:bg-red-600 transition-all duration-300 flex items-center gap-3" style={clipPathStyle}>
              Resume Routine <ArrowRight size={18} />
            </button>
          </div>
          
          <div className="hidden lg:block">
             <div className="w-56 h-56 bg-black border border-white/5 flex items-center justify-center relative rotate-45 group-hover:rotate-90 transition-transform duration-1000">
                <div className="absolute inset-0 border border-[#EE3F2C]/20 scale-110" />
                <div className="-rotate-45 group-hover:-rotate-90 transition-transform duration-1000">
                  <Crosshair size={80} className="text-[#EE3F2C] opacity-20" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modes Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tight">Deployment Modes</h3>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Select your focus area</p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors border-b border-white/10 pb-1">View All Scenarios</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode, idx) => (
            <ModeCard key={idx} {...mode} />
          ))}
          
          {/* Custom Creation Slot */}
          <div 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 bg-white/[0.01] transition-all duration-300 hover:bg-white/[0.03] hover:border-[#EE3F2C]/30 group cursor-pointer"
            style={clipPathStyle}
          >
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#EE3F2C] group-hover:scale-110 transition-all duration-500 mb-4">
              <span className="text-2xl font-light">+</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">Create Custom Drill</span>
          </div>
        </div>
      </div>
    </div>
  );
}
