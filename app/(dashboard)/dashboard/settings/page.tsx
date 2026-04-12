'use client';

import React, { useState } from 'react';
import { 
  Crosshair, 
  RotateCcw, 
  Settings, 
  Maximize2, 
  Move, 
  Rotate3d,
  Layers,
  MonitorSmartphone,
  MousePointer2,
  TerminalSquare,
  Copy
} from 'lucide-react';
import { useSettingsStore, WeaponSettings, CrosshairSettings } from '@/lib/store/use-settings-store';
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
        {value.toFixed(step < 1 ? 2 : 0)}
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

type TabType = 'crosshair' | 'weapon' | 'general';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('crosshair');
  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const { 
    weaponSettings, 
    crosshairSettings,
    updateWeaponSettings, 
    updateCrosshairSettings,
    resetWeaponSettings,
    resetCrosshairSettings,
    fov,
    updateFOV,
    sensitivity,
    updateSensitivity,
    tracersEnabled,
    toggleTracers,
    crouchMode,
    setCrouchMode,
    sphereSpeed,
    updateSphereSpeed,
    flickMinAngle,
    updateFlickMinAngle
  } = useSettingsStore();

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

  const handleReset = () => {
    if (activeTab === 'weapon') resetWeaponSettings();
    if (activeTab === 'crosshair') resetCrosshairSettings();
    // For general we don't have a specific reset button yet, but can add one
  };

  const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 255;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return { r, g, b };
  };

  const generateCS2Config = () => {
    const { r, g, b } = hexToRGB(crosshairSettings.color);
    let str = `cl_crosshairstyle 4; cl_crosshairsize ${crosshairSettings.size}; cl_crosshairthickness ${crosshairSettings.thickness}; cl_crosshairgap ${crosshairSettings.gap}; cl_crosshairdot ${crosshairSettings.dot ? 1 : 0}; cl_crosshair_drawoutline ${crosshairSettings.outline ? 1 : 0}; cl_crosshairalpha ${Math.round(crosshairSettings.alpha * 255)}; cl_crosshaircolor 5; cl_crosshaircolor_r ${r}; cl_crosshaircolor_g ${g}; cl_crosshaircolor_b ${b};`;
    if (crosshairSettings.outline) {
      str += ` cl_crosshair_outlinethickness ${crosshairSettings.outlineThickness};`;
    }
    return str;
  };

  const handleCopyCS2 = async () => {
    await navigator.clipboard.writeText(generateCS2Config());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Settings size={12} />
            System Configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">
            Game Settings
          </h1>
        </div>
        
        <div className="flex gap-3">
          {(activeTab === 'weapon' || activeTab === 'crosshair') && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-white/50 font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white transition-all duration-300"
              style={clipPathStyle}
            >
              <RotateCcw size={14} />
              Reset {activeTab}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Custom Tabs Navigation */}
          <div className="flex border-b border-white/10">
            <button 
              onClick={() => setActiveTab('crosshair')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'crosshair' ? 'border-[#EE3F2C] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              <Crosshair size={14} className="inline-block mr-2" />
              Crosshair
            </button>
            <button 
              onClick={() => setActiveTab('weapon')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'weapon' ? 'border-[#EE3F2C] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              <Rotate3d size={14} className="inline-block mr-2" />
              Weapon
            </button>
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'general' ? 'border-[#EE3F2C] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              <MonitorSmartphone size={14} className="inline-block mr-2" />
              General
            </button>
          </div>

          <div className="min-h-[500px]">
            {activeTab === 'crosshair' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <section className="bg-white/[0.02] border border-white/5 p-8" style={clipPathStyle}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#EE3F2C]/10 border border-[#EE3F2C]/20 text-[#EE3F2C]">
                        <Crosshair size={16} />
                      </div>
                      <h2 className="text-sm font-bold uppercase tracking-widest">Crosshair Shape</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <Slider 
                      label="Length" 
                      value={crosshairSettings.size} 
                      min={0} max={20} step={0.5} 
                      onChange={(v) => updateCrosshairSettings({ size: v })} 
                    />
                    <Slider 
                      label="Thickness" 
                      value={crosshairSettings.thickness} 
                      min={0.5} max={10} step={0.5} 
                      onChange={(v) => updateCrosshairSettings({ thickness: v })} 
                    />
                    <Slider 
                      label="Gap" 
                      value={crosshairSettings.gap} 
                      min={-10} max={20} step={0.5} 
                      onChange={(v) => updateCrosshairSettings({ gap: v })} 
                    />
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Center Dot</span>
                        <button 
                          onClick={() => updateCrosshairSettings({ dot: !crosshairSettings.dot })}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out ${crosshairSettings.dot ? 'bg-[#EE3F2C]' : 'bg-white/10'}`}
                        >
                          <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${crosshairSettings.dot ? 'translate-x-2' : '-translate-x-2'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Outline</span>
                        <button 
                          onClick={() => updateCrosshairSettings({ outline: !crosshairSettings.outline })}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out ${crosshairSettings.outline ? 'bg-[#EE3F2C]' : 'bg-white/10'}`}
                        >
                          <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${crosshairSettings.outline ? 'translate-x-2' : '-translate-x-2'}`} />
                        </button>
                      </div>
                    </div>

                    {crosshairSettings.outline && (
                      <div className="pt-2">
                        <Slider 
                          label="Outline Thickness" 
                          value={crosshairSettings.outlineThickness} 
                          min={0.5} max={5} step={0.5} 
                          onChange={(v) => updateCrosshairSettings({ outlineThickness: v })} 
                        />
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white/[0.02] border border-white/5 p-8" style={clipPathStyle}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#EE3F2C]/10 border border-[#EE3F2C]/20 text-[#EE3F2C]">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-blue-500" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest">Color & Opacity</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Reticle Color</span>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-mono text-white/50">{crosshairSettings.color.toUpperCase()}</span>
                         <label className="cursor-pointer">
                           <input 
                             type="color" 
                             value={crosshairSettings.color}
                             onChange={(e) => updateCrosshairSettings({ color: e.target.value })}
                             className="w-8 h-8 rounded shrink-0 bg-transparent border-0 p-0 cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                           />
                         </label>
                      </div>
                    </div>

                    <Slider 
                      label="Opacity (Alpha)" 
                      value={crosshairSettings.alpha} 
                      min={0.1} max={1} step={0.05} 
                      onChange={(v) => updateCrosshairSettings({ alpha: v })} 
                    />
                  </div>
                </section>

                <section className="bg-white/[0.02] border border-white/5 p-8" style={clipPathStyle}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-white/50">
                      <TerminalSquare size={16} />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest">CS2 Export</h2>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#EE3F2C]/50 to-transparent" />
                    <div className="bg-black/50 border border-white/5 p-4 rounded-sm">
                      <p className="font-mono text-xs text-white/40 whitespace-pre-wrap break-all leading-relaxed">
                        {generateCS2Config()}
                      </p>
                    </div>
                    <button 
                      onClick={handleCopyCS2}
                      className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-colors"
                      title="Copy to Clipboard"
                    >
                      {copySuccess ? <span className="text-[10px] font-bold text-[#EE3F2C] uppercase px-1">Copied</span> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 uppercase mt-3 tracking-widest text-center">
                    Paste this into your CS2 developer console
                  </p>
                </section>
              </div>
            )}

            {activeTab === 'weapon' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
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
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
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
                          <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tracersEnabled ? 'translate-x-2' : '-translate-x-2'}`} />
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

                {/* Mode-specific settings */}
                <section className="bg-white/[0.02] border border-white/5 p-8" style={clipPathStyle}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#EE3F2C]/10 border border-[#EE3F2C]/20 text-[#EE3F2C]">
                      <MousePointer2 size={16} />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest">Mode Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <Slider
                      label="Moving Sphere Speed (u/s)"
                      value={sphereSpeed}
                      min={0.5}
                      max={10}
                      step={0.25}
                      onChange={updateSphereSpeed}
                    />
                    <Slider
                      label="Flick Min Angle (°)"
                      value={flickMinAngle}
                      min={15}
                      max={180}
                      step={5}
                      onChange={updateFlickMinAngle}
                    />
                  </div>
                </section>
              </div>
            )}
          </div>
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
