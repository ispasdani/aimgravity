'use client';

import { useEffect, useRef, useState } from 'react';
import { Engine, GameState } from './engine/engine';
import { loadGLB } from './engine/loaders/glb-loader';

interface WeaponParams {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  scale: number;
}

const WeaponDebugger = ({ engine }: { engine: Engine }) => {
  const [params, setParams] = useState<WeaponParams>({
    x: engine.weaponOffset[0],
    y: engine.weaponOffset[1],
    z: engine.weaponOffset[2],
    yaw: engine.weaponRotation[0],
    pitch: engine.weaponRotation[1],
    scale: engine.weaponScale,
  });

  const update = (newParams: Partial<WeaponParams>) => {
    const p = { ...params, ...newParams };
    setParams(p);
    engine.weaponOffset = [p.x, p.y, p.z];
    engine.weaponRotation = [p.yaw, p.pitch, 0];
    engine.weaponScale = p.scale;
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/60 backdrop-blur-md p-6 rounded-xl border border-white/10 text-white w-72 shadow-2xl space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-2">Weapon Adjuster</h3>
      
      <div className="space-y-3">
        {[
          { label: 'X (Left/Right)', key: 'x', min: -1, max: 1, step: 0.01 },
          { label: 'Y (Up/Down)', key: 'y', min: -1, max: 1, step: 0.01 },
          { label: 'Z (Forward)', key: 'z', min: -2, max: 0, step: 0.01 },
          { label: 'Yaw (Tilt Y)', key: 'yaw', min: -Math.PI, max: Math.PI, step: 0.01 },
          { label: 'Pitch (Tilt X)', key: 'pitch', min: -Math.PI, max: Math.PI, step: 0.01 },
          { label: 'Scale', key: 'scale', min: 0.1, max: 5.0, step: 0.1 },
        ].map((s) => (
          <div key={s.key} className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-white/50">
              <span>{s.label}</span>
              <span className="text-white">{(params as any)[s.key].toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={(params as any)[s.key]}
              onChange={(e) => update({ [s.key]: parseFloat(e.target.value) })}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 p-2 bg-black/40 rounded border border-white/5 font-mono text-[9px] select-all">
        {`[${params.x.toFixed(2)}, ${params.y.toFixed(2)}, ${params.z.toFixed(2)}]`} <br/>
        {`[${params.yaw.toFixed(2)}, ${params.pitch.toFixed(2)}, 0]`}
      </div>
    </div>
  );
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;
    
    // Initialize engine
    const engine = new Engine(canvasRef.current, { drillDuration: 30, sensitivity: 2, targetSize: 0.5 });
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
      document.exitPointerLock();
    });

    engineRef.current = engine;
    
    return () => {
      isMounted = false;
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
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {engineReady && engineRef.current && <WeaponDebugger engine={engineRef.current} />}
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
        onClick={() => {
          if (!hasStarted && !isFinished) {
            handleStart();
          } else if (engineRef.current && hasStarted && !isFinished) {
             engineRef.current.canvas.requestPointerLock();
          }
        }}
      />
      
      {!hasStarted && !isFinished && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50">
          <div className="text-center p-8 bg-zinc-900 rounded-xl border border-zinc-800 pointer-events-auto">
            <h1 className="text-3xl font-bold mb-4">Aim Training</h1>
            <p className="text-zinc-400 mb-6">Click anywhere to start the 30s drill.</p>
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 text-red-500 font-medium">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                Loading Models...
              </div>
            ) : (
              <button 
                onClick={handleStart}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      )}

      {isFinished && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/80">
          <div className="text-center p-8 bg-zinc-900 rounded-xl border border-zinc-800 pointer-events-auto">
            <h1 className="text-3xl font-bold mb-4">Drill Complete</h1>
            <div className="flex gap-8 mb-8">
              <div className="text-center">
                <p className="text-zinc-400 text-sm">Hits</p>
                <p className="text-4xl font-bold">{gameState?.hits || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-zinc-400 text-sm">Accuracy</p>
                <p className="text-4xl font-bold">{gameState?.accuracy.toFixed(1)}%</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setHasStarted(false);
                setIsFinished(false);
                setTimeout(handleStart, 100);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {hasStarted && !isFinished && gameState && (
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none text-white drop-shadow-md">
          <div className="text-2xl font-mono opacity-80">
            Time: {(gameState.timeRemaining || 0).toFixed(1)}s
          </div>
          <div className="text-2xl font-mono text-red-500 font-bold">
            Score: {gameState.hits}
          </div>
        </div>
      )}
    </div>
  );
}
