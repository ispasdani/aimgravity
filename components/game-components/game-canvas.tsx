'use client';

import { useEffect, useRef, useState } from 'react';
import { Engine, GameState } from './engine/engine';
import { loadGLB } from './engine/loaders/glb-loader';
import { useSettingsStore } from '@/lib/store/use-settings-store';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  
  const { weaponSettings, fov, sensitivity } = useSettingsStore();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [engineReady, setEngineReady] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [pointerLockDenied, setPointerLockDenied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;
    
    // Initialize engine with saved settings
    const engine = new Engine(canvasRef.current, { 
      drillDuration: 30, 
      sensitivity, 
      fov 
    });

    // Apply weapon settings
    engine.weaponOffset = [weaponSettings.x, weaponSettings.y, weaponSettings.z];
    engine.weaponRotation = [weaponSettings.yaw, weaponSettings.pitch, 0];
    engine.weaponScale = weaponSettings.scale;

    let isMounted = true;

    // Load the Glock model
    const initEngine = async () => {
      try {
        console.log("[Quickplay] Starting asset load for Glock...");
        const glock = await loadGLB('/models/Glock.glb');
        
        if (isMounted) {
          engine.setWeaponGeometry(glock);
          setIsLoading(false);
          setEngineReady(true);
          console.log("[Quickplay] Glock assets loaded successfully.");
        }
      } catch (err) {
        console.error("Failed to load Glock model:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    initEngine();
    
    engine.setStateUpdateCallback((state) => {
      setGameState(state);
    });
    
    engine.setGameEndCallback((finalState) => {
      setGameState(finalState);
      setIsFinished(true);
      setIsPointerLocked(false);
      document.exitPointerLock();
    });

    engine.setPointerLockErrorCallback(() => {
      setPointerLockDenied(true);
      // Auto-clear denial after a few seconds to encourage another click
      setTimeout(() => setPointerLockDenied(false), 3000);
    });

    // We also need to sync the React state with the Engine's locked status
    const syncLockState = () => {
      setIsPointerLocked(document.pointerLockElement === canvasRef.current);
      if (document.pointerLockElement === canvasRef.current) {
        setPointerLockDenied(false);
      }
    };

    document.addEventListener('pointerlockchange', syncLockState);

    engineRef.current = engine;
    
    return () => {
      isMounted = false;
      document.removeEventListener('pointerlockchange', syncLockState);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleStart = () => {
    if (engineRef.current && !hasStarted && !isLoading) {
      engineRef.current.start();
      setHasStarted(true);
      setIsFinished(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
        onClick={() => {
          if (!hasStarted && !isFinished) {
            handleStart();
          } else if (engineRef.current && hasStarted && !isFinished && !isPointerLocked) {
             engineRef.current.requestPointerLock();
          }
        }}
      />
      
      {!hasStarted && !isFinished && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50 backdrop-blur-sm">
          <div className="text-center p-12 bg-[#0A0A0A] border border-white/10 rounded-sm pointer-events-auto max-w-md w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EE3F2C]/10 border border-[#EE3F2C]/30 text-[#EE3F2C] text-[10px] font-bold uppercase tracking-widest mb-6">
              System Ready
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-4">Tactical Drill</h1>
            <p className="text-white/40 text-sm uppercase tracking-widest mb-8 leading-relaxed">
              Click to initialize neural link and begin target acquisition course.
            </p>
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[#EE3F2C] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Loading Assets...</span>
              </div>
            ) : (
              <button 
                onClick={handleStart}
                className="w-full bg-[#EE3F2C] hover:bg-red-600 text-white py-4 font-bold uppercase text-sm tracking-widest transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
              >
                Engage Drill
              </button>
            )}
          </div>
        </div>
      )}

      {isFinished && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/80 backdrop-blur-md">
          <div className="text-center p-12 bg-[#0A0A0A] border border-white/10 rounded-sm pointer-events-auto max-w-sm w-full">
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8">Drill Complete</h1>
            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="p-4 bg-white/5 border border-white/5">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Hits</p>
                <p className="text-3xl font-bold">{gameState?.hits || 0}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/5">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Accuracy</p>
                <p className="text-3xl font-bold">{gameState?.accuracy.toFixed(1)}%</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setHasStarted(false);
                setIsFinished(false);
                // Reduced timeout and ensuring it feels continuous
                setTimeout(handleStart, 10);
              }}
              className="w-full bg-white text-black hover:bg-white/90 py-4 font-bold uppercase text-sm tracking-widest transition-all duration-300"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
            >
              Restart Session
            </button>
          </div>
        </div>
      )}

      {hasStarted && !isFinished && gameState && (
        <>
          <div className="absolute top-8 left-8 right-8 flex justify-between pointer-events-none select-none">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Remaining Time</div>
              <div className="text-3xl font-mono font-bold">{(gameState.timeRemaining || 0).toFixed(1)}<span className="text-xs text-white/20 ml-1">SEC</span></div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Current Score</div>
              <div className="text-3xl font-mono font-bold text-[#EE3F2C]">{gameState.hits}</div>
            </div>
          </div>

          {!isPointerLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group">
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-[9px] font-bold uppercase tracking-widest mb-4 group-hover:bg-[#EE3F2C]/20 group-hover:border-[#EE3F2C]/30 group-hover:text-[#EE3F2C] transition-colors">
                  Neural Link Severed
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Sync Required</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">
                  {pointerLockDenied 
                    ? "Link Refused - Wait 1s and click to retry" 
                    : "Click anywhere to re-engage aim lock"}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
