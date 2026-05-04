'use client'

import React, { useState } from 'react';
import { Target, Skull, Activity, ArrowRight, Crosshair, Orbit, Zap, AlignEndVertical, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ModeCard from '../../components/mode-card';
import { useSettingsStore, GameMode } from '@/lib/store/use-settings-store';

const clipPathStyle = {
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

export default function TrainingHub() {
  const router = useRouter();
  const setGameMode = useSettingsStore(state => state.setGameMode);
  const [configMode, setConfigMode] = useState<GameMode | null>(null);
  const gravityFlickLanes = useSettingsStore(state => state.gravityFlickLanes);
  const updateGravityFlickLanes = useSettingsStore(state => state.updateGravityFlickLanes);

  const handleLaunch = (mode: GameMode) => {
    if (mode === GameMode.GRAVITY_FLICK && configMode !== GameMode.GRAVITY_FLICK) {
      setConfigMode(mode);
      return;
    }
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

        <ModeCard
          title="Moving Spheres"
          description="Track smoothly gliding targets across the arena. Builds mouse control and target-leading fundamentals."
          icon={Orbit}
          difficulty="Intermediate"
          color="#F59E0B"
          stats="Tracking Mode"
          onClick={() => handleLaunch(GameMode.MOVING_SPHERES)}
        />

        <ModeCard
          title="Flick Training"
          description="One shot. One target. High angular displacement between every spawn. Pure flick mechanics and raw reaction time."
          icon={Zap}
          difficulty="Advanced"
          color="#A855F7"
          stats="Reaction Time"
          onClick={() => handleLaunch(GameMode.FLICK)}
        />

        <ModeCard
          title="Gravity Flick"
          description="React fast to targets falling in lanes. Tests rapid target switching and vertical reaction time."
          icon={AlignEndVertical}
          difficulty="Advanced"
          color="#EC4899"
          stats="Reaction & Speed"
          onClick={() => handleLaunch(GameMode.GRAVITY_FLICK)}
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

      {configMode === GameMode.GRAVITY_FLICK && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 p-8 max-w-md w-full relative" style={clipPathStyle}>
            <button 
              onClick={() => setConfigMode(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold uppercase tracking-tighter mb-2">Gravity Flick Config</h3>
            <p className="text-white/40 text-sm mb-6 uppercase tracking-widest">Select number of lanes</p>
            
            <div className="flex gap-4 mb-8">
              {[2, 3, 4].map(lanes => (
                <button
                  key={lanes}
                  onClick={() => updateGravityFlickLanes(lanes)}
                  className={`flex-1 py-4 text-xl font-bold border transition-colors ${
                    gravityFlickLanes === lanes 
                      ? 'border-[#EE3F2C] bg-[#EE3F2C]/10 text-[#EE3F2C]' 
                      : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                  style={clipPathStyle}
                >
                  {lanes}
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                setConfigMode(null);
                setGameMode(GameMode.GRAVITY_FLICK);
                router.push('/quickplay');
              }}
              className="w-full bg-[#EE3F2C] text-white py-4 font-bold uppercase text-sm tracking-widest hover:bg-red-600 transition-colors"
              style={clipPathStyle}
            >
              Start Drill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
