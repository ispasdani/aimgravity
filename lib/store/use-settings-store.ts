import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HitEvent } from '../../components/game-components/engine/damage-system';

export enum GameMode {
  SPHERES = 'spheres',
  MOVING_SPHERES = 'moving_spheres',
  FLICK = 'flick',
  MANNEQUIN_ONE_SHOT = 'mannequin_one_shot',
  MANNEQUIN_DAMAGE = 'mannequin_damage'
}

export interface WeaponSettings {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  scale: number;
}

export interface CrosshairSettings {
  size: number;
  thickness: number;
  gap: number;
  dot: boolean;
  outline: boolean;
  outlineThickness: number;
  color: string;
  alpha: number;
}

interface SettingsState {
  weaponSettings: WeaponSettings;
  crosshairSettings: CrosshairSettings;
  sensitivity: number;
  fov: number;
  tracersEnabled: boolean;
  crouchMode: 'hold' | 'toggle';
  gameMode: GameMode;
  sessionHits: HitEvent[];
  /** Speed (world units/s) of spheres in Moving Spheres mode */
  sphereSpeed: number;
  /** Minimum angular displacement (degrees) between flick targets */
  flickMinAngle: number;

  // Actions
  toggleTracers: () => void;
  setCrouchMode: (mode: 'hold' | 'toggle') => void;
  setGameMode: (mode: GameMode) => void;
  addSessionHit: (hit: HitEvent) => void;
  clearSessionHits: () => void;
  updateWeaponSettings: (settings: Partial<WeaponSettings>) => void;
  updateCrosshairSettings: (settings: Partial<CrosshairSettings>) => void;
  updateSensitivity: (sens: number) => void;
  updateFOV: (fov: number) => void;
  updateSphereSpeed: (speed: number) => void;
  updateFlickMinAngle: (angle: number) => void;
  resetWeaponSettings: () => void;
  resetCrosshairSettings: () => void;
}

const defaultWeaponSettings: WeaponSettings = {
  x: 0.15,
  y: -0.4,
  z: -0.6,
  yaw: -0.25,
  pitch: 0.15,
  scale: 1.1,
};

const defaultCrosshairSettings: CrosshairSettings = {
  size: 4,
  thickness: 1.5,
  gap: 1.0,
  dot: false,
  outline: true,
  outlineThickness: 1.0,
  color: '#00FF00',
  alpha: 1.0,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weaponSettings: { ...defaultWeaponSettings },
      crosshairSettings: { ...defaultCrosshairSettings },
      sensitivity: 2.0,
      fov: 90,
      tracersEnabled: true,
      crouchMode: 'hold',
      gameMode: GameMode.SPHERES,
      sessionHits: [],
      sphereSpeed: 2.5,
      flickMinAngle: 45,

      updateWeaponSettings: (newSettings) =>
        set((state) => ({
          weaponSettings: { ...state.weaponSettings, ...newSettings },
        })),

      updateCrosshairSettings: (newSettings) =>
        set((state) => ({
          crosshairSettings: { ...state.crosshairSettings, ...newSettings },
        })),

      updateSensitivity: (sensitivity) => set({ sensitivity }),
      
      updateFOV: (fov) => set({ fov }),

      updateSphereSpeed: (sphereSpeed) => set({ sphereSpeed }),

      updateFlickMinAngle: (flickMinAngle) => set({ flickMinAngle }),

      toggleTracers: () => set((state) => ({ tracersEnabled: !state.tracersEnabled })),
      setCrouchMode: (mode) => set({ crouchMode: mode }),
      setGameMode: (mode) => set({ gameMode: mode }),
      addSessionHit: (hit) => set((state) => ({ sessionHits: [...state.sessionHits, hit] })),
      clearSessionHits: () => set({ sessionHits: [] }),

      resetWeaponSettings: () =>
        set({ weaponSettings: { ...defaultWeaponSettings } }),
      
      resetCrosshairSettings: () =>
        set({ crosshairSettings: { ...defaultCrosshairSettings } }),
    }),
    {
      name: 'aimgravity-settings', // name of the item in storage (must be unique)
    }
  )
);
