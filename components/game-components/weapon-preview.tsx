'use client';

import { useEffect, useRef, useState } from 'react';
import { Engine } from './engine/engine';
import { loadGLB } from './engine/loaders/glb-loader';
import { useSettingsStore } from '@/lib/store/use-settings-store';

export default function WeaponPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const weaponSettings = useSettingsStore((state) => state.weaponSettings);
  const fov = useSettingsStore((state) => state.fov);

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;
    
    // Initialize engine in preview mode
    const engine = new Engine(canvasRef.current, { fov });
    engine.previewMode = true;
    let isMounted = true;

    // Load the Glock model
    const initEngine = async () => {
      try {
        const glock = await loadGLB('/models/Glock.glb');
        if (isMounted) {
          engine.setWeaponGeometry(glock);
          setIsLoading(false);
          // Start the render loop even in preview mode
          engine.running = true;
          engine.lastTime = performance.now();
          engine.loop();
        }
      } catch (err) {
        console.error("Failed to load preview assets:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    initEngine();
    engineRef.current = engine;
    
    return () => {
      isMounted = false;
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync weapon settings to engine in real-time
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.weaponOffset = [weaponSettings.x, weaponSettings.y, weaponSettings.z];
      engineRef.current.weaponRotation = [weaponSettings.yaw, weaponSettings.pitch, 0];
      engineRef.current.weaponScale = weaponSettings.scale;
    }
  }, [weaponSettings]);

  // Sync FOV
  useEffect(() => {
     if (engineRef.current) {
        engineRef.current.updateSettings({ fov });
     }
  }, [fov]);

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#EE3F2C] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Recalibrating Lens...</span>
          </div>
        </div>
      )}

      {/* Grid Overlay for alignment */}
      <div className="absolute inset-0 pointer-events-none border border-white/5">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5" />
      </div>
    </div>
  );
}
