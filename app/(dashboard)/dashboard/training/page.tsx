'use client'

import React from 'react';
import { Target, Skull, Activity, ArrowRight, Crosshair } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ModeCard from '../../components/mode-card';
import { useSettingsStore, GameMode } from '@/lib/store/use-settings-store';

const clipPathStyle = {
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

export default function TrainingHub() {
  const router = useRouter();
  const setGameMode = useSettingsStore(state => state.setGameMode);

  const handleLaunch = (mode: GameMode) => {
    setGameMode(mode);
    router.push('/quickplay');
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="pb-8 border-b border-white/5">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2">
          Training Hub
        </h1>
        <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-xs">
          Select a simulator environment to begin evaluation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ModeCard 
          title="Mannequin One-Shot"
          description="Hone your crosshair placement against precise, scaled terrorist mannequins. One tap anywhere to eliminate."
          icon={Skull}
          difficulty="Intermediate"
          color="#EE3F2C"
          stats="Lethal Mode"
          onClick={() => handleLaunch(GameMode.MANNEQUIN_ONE_SHOT)}
        />
        
        <ModeCard 
          title="Mannequin Damage"
          description="Train consistent weapon tracking and recoil control. Requires multiple body shots or a clean headshot."
          icon={Activity}
          difficulty="Advanced"
          color="#3B82F6"
          stats="CS2 Multipliers"
          onClick={() => handleLaunch(GameMode.MANNEQUIN_DAMAGE)}
        />
        
        <ModeCard 
          title="Standard Spheres"
          description="The classic AimGravity warming environment. Pop pure geometric spheres to build speed."
          icon={Target}
          difficulty="Beginner"
          color="#10B981"
          stats="Classic Mode"
          onClick={() => handleLaunch(GameMode.SPHERES)}
        />
      </div>

      {/* Featured banner */}
      <div 
        className="relative p-12 overflow-hidden border border-[#EE3F2C]/20 bg-gradient-to-br from-red-950/20 via-black to-black group mt-12"
        style={clipPathStyle}
      >
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(238, 63, 44, 0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EE3F2C]/10 border border-[#EE3F2C]/30 text-[#EE3F2C] text-[10px] font-bold uppercase tracking-widest mb-6">
              New Engine Update
            </div>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4 group-hover:text-[#EE3F2C] transition-colors">
              Adaptive Hitboxes
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              The Engine now tracks complex spherical headshot geometry and dynamic ray-box interactions. Hit payloads are automatically synced to your dashboard.
            </p>
            <button 
              onClick={() => handleLaunch(GameMode.MANNEQUIN_DAMAGE)}
              className="px-8 py-4 bg-[#EE3F2C] text-white font-bold uppercase text-sm tracking-widest hover:bg-red-600 transition-all duration-300 flex items-center gap-3" 
              style={clipPathStyle}>
              Deploy Now <ArrowRight size={18} />
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
    </div>
  );
}
