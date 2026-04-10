'use client';

import { useEffect, useRef, useState } from 'react';
import { Engine, GameState } from './engine/engine';
import { loadGLB } from './engine/loaders/glb-loader';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;
    
    // Initialize engine
    const engine = new Engine(canvasRef.current, { drillDuration: 30, sensitivity: 2, targetSize: 0.5 });
    
    // Load the Glock model
    const initEngine = async () => {
      try {
        const glock = await loadGLB('/models/Glock.glb');
        engine.setWeaponGeometry(glock);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load Glock model:", err);
        setIsLoading(false); // Still allow game to play with box if model fails
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
