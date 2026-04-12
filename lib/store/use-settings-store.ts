import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HitEvent } from '../../components/game-components/engine/damage-system';

export enum GameMode {
  SPHERES = 'spheres',
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

interface SettingsState {
  weaponSettings: WeaponSettings;
  sensitivity: number;
  fov: number;
  tracersEnabled: boolean;
  crouchMode: 'hold' | 'toggle';
  gameMode: GameMode;
  sessionHits: HitEvent[];
  
  // Actions
  toggleTracers: () => void;
  setCrouchMode: (mode: 'hold' | 'toggle') => void;
  setGameMode: (mode: GameMode) => void;
  addSessionHit: (hit: HitEvent) => void;
  clearSessionHits: () => void;
  updateWeaponSettings: (settings: Partial<WeaponSettings>) => void;
  updateSensitivity: (sens: number) => void;
  updateFOV: (fov: number) => void;
  resetWeaponSettings: () => void;
}

const defaultWeaponSettings: WeaponSettings = {
  x: 0.15,
  y: -0.4,
  z: -0.6,
  yaw: -0.25,
  pitch: 0.15,
  scale: 1.1,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weaponSettings: { ...defaultWeaponSettings },
      sensitivity: 2.0,
      fov: 90,
      tracersEnabled: true,
      crouchMode: 'hold',
      gameMode: GameMode.SPHERES,
      sessionHits: [],

      updateWeaponSettings: (newSettings) =>
        set((state) => ({
          weaponSettings: { ...state.weaponSettings, ...newSettings },
        })),

      updateSensitivity: (sensitivity) => set({ sensitivity }),
      
      updateFOV: (fov) => set({ fov }),

      toggleTracers: () => set((state) => ({ tracersEnabled: !state.tracersEnabled })),
      setCrouchMode: (mode) => set({ crouchMode: mode }),
      setGameMode: (mode) => set({ gameMode: mode }),
      addSessionHit: (hit) => set((state) => ({ sessionHits: [...state.sessionHits, hit] })),
      clearSessionHits: () => set({ sessionHits: [] }),

      resetWeaponSettings: () =>
        set({ weaponSettings: { ...defaultWeaponSettings } }),
    }),
    {
      name: 'aimgravity-settings', // name of the item in storage (must be unique)
    }
  )
);
