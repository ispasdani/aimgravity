'use client';

import React from 'react';
import { 
  Crosshair, 
  RotateCcw, 
  Save, 
  Settings, 
  Maximize2, 
  Move, 
  Rotate3d,
  Layers
} from 'lucide-react';
import { useSettingsStore, WeaponSettings } from '@/lib/store/use-settings-store';
import WeaponPreview from '@/components/game-components/weapon-preview';

const clipPathStyle = {
  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
};

const Slider = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (val: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center px-1">
      <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{label}</span>
      <span className="text-xs font-mono text-[#EE3F2C] bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
        {value.toFixed(2)}
      </span>
    </div>
    <div className="relative h-6 flex items-center group">
       <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#EE3F2C] hover:bg-white/15 transition-colors"
      />
    </div>
  </div>
);

export default function SettingsPage() {
  const { 
    weaponSettings, 
    updateWeaponSettings, 
    resetWeaponSettings,
    fov,
    updateFOV,
    sensitivity,
    updateSensitivity,
    tracersEnabled,
    toggleTracers,
    crouchMode,
    setCrouchMode
  } = useSettingsStore();
  const previewRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewRef.current) {
      if (!document.fullscreenElement) {
        previewRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Settings size={12} />
            System Configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">
            Weapon Settings
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={resetWeaponSettings}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-white/50 font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white transition-all duration-300"
            style={clipPathStyle}
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-5 space-y-8">
          {/* Position Section */}
          <section className="bg-white/[0.02] border border-white/5 p-8" style={clipPathStyle}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 flex items-center justify-center bg-[#EE3F2C]/10 border border-[#EE3F2C]/20 text-[#EE3F2C]">
                <Move size={16} />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Viewport Position</h2>
            </div>
            
            <div className="space-y-6">
              <Slider 
                label="Horizontal Offset (X)" 
                value={weaponSettings.x} 
                min={-1} max={1} step={0.01} 
                onChange={(v) => updateWeaponSettings({ x: v })} 
              />
              <Slider 
                label="Vertical Offset (Y)" 
                value={weaponSettings.y} 
                min={-1} max={1} step={0.01} 
                onChange={(v) => updateWeaponSettings({ y: v })} 
              />
              <Slider 
                label="Depth (Z)" 
                value={weaponSettings.z} 
                min={-2} max={0} step={0.01} 
                onChange={(v) => updateWeaponSettings({ z: v })} 
              />
            </div>
          </section>

          {/* Rotation & Scale Section */}
          <section className="bg-white/[0.02] border border-white/5 p-8" style={clipPathStyle}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 flex items-center justify-center bg-[#EE3F2C]/10 border border-[#EE3F2C]/20 text-[#EE3F2C]">
                <Rotate3d size={16} />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Orientation & Scale</h2>
            </div>
            
            <div className="space-y-6">
              <Slider 
                label="Yaw (Local Y)" 
                value={weaponSettings.yaw} 
                min={-Math.PI} max={Math.PI} step={0.01} 
                onChange={(v) => updateWeaponSettings({ yaw: v })} 
              />
              <Slider 
                label="Pitch (Local X)" 
                value={weaponSettings.pitch} 
                min={-Math.PI} max={Math.PI} step={0.01} 
                onChange={(v) => updateWeaponSettings({ pitch: v })} 
              />
              <Slider 
                label="Model Scale" 
                value={weaponSettings.scale} 
                min={0.1} max={3.0} step={0.05} 
                onChange={(v) => updateWeaponSettings({ scale: v })} 
              />
            </div>
          </section>

          {/* General Game Settings */}
          <section className="bg-white/[0.02] border border-white/5 p-8" style={clipPathStyle}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 flex items-center justify-center bg-[#EE3F2C]/10 border border-[#EE3F2C]/20 text-[#EE3F2C]">
                <Layers size={16} />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Core Calibration</h2>
            </div>
            
            <div className="space-y-6">
              <Slider 
                label="Field of View (FOV)" 
                value={fov} 
                min={60} max={120} step={1} 
                onChange={(v) => updateFOV(v)} 
              />
              <Slider 
                label="Mouse Sensitivity" 
                value={sensitivity} 
                min={0.1} max={10.0} step={0.1} 
                onChange={(v) => updateSensitivity(v)} 
              />
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Bullet Tracers</span>
                  <button 
                    onClick={toggleTracers}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out fill-mode-forwards ${tracersEnabled ? 'bg-[#EE3F2C]' : 'bg-white/10'}`}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tracersEnabled ? 'translate-x-2' : '-translate-x-2'}`}
                    />
                  </button>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Crouch Mode</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCrouchMode('hold')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${crouchMode === 'hold' ? 'bg-[#EE3F2C] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
                    >
                      Hold
                    </button>
                    <button
                      onClick={() => setCrouchMode('toggle')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${crouchMode === 'toggle' ? 'bg-[#EE3F2C] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-6">
             <div 
              ref={previewRef}
              className="relative aspect-square md:aspect-video lg:aspect-square bg-black border border-white/10 overflow-hidden group shadow-2xl shadow-[#EE3F2C]/5" 
              style={clipPathStyle}
            >
              <WeaponPreview />
              
              {/* Decorative Corner Overlays */}
              <div className="absolute top-0 right-0 p-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur-md border border-[#EE3F2C]/20 text-[10px] font-bold text-[#EE3F2C] uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-[#EE3F2C] rounded-full animate-pulse" />
                  Live Preview Path
                </div>
              </div>

               <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                 <div>
                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-1">Matrix Pos</div>
                    <div className="text-[14px] font-mono text-white/50">
                      [{weaponSettings.x.toFixed(2)}, {weaponSettings.y.toFixed(2)}, {weaponSettings.z.toFixed(2)}]
                    </div>
                 </div>
                 <button 
                  onClick={toggleFullscreen}
                  className="w-12 h-12 border border-white/10 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-md hover:bg-[#EE3F2C]/20 hover:border-[#EE3F2C]/30 hover:text-[#EE3F2C] transition-all duration-300 group/btn"
                  title="Toggle Fullscreen Preview"
                 >
                    <Maximize2 size={16} className="text-white/40 group-hover/btn:text-[#EE3F2C] transition-colors" />
                 </button>
               </div>
            </div>

            <div className="p-6 bg-[#EE3F2C]/5 border border-[#EE3F2C]/10 rounded-sm">
              <div className="flex gap-4">
                <div className="w-1 bg-[#EE3F2C]/30" />
                <p className="text-xs text-white/50 leading-relaxed italic">
                  Note: Changes are applied globally and saved instantly to your local profile. Calibration may affect tactical alignment in-game.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
